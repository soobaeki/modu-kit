/**
 * 애플리케이션 전체에서 사용하는 최상위 공통 에러 클래스입니다.
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_SERVER_ERROR",
    public provider?: string,
  ) {
    super(message);
    this.name = this.constructor.name;

    // V8 엔진에서 스택 트레이스 보존
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
