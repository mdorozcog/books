const API_URL = import.meta.env.VITE_API_URL;
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH;

export const API_ENDPOINT = `${API_URL}${API_BASE_PATH}`;

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    roles: string[];
  };
  token: string;
}

interface ApiError {
  error: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_ENDPOINT}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || "Login failed");
  }

  return data as LoginResponse;
}

export async function logout(token: string): Promise<void> {
  const response = await fetch(`${API_ENDPOINT}/logout`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error((data as ApiError).error || "Logout failed");
  }
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

