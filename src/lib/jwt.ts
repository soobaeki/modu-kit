import { AuthPayload } from "@/services/auth/types";
import jwt from "jsonwebtoken";

/**
 * [환경변수 검증 및 Fail-Fast 처리]
 * 서버 시작 시 JWT 비밀키가 .env에 정의되어 있지 않으면,
 * 취약한 기본값(fallback)으로 작동하는 대신 서버를 즉시 멈춰 보안 사고를 방지합니다.
 */
function getEnvVariable(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[FATAL ERROR] ${key} 환경변수가 .env에 설정되지 않았습니다. 서버를 실행할 수 없습니다.`,
    );
  }
  return value;
}

// getEnvVariable 헬퍼 함수를 통해 무조건 string 타입으로 안전하게 보장받습니다.
const JWT_ACCESS_SECRET = getEnvVariable("JWT_ACCESS_SECRET");
const JWT_REFRESH_SECRET = getEnvVariable("JWT_REFRESH_SECRET");

/**
 * 단기 인증용 Access Token 생성 (In-Memory 저장용)
 *
 * @param payload - 토큰에 포함될 최소한의 사용자 식별 정보 (비밀번호 등 민감정보 제외)
 * @returns 15분간 유효한 서명된 JWT Access Token 문자열
 */
export function generateAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });
}

/**
 * 장기 세션 유지용 Refresh Token 생성 (HttpOnly Cookie 저장용)
 *
 * @param payload - 사용자 PK(id) 값만 최소한으로 포함
 * @returns 7일간 유효한 서명된 JWT Refresh Token 문자열
 */
export function generateRefreshToken(payload: AuthPayload): string {
  // Refresh Token에는 최소한의 식별자(id)만 담아 보안 노출 위험을 최소화합니다.
  return jwt.sign({ id: payload.id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Access Token의 위변조 여부 및 만료 상태 검증
 *
 * @param token - Authorization 헤더 등에서 전달받은 Access Token
 * @returns 검증 성공 시 디코딩된 AuthPayload 객체
 * @throws {jwt.TokenExpiredError} 토큰이 만료된 경우 (Silent Refresh 대상)
 * @throws {jwt.JsonWebTokenError} 토큰 서명이 위변조되거나 형식이 잘못된 경우 (강제 로그아웃 대상)
 */
export function verifyAccessToken(token: string): AuthPayload {
  // try-catch 없이 바로 검증하여 실패 시 발생한 jwt 관련 예외를 호출부(Route Handler/Middleware)로 전파합니다.
  return jwt.verify(token, JWT_ACCESS_SECRET) as AuthPayload;
}

/**
 * Refresh Token의 위변조 여부 및 만료 상태 검증
 *
 * @param token - HttpOnly Cookie에서 추출한 Refresh Token
 * @returns 검증 성공 시 유저 식별자({ id: string })
 * @throws {jwt.TokenExpiredError} Refresh Token이 만료된 경우 (재로그인 필요)
 * @throws {jwt.JsonWebTokenError} Refresh Token이 위변조되거나 오염된 경우 (세션 파기 필요)
 */
export function verifyRefreshToken(token: string): { id: string } {
  // Refresh Token 검증 시에도 try-catch를 제거하여 상위 API 라우트(/api/auth/refresh 등)에서
  // 만료(401)와 위변조(403/401) 상황을 정확한 에러 타입으로 구별할 수 있도록 합니다.
  return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };
}
