import { API_ENDPOINT } from './apiConfig';
import type {
  LoginResponse,
  ApiError,
  RegisterParams,
  RegisterResponse,
  Book,
  CreateBookParams,
  CreateBorrowParams,
  Borrow,
  UpdateBorrowParams,
} from './apiTypes';

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

export async function register(params: RegisterParams): Promise<RegisterResponse> {
  const response = await fetch(`${API_ENDPOINT}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user: params }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessages = data.errors || [data.error || "Registration failed"];
    throw new Error(Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages);
  }

  return data as RegisterResponse;
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

export async function createBorrow(params: CreateBorrowParams): Promise<Borrow> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/borrows`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ borrow: params }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessages = data.errors || [data.error || "Failed to borrow book"];
    throw new Error(Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages);
  }

  return data as Borrow;
}

export async function fetchBorrows(): Promise<Borrow[]> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/borrows`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as ApiError).error || "Failed to fetch borrows");
  }

  return data as Borrow[];
}

export async function updateBorrow(id: number, params: UpdateBorrowParams): Promise<Borrow> {
  const token = getStoredToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_ENDPOINT}/borrows/${id}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ borrow: params }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessages = data.errors || [data.error || "Failed to update borrow"];
    throw new Error(Array.isArray(errorMessages) ? errorMessages.join(", ") : errorMessages);
  }

  return data as Borrow;
}

// Re-export types so existing imports from './api' keep working
export type {
  LoginResponse,
  ApiError,
  RegisterParams,
  RegisterResponse,
  Book,
  CreateBookParams,
  CreateBorrowParams,
  Borrow,
  UpdateBorrowParams,
};


