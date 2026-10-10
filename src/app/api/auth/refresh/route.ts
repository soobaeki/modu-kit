import { generateAccessToken, verifyRefreshToken } from "@/src/lib/jwt";
import { authService } from "@/src/services";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 쿠키에서 Refresh Token 추출
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          code: "NO_REFRESH_TOKEN",
          message: "Refresh Token이 없습니다.",
        },
        { status: 401 },
      );
    }

    // Refresh Token 검증
    const decoded = verifyRefreshToken(refreshToken);

    // 유저 조회
    const user = await authService.findUserById(decoded.id);

    if (!user) {
      const response = NextResponse.json(
        {
          success: false,
          code: "USER_NOT_FOUND",
          message: "존재하지 않거나 비활성화된 사용자입니다.",
        },
        {
          status: 401,
        },
      );
      response.cookies.delete("refreshToken");
      return response;
    }

    // 3. 새로운 Access Token 발급
    const newAccessToken = generateAccessToken({
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        role: user.role,
      },
    });
  } catch {
    // Refresh Token이 만료되거나 변조된 경우
    const response = NextResponse.json(
      {
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "유효하지 않거나 만료된 Refresh Token입니다.",
      },
      { status: 401 },
    );

    // 쿠키 제거
    response.cookies.delete("refreshToken");
    return response;
  }
}
