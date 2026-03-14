import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { ApiError } from "@/types/api.types";

const API_BASE_URL = "http://localhost:5000";
const AUTH_STORAGE_KEY = "tabeebak_auth";
const IS_DEV = import.meta.env.DEV;

const debugLog = (tag: string, payload: unknown) => {
  if (!IS_DEV) return;
  console.log(tag, payload);
};

const debugError = (tag: string, payload: unknown) => {
  if (!IS_DEV) return;
  console.error(tag, payload);
};

export const authStorageKey = AUTH_STORAGE_KEY;

export function getStoredToken(): string | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

type ApiAxiosRequestConfig = InternalAxiosRequestConfig & {
  requiresAuth?: boolean;
};

type ExtendedAxiosRequestConfig = AxiosRequestConfig & {
  requiresAuth?: boolean;
};

export type RequestOptions = Omit<AxiosRequestConfig, "url" | "data" | "auth"> & {
  body?: unknown;
  auth?: boolean;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config: ApiAxiosRequestConfig) => {
  const token = getStoredToken();

  if (config.requiresAuth && token) {
    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("Authorization", `Bearer ${token}`);

    debugLog("[AUTH]", {
      message: "Authorization header attached",
      url: `${config.baseURL ?? ""}${config.url ?? ""}`,
      tokenPreview: `${token.slice(0, 8)}...`,
    });
  } else if (config.requiresAuth && !token) {
    debugError("[AUTH]", {
      message: "Authenticated request without token",
      url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    });
  }

  debugLog("[API REQUEST]", {
    url: `${config.baseURL ?? ""}${config.url ?? ""}`,
    method: (config.method ?? "GET").toUpperCase(),
    body: config.data,
    headers: config.headers,
  });

  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    debugLog("[API RESPONSE]", {
      url: `${response.config.baseURL ?? ""}${response.config.url ?? ""}`,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const requestUrl = `${error.config?.baseURL ?? ""}${error.config?.url ?? ""}`;

    if (!error.response) {
      const message = error.message || "Network error";

      debugError("[NETWORK ERROR]", {
        url: requestUrl,
        method: error.config?.method?.toUpperCase() ?? "UNKNOWN",
        error,
        message,
      });

      throw new ApiError({
        error: "NETWORK_ERROR",
        message,
        statusCode: 0,
      });
    }

    const errorCode = error.response.data?.error ?? "REQUEST_FAILED";
    const message =
      error.response.data?.message ??
      `Request failed with status ${error.response.status}`;

    debugError("[API ERROR]", {
      url: requestUrl,
      method: error.config?.method?.toUpperCase() ?? "UNKNOWN",
      status: error.response.status,
      error: errorCode,
      message,
      data: error.response.data,
    });

    throw new ApiError({
      error: errorCode,
      message,
      statusCode: error.response.status,
    });
  }
);

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, auth = false, method = "GET", ...rest } = options;
  const headers = AxiosHeaders.from(rest.headers);

  if (body instanceof FormData) {
    headers.delete("Content-Type");
  }

  const requestConfig: ExtendedAxiosRequestConfig = {
    url: path,
    method,
    data: body,
    headers,
    requiresAuth: auth,
    ...rest,
  };

  const response = await apiClient.request<T>(requestConfig);
  return response.data;
}
