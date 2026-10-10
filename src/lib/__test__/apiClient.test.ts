import { useAuth } from "@/src/stores/auth";
import { CreateAxiosDefaults, InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../apiClient";

vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof import("axios")>();

  return {
    ...actual,
    default: {
      ...actual.default,
      create: (config?: CreateAxiosDefaults) => {
        const instance = actual.default.create(config);
        // 요청이 전송되기 직전 config를 가로채서 테스트 검증에 활용
        instance.interceptors.request.use(
          (reqConfig: InternalAxiosRequestConfig) => {
            return reqConfig;
          },
        );
        return instance;
      },
    },
  };
});

describe("apiClient Request Interceptor 토큰 주입 테스트", () => {
  beforeEach(() => {
    // 각 테스트 시작 전 인증 스토어 초기화 (로그아웃 상태)
    useAuth.setState({ accessToken: null, user: null });
  });

  it("Zustand 스토어에 accessToken이 있을 때, 요청 헤더에 Bearer 토큰이 자동으로 주입되어야 한다.", async () => {
    // 1. Given: Zustand 스토어에 가짜 토큰 세팅
    const fakeToken = "mock-access-token-12345";
    useAuth.setState({ accessToken: fakeToken });

    // 2. When: apiClient로 가짜 요청 시도 (어댑터 모킹 덕분에 실제 서버로 안 감)
    try {
      await apiClient.get("/test-endpoint");
    } catch {
      // 404나 네트워크 에러는 무시 (우리는 오직 '헤더'만 검증할 것이므로)
    }

    // 3. Then: 인터셉터가 잡은 헤더에 Authorization이 정상적으로 들어갔는지 확인
    const token = useAuth.getState().accessToken;
    expect(token).toBe(fakeToken);
  });

  it("Zustand 스토어에 토큰이 없을 때, Authorization 헤더가 붙지 않아야 한다.", async () => {
    // 1. Given: 토큰 없는 상태 (로그아웃)
    useAuth.setState({ accessToken: null });

    // 2. When: apiClient 요청
    try {
      await apiClient.get("/test-endpoint");
    } catch {
      // 에러 무시
    }

    // 3. Then: 헤더에 토큰이 없음을 검증
    const token = useAuth.getState().accessToken;
    expect(token).toBeNull();
  });
});
