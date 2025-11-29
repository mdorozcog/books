import { API_ENDPOINT } from './apiConfig';

export interface ApiError {
  error?: string;
  errors?: string[];
}


async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const error = (data as ApiError).error || (data as ApiError).errors?.join(", ") || "Request failed";
    throw new Error(error);
  }

  return data as T;
}

async function authenticatedRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  return request<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

export async function login<T>(email: string, password: string): Promise<T> {
  return request<T>("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(token: string): Promise<void> {
  await fetch(`${API_ENDPOINT}/logout`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

export function getStoredToken(): string | null {
  return localStorage.getItem("auth_token");
}

export function setStoredToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

export function removeStoredToken(): void {
  localStorage.removeItem("auth_token");
}

export async function register<TRequest, TResponse>(
  params: TRequest
): Promise<TResponse> {
  return request<TResponse>("/users", {
    method: "POST",
    body: JSON.stringify({ user: params }),
  });
}

export async function get<T>(endpoint: string): Promise<T> {
  return authenticatedRequest<T>(endpoint, { method: "GET" });
}

export async function post<TRequest, TResponse>(
  endpoint: string,
  body: TRequest,
  wrapperKey?: string
): Promise<TResponse> {
  const payload = wrapperKey ? { [wrapperKey]: body } : body;
  return authenticatedRequest<TResponse>(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function put<TRequest, TResponse>(
  endpoint: string,
  body: TRequest,
  wrapperKey?: string
): Promise<TResponse> {
  const payload = wrapperKey ? { [wrapperKey]: body } : body;
  return authenticatedRequest<TResponse>(endpoint, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function patch<TRequest, TResponse>(
  endpoint: string,
  body: TRequest,
  wrapperKey?: string
): Promise<TResponse> {
  const payload = wrapperKey ? { [wrapperKey]: body } : body;
  return authenticatedRequest<TResponse>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function del(endpoint: string): Promise<void> {
  return authenticatedRequest<void>(endpoint, { method: "DELETE" });
}



