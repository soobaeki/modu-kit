import { AppError } from "./app-error";

// 401: 아이디/비밀번호 불일치
export class InvalidCredentialsError extends AppError {
  constructor(message: string, provider?: string) {
    super(message, 401, "INVALID_CREDENTIALS", provider);
  }
}

// 502: 외부 백엔드 API 서버 응답 없음/터짐
export class ExternalServerError extends AppError {
  constructor(message: string, provider?: string) {
    super(message, 502, "EXTERNAL_SERVER_ERROR", provider);
  }
}
