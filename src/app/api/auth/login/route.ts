import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// 실무용 비밀키 (환경변수가 없으면 에러 처리)
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-access-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // 1. 유저 인증 예시 (실무에서는 DB 연동 검증)
    if (username !== "admin" || password !== "1234") {
      return NextResponse.json(
        { message: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }

    const payload = { userId: "admin", name: "관리자", role: "ADMIN" };

    // 2. Access Token 발급 (수명 15분, In-Memory 관리용)
    const accessToken = jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });

    // 3. Refresh Token 발급 (수명 7일, HttpOnly Cookie 저장용)
    const refreshToken = jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });

    // 4. 응답 생성 (Body에는 accessToken만 전달)
    const response = NextResponse.json({
      message: "로그인 성공",
      accessToken,
      user: payload,
    });

    // 5. HttpOnly Cookie에 refreshToken 심기 (자바스크립트로 접근 불가 / 탈취 방지)
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7일 (초 단위)
    });

    return response;
  } catch {
    return NextResponse.json(
      { message: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
