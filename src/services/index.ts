import { AppError } from "@/src/error";
import { DirectDbProvider } from "./auth/providers/directDb";
import { ExternalApiProvider } from "./auth/providers/externalApi";
import { AuthPayload, AuthProvider } from "./auth/types";

class AuthService {
  private getProvider(): AuthProvider {
    // 1. 환경변수를 통해 어떤 인증 방식을 쓸지 결정합니다.
    const mode = process.env.AUTH_MODE || "db"; // "db", "api"

    // 2. 조건에 맞는 Provider 인스턴스를 반환합니다.
    switch (mode) {
      case "db":
        return new DirectDbProvider();
      case "api":
        return new ExternalApiProvider();
      default:
        return new DirectDbProvider();
    }
  }

  /**
   * 사용자 로그인을 처리합니다. 내부적으로 활성화된 Provider에게 인증을 위임합니다.
   *
   * @param username 로그인 아이디
   * @param password 로그인 비밀번호
   * @returns 인증 성공 시 AuthPayload, 실패 시 Custom Error 발생
   */
  async login(username: string, password: string): Promise<AuthPayload> {
    const provider = this.getProvider();

    // 에러 발생 시 출처를 남기기 위해 Provider 이름을 추출합니다.
    const providerName = provider.constructor.name;

    try {
      const user = await provider.authenticate(username, password);

      // Provider가 에러를 던지지 않고 null을 반환했을 경우 방어 코드
      if (!user) {
        throw new AppError(
          "아이디 또는 비밀번호가 일치하지 않습니다.",
          401,
          "INVALID_CREDENTIALS",
          providerName,
        );
      }

      return user;
    } catch (error) {
      // 이미 발생한 Custom AppError인 경우, 혹시 provider 정보가 빠져있다면 채워줍니다.
      if (error instanceof AppError) {
        if (!error.provider) {
          error.provider = providerName;
        }
        throw error;
      }

      // 예측 불가능한 서버/네트워크 에러 처리
      console.error(
        `[AuthService - ${providerName}] 로그인 처리 중 예기치 못한 오류:`,
        error,
      );
      throw new AppError(
        "로그인 처리 중 문제가 발생했습니다.",
        500,
        "INTERNAL_SERVER_ERROR",
        providerName,
      );
    }
  }
}

// 애플리케이션 전체에서 공유할 싱글톤(Singleton) 인스턴스로 내보냅니다.
export const authService = new AuthService();
