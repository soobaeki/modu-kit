import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresh Token 검증용 비밀키
 * - Edge Runtime 환경에 맞춰 TextEncoder로 Uint8Array 변환
 * - 실무 보안 규격에 따라 Access Key와 분리된 JWT_REFRESH_SECRET 환경변수 사용
 */
const getRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET 환경변수가 설정되지 않았습니다.");
  }
  return new TextEncoder().encode(secret);
};

/**
 * Next.js Edge Middleware
 *
 * [사용 목적]
 * 클라이언트(브라우저)에서 React 페이지 코드를 다운로드 받아 렌더링하기 전에,
 * 서버 최전방(Edge Network)에서 0.001초 만에 요청을 가로채어 접근 권한을 검증합니다.
 * 이를 통해 비인가 사용자의 관리자 페이지(UI/코드) 접근을 완벽히 차단합니다.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin 경로 보호
  if (pathname.startsWith("/admin")) {
    // 사용자의 브라우저 쿠키에서 HttpOnly Refresh Token 추출
    const refreshToken = request.cookies.get("refreshToken")?.value;

    // 토큰 쿠키가 아예 없는 경우 -> 미인증 사용자로 판단하여 즉시 차단
    if (!refreshToken) {
      const loginUrl = new URL("/login", request.url);

      // 로그인 후 원래 가려던 주소로 돌아올 수 있도록 callbackUrl 저장
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // jose 패키지를 활용한 빠른 JWT 암호화 서명 및 만료일 검증
      await jwtVerify(refreshToken, getRefreshSecret());

      // 검증 성공 시 요청을 원래 가려던 /admin 페이지로 통과시킴
      return NextResponse.next();
    } catch {
      // [예외 처리] 토큰 변조, 서명 불일치, 만료 등으로 검증 실패 시
      const response = NextResponse.redirect(new URL("/login", request.url));

      // 보안을 위해 변조되었거나 만료된 쿠키를 브라우저에서 즉시 삭제
      response.cookies.delete("refreshToken");
      return response;
    }
  }

  // /admin 이외의 일반 경로(메인 페이지 등)는 검사 없이 그대로 통과
  return NextResponse.next();
}

/**
 * [Middleware가 적용될 경로 지정]
 * - matcher에 등록된 경로로 접속할 때만 위의 middleware 함수가 동작합니다.
 * - 현재 설정: /admin 및 /admin/하위_모든_경로
 * - 추후 보호할 경로가 늘어나면 배열에 추가 가능 (예: ["/admin/:path*", "/mypage/:path*"])
 */
export const config = {
  matcher: ["/admin/:path*"],
};
