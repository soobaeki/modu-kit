export type AuthRole = "ADMIN" | "USER";

/**
 * 로그인 성공 응답 및 JWT 서명/디코딩에 사용되는 인증 전용 Payload
 */
export interface AuthPayload {
  id: string; // 유저 식별자 (JWT sub)
  userId: string; // 로그인 아이디
  name: string; // 사용자 이름
  role: AuthRole; // 권한
}

/**
 * DB 직접 조회 시 사용되는 비밀번호 해시 포함 데이터
 */
export interface AuthRecord extends AuthPayload {
  passwordHash: string;
}

/**
 * 인증 데이터 공급자(Provider) 표준 규격
 */
export interface AuthProvider {
  authenticate(username: string, password: string): Promise<AuthPayload | null>;
  findUserById(id: string): Promise<AuthPayload | null>;
}
