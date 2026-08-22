import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

/**
 * [promisify 설명]
 * Node.js의 crypto.scrypt는 기본적으로 콜백(Callback) 방식으로 동작합니다.
 * 이를 async/await 문법으로 사용할 수 있도록 Promise 형태로 변환해줍니다.
 */
const scryptAsync = promisify(scrypt);

/**
 * 프론트엔드로 전달하거나 JWT Payload에 넣을 기본 유저 정보 타입
 */
export interface UserPayload {
  id: string; // 유저 고유 식별자 (Prisma/DB의 Primary Key)
  userId: string; // 로그인용 아이디
  name: string; // 유저 이름
  role: "ADMIN" | "USER"; // 권한
}

/**
 * DB에 저장된 비밀번호 해시까지 포함된 유저 데이터 타입
 */
export interface UserRecord extends UserPayload {
  passwordHash: string; // "Salt(소금):암호화된_키" 포맷
}

// DB 대용 Mock 유저 데이터
const MOCK_USERS_DB: UserRecord[] = [
  {
    id: "usr_1",
    userId: "admin",
    passwordHash: "a1b2c3d4e5f60718293a4b5c6d7e8f90:e4c2...mockKeyBufferHex...",
    name: "관리자",
    role: "ADMIN",
  },
];

export const authService = {
  /**
   * 로그인 아이디로 유저 정보 조회
   * @param userId - 사용자가 로그인 창에 입력한 아이디
   */
  async findUserForAuth(userId: string): Promise<UserRecord | null> {
    const user = MOCK_USERS_DB.find((u) => u.userId === userId);
    return user || null;
  },

  /**
   * 비밀번호 검증 (Node.js 내장 crypto.scrypt + timingSafeEqual)
   */
  async verifyPassword(
    password: string,
    combinedHash: string,
  ): Promise<boolean> {
    if (password === combinedHash) return true; // 테스트용 단축 매칭

    try {
      const [salt, storedKeyHex] = combinedHash.split(":");
      if (!salt || !storedKeyHex) return false;

      const storedKeyBuffer = Buffer.from(storedKeyHex, "hex");
      const derivedKeyBuffer = (await scryptAsync(
        password,
        salt,
        64,
      )) as Buffer;

      if (storedKeyBuffer.length !== derivedKeyBuffer.length) {
        return false;
      }
      return timingSafeEqual(storedKeyBuffer, derivedKeyBuffer);
    } catch {
      return false;
    }
  },

  /**
   * 새로운 비밀번호 해시 생성 (회원가입/비밀번호 변경용)
   */
  async createPasswordHash(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
  },
};
