import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAuth } from "../stores/auth";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  withCredentials: true, // HttpOnly Refresh Token 쿠키 전송을 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// flow
// isRefreshing check -> yes -> refresh api 호출
// isRefreshing check -> no  -> failedQueue 대기
// refresh 성공  check -> processQueue 시도
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

/**
 * request interceptor : 요청시 inMemory accessToken 자동 주입
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuth.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * response interceptor : 401 만료 시 silent refresh 요청 재시도
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 응답이 없거나 401 Unauthorized가 아닌 경우 그대로 에러 반환
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // 로그인이나 리프레시 자체 요청에서 401 경우 무한루프 방지
    const requestUrl = originalRequest.url || "";
    if (
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("api/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    // 이미 재시도한 경우 큐에 대기
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // 토큰 갱신 중인 경우 큐에 대기
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((error) => Promise.reject(error));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // 서버의 Silent Refresh 엔드포인트 호출 (HttpOnly 쿠키의 Refresh Token 자동 전송됨)
      const response = await axios.post(
        "/api/auth/refresh",
        {},
        { withCredentials: true },
      );
      const { accessToken, user } = response.data;

      // Zustand 스토어 상태 갱신
      useAuth.getState().setAccessToken(accessToken);
      if (user) {
        useAuth.getState().setAuth(accessToken, user);
      }

      // 대기 중인 다른 요청들에 새 토큰 전달
      processQueue(null, accessToken);

      // 현재 실패했던 원래 요청 재시도
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      // Refresh Token마저 만료되었거나 오류 발생 시 세션 파기 및 로그아웃 처리
      processQueue(refreshError, null);
      useAuth.getState().clearAuth();

      // 로그인 페이지로 리다이렉트 (클라이언트 환경일 때만)
      if (typeof window !== "undefined") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/login";
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
