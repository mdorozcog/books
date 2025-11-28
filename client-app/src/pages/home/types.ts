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
