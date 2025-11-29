export interface User {
  id: number
  email: string
  roles: string[]
}

export interface BorrowWithBook {
  id: number
  user_id: number
  book_id: number
  status: string
  due_at: string | null
  created_at: string
  updated_at: string
  book?: {
    id: number
    title: string
    author: string
    genre: string
    isbn: string
    copies: number
    available_copies: number
    created_at: string
    updated_at: string
  }
  user?: {
    id: number
    email: string
  }
}

export interface UpdateBorrowParams {
  status?: string
  due_at?: string
}

export interface DashboardLibraryStats {
  total_books: number
  total_borrowed: number
  available_books: number
}

export interface DashboardUserStats {
  borrowed_count: number
  due_today_count: number
  overdue_count: number
}

export interface DashboardMemberWithDueBooks {
  user_id: number
  email: string
  due_books_count: number
}

export interface DashboardResponse {
  role: string | null
  library_stats: DashboardLibraryStats | null
  user_stats: DashboardUserStats
  borrows: BorrowWithBook[]
  all_borrows: BorrowWithBook[] | null
  due_today_borrows: BorrowWithBook[]
  members_with_due_books: DashboardMemberWithDueBooks[] | null
}
