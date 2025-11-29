export interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    roles: string[];
  };
  token: string;
}

export interface ApiError {
  error: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  password_confirmation: string;
  roles?: string[];
}

export interface RegisterResponse {
  email: string;
  roles: string[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBookParams {
  title: string;
  author: string;
  genre: string;
  isbn: string;
  copies: number;
}

export interface CreateBorrowParams {
  book_id: number;
  due_at?: string;
}

export interface Borrow {
  id: number;
  user_id: number;
  book_id: number;
  status: string;
  due_at: string | null;
  created_at: string;
  updated_at: string;
  book?: Book;
  user?: {
    id: number;
    email: string;
  };
}

export interface UpdateBorrowParams {
  status?: string;
  due_at?: string;
}

