import { AuthPayload, AuthProvider, AuthRecord } from "../types";

/**
 * 테스트 및 MOCK 환경용 가짜 데이터베이스
 * AuthRecord(passwordHash 포함) 타입을 재사용하여 DB 스키마와 규격을 통일합니다.
 */
export const MOCK_USERS: Record<string, AuthRecord> = {
  admin: {
    id: "usr_1",
    userId: "admin",
    passwordHash:
      "2c69702edadb8e7ba3beb7ce873296d3:697a479d697970939afcd89db5ff20923398de031611d8988ea0ff24298896b236057f8e739e7004438065919a81d1c749d9a2eaeb1e810f320e36a0d7c8ba8f",
    name: "관리자",
    role: "ADMIN",
  },
  user: {
    id: "usr_2",
    userId: "user1",
    passwordHash:
      "2c69702edadb8e7ba3beb7ce873296d3:697a479d697970939afcd89db5ff20923398de031611d8988ea0ff24298896b236057f8e739e7004438065919a81d1c749d9a2eaeb1e810f320e36a0d7c8ba8f",
    name: "일반유저",
    role: "USER",
  },
};

export class MockAuthProvider implements AuthProvider {
  /**
   * MOCK 로그인 인증 처리
   */
  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthPayload | null> {
    const scenario = process.env.MOCK_AUTH_SCENARIO || "SUCCESS";

    if (scenario === "FAIL") return null;

    // 유저 조회
    const target = Object.values(MOCK_USERS).find((u) => u.userId === username);
    if (!target) return null;

    // 비밀번호 검증
    if (password !== "password123!") {
      return null;
    }

    const userPayload: Partial<typeof target> = { ...target };
    delete userPayload.passwordHash;

    return userPayload as AuthPayload;
  }

  /**
   * MOCK Refresh Token 연동용 유저 조회
   */
  async findUserById(id: string): Promise<AuthPayload | null> {
    const scenario = process.env.MOCK_AUTH_SCENARIO || "SUCCESS";

    if (scenario === "USER_NOT_FOUND") return null;

    const target = Object.values(MOCK_USERS).find((u) => u.id === id);
    if (!target) return null;

    const userPayload: Partial<typeof target> = { ...target };
    delete userPayload.passwordHash;

    return userPayload as AuthPayload;
  }
}
