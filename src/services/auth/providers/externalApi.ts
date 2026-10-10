import {
  AppError,
  ExternalServerError,
  InvalidCredentialsError,
} from "@/src/error";
import { AuthPayload, AuthProvider } from "../types";

/**
 * 외부 백엔드 API 서버(Spring Boot, NestJS, Express 등)에 HTTP 요청을 보내
 * 사용자 인증을 위임(Delegation) 처리하는 인증 데이터 공급자(Provider)입니다.
 *
 * Next.js 서버(API Route 또는 Server Action)가 중간 다리(Proxy) 역할을 하여
 * 외부 백엔드 인증 엔드포인트(/auth/login)를 호출합니다.
 */
export class ExternalApiProvider implements AuthProvider {
  /**
   * 사용자가 입력한 아이디와 비밀번호를 외부 백엔드 API로 전달하여 인가를 받습니다.
   *
   * @param username - 사용자가 로그인 창에 입력한 아이디
   * @param password - 사용자가 입력한 평문 비밀번호
   * @returns 인증 성공 시 표준 규격의 AuthPayload 반환, 실패/에러 시 null 반환
   */
  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthPayload | null> {
    const providerName = this.constructor.name; // "ExternalApiProvider"
    // 환경변수(.env)에서 외부 백엔드 API의 Base URL을 가져옵니다.
    const apiUrl = process.env.BACKEND_API_URL || process.env.DB_API_URL;

    // API URL 미설정 시
    if (!apiUrl) {
      throw new ExternalServerError(
        "백엔드 API URL이 설정되지 않았습니다.",
        providerName,
      );
    }

    try {
      // 외부 백엔드 서버의 로그인 엔드포인트로 POST 요청 전송
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        /**
         * Next.js Fetch Caching 방지 옵션
         * 인증 요청은 항상 실시간으로 수행되어야 하므로 Next.js의 서버 캐싱 기능을 비활성화합니다.
         */
        cache: "no-store",
      });

      // 비밀번호/아이디 불일치 (401, 403)
      if (response.status === 401 || response.status === 403) {
        throw new InvalidCredentialsError(
          "아이디 또는 비밀번호가 일치하지 않습니다.",
          providerName,
        );
      }

      // 백엔드 서버 응답 실패 (500대 등)
      if (!response.ok) {
        throw new ExternalServerError(
          `백엔드 인증 서버 오류 (HTTP ${response.status})`,
          providerName,
        );
      }

      //  백엔드에서 전달받은 JSON 응답 파싱
      const data = await response.json();

      /**
       * 응답 데이터 무결성 검증 (Data Validation)
       * 백엔드가 전달해준 JSON 데이터가 우리 서비스의 표준 AuthPayload 필수 필드(id, userId)를
       * 정상적으로 가지고 있는지 최소한으로 확인합니다.
       */
      if (!data || !data.id || !data.userId) {
        throw new ExternalServerError(
          "백엔드 응답 데이터 규격이 올바르지 않습니다.",
          providerName,
        );
      }

      // 프론트엔드 표준 AuthPayload 규격에 맞춰 안전하게 데이터 구조화 후 반환
      return {
        id: data.id,
        userId: data.userId,
        name: data.name ?? username, // 이름 데이터가 없을 경우 아이디로 대체
        role: data.role ?? "USER", // 권한 데이터가 없을 경우 기본 'USER' 부여
      };
    } catch (error) {
      // 이미 던져진 Error 메시지는 그대로 위로 전달
      if (error instanceof AppError) {
        throw error;
      }

      // 서버 다운, 네트워크 연결 끊김, CORS 에러 등 예외 상황 발생 시 서버 로그 출력 후 null 반환
      console.error("[ExternalApiProvider] 통신 오류:", error);
      throw new ExternalServerError(
        "백엔드 인증 서버와 통신할 수 없습니다.",
        providerName,
      );
    }
  }

  async findUserById(id: string): Promise<AuthPayload | null> {
    try {
      const response = await fetch(
        `${process.env.EXTERNAL_API_URL}/users/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) return null;

      const user = await response.json();
      return user;
    } catch (error) {
      console.error("[ExternalApiProvider] findUserById 실패:", error);
      return null;
    }
  }
}
