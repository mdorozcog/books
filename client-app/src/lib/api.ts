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

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  copies: number;
  created_at: string;
  updated_at: string;
}

export async function fetchBooks(): Promise<Book[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/books`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || "Failed to fetch books");
  }

  return data as Book[];
}

export async function fetchBook(id: number): Promise<Book> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/books/${id}`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || "Failed to fetch book");
  }

  return data as Book;
}

export async function searchBooks(query: string): Promise<Book[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/books/search`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: query }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || "Failed to search books");
  }

  return data as Book[];
}

export interface CreateBookParams {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  copies: number;
}

export async function createBook(book: CreateBookParams): Promise<Book> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/books`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ book }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessages = data.errors || [data.error || "Failed to create book"];
    throw new Error(Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages);
  }

  return data as Book;
}

export async function updateBook(id: number, book: CreateBookParams): Promise<Book> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/books/${id}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ book }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessages = data.errors || [data.error || "Failed to update book"];
    throw new Error(Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages);
  }

  return data as Book;
}

export async function deleteBook(id: number): Promise<void> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/books/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const data = await response.json();
    const errorMessages = data.errors || [data.error || "Failed to delete book"];
    throw new Error(Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages);
  }
}

