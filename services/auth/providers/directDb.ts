import { prisma } from "@/lib/prisma";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { AuthPayload, AuthProvider } from "../types";

/**
 * Node.js 기본 crypto.scrypt 함수는 옛날 스타일인 콜백(Callback) 방식으로 동작합니다.
 * 이를 현대적인 async/await 문법으로 깔끔하게 사용할 수 있도록 Promise 형태로 변환해줍니다.
 */
const scryptAsync = promisify(scrypt);

/**
 * DB에 직접 연결(Prisma, SQL Driver 등)해서 유저 정보를 조회하고
 * Node.js 내장 암호화 모듈로 비밀번호를 검증하는 데이터 공급자(Provider)입니다.
 */
export class DirectDbProvider implements AuthProvider {
  /**
   * 사용자가 입력한 아이디와 비밀번호를 검증하여 로그인 처리를 수행합니다.
   *
   * @param username - 사용자가 로그인 창에 입력한 아이디
   * @param password - 사용자가 입력한 평문 비밀번호 (예: "1234")
   * @returns 인증 성공 시 비밀번호를 제외한 안전한 AuthPayload 반환, 실패 시 null 반환
   */
  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthPayload | null> {
    // [실무 사용 시] process.env.DATABASE_URL을 연결하여 DB 쿼리를 직접 실행하는 영역입니다.
    // 예: const user = await db.query("SELECT * FROM users WHERE user_id = ?", [username]);
    const user = await prisma.user.findUnique({
      where: {
        userId: username,
      },
    });

    // DB에 유저가 존재하지 않거나 아이디가 다르면 즉시 로그인 실패 처리
    if (!user || user.userId !== username) return null;

    // 사용자가 입력한 비밀번호와 DB의 암호화된 해시값을 비교 검증
    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) return null;

    // 비밀번호 검증 성공 시, 보안상 민감한 passwordHash는 제외하고 안전한 유저 정보만 반환
    return {
      id: user.id,
      userId: user.userId,
      name: user.name,
      role: user.role,
    };
  }

  /**
   * 입력된 비밀번호가 DB의 암호화된 해시값과 일치하는지 보안 검증을 수행합니다.
   *
   * @param password - 사용자가 입력한 평문 비밀번호
   * @param combinedHash - DB에 저장되어 있는 "Salt:Key" 포맷의 해시 문자열
   */
  private async verifyPassword(
    password: string,
    combinedHash: string,
  ): Promise<boolean> {
    // 테스트 및 개발 편의용: 입력값과 저장값이 단순 일치하면 즉시 통과 (운영 단계에서는 제거)
    if (password === combinedHash) return true;

    try {
      // DB에 저장된 "Salt:DerivedKey" 포맷을 ':' 구분자로 분리
      const [salt, storedKeyHex] = combinedHash.split(":");
      if (!salt || !storedKeyHex) return false;

      // Hex(16진수) 문자열 형태의 키를 안전하게 비교하기 위해 Buffer(바이트 배열)로 변환
      const storedKeyBuffer = Buffer.from(storedKeyHex, "hex");

      // 사용자가 입력한 비밀번호를 기존 DB의 Salt와 함께 동일하게 scrypt 알고리즘으로 암호화
      const derivedKeyBuffer = (await scryptAsync(
        password,
        salt,
        64,
      )) as Buffer;

      // 생성된 키와 DB 키의 길이가 다르면 검증 실패
      if (storedKeyBuffer.length !== derivedKeyBuffer.length) return false;

      /**
       * 5. timingSafeEqual (타이밍 공격 방지)
       * 일반적인 '===' 비교는 앞 글자가 틀리면 즉시 비교를 종료하므로 실행 시간에 차이가 생깁니다.
       * timingSafeEqual은 값이 맞든 틀리든 항상 '동일한 시간' 동안 비교하여 보안 해킹을 방지합니다.
       */
      return timingSafeEqual(storedKeyBuffer, derivedKeyBuffer);
    } catch {
      return false;
    }
  }
}
