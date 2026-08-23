import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "로그아웃 성공" });

  // refreshToken 쿠키 즉시 만료 및 삭제
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}
