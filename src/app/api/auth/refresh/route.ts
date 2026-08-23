import jwt from "jsonwebtoken";
import { NextResponse, type NextRequest } from "next/server";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "fallback-access-secret";
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "fallback-refresh-secret";

export async function POST(request: NextRequest) {
  try {
    // 1. 쿠키에서 Refresh Token 추출
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh Token이 없습니다." },
        { status: 401 },
      );
    }

    // 2. Refresh Token 검증
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as jwt.JwtPayload;

    // 3. 새로운 Access Token 발급
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, name: decoded.name, role: decoded.role },
      ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    return NextResponse.json({
      accessToken: newAccessToken,
      user: { userId: decoded.userId, name: decoded.name, role: decoded.role },
    });
  } catch {
    // Refresh Token이 만료되거나 변조된 경우
    const response = NextResponse.json(
      { message: "유효하지 않거나 만료된 Refresh Token입니다." },
      { status: 401 },
    );
    // 쿠키 제거
    response.cookies.delete("refreshToken");
    return response;
  }
}
