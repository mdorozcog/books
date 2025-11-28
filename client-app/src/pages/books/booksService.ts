import {
  fetchBooks as apiFetchBooks,
  fetchBook as apiFetchBook,
  searchBooks as apiSearchBooks,
  createBook as apiCreateBook,
  updateBook as apiUpdateBook,
  deleteBook as apiDeleteBook,
  createBorrow as apiCreateBorrow,
  fetchBorrows as apiFetchBorrows,
  updateBorrow as apiUpdateBorrow,
  type Book,
  type Borrow,
  type CreateBookParams,
  type CreateBorrowParams,
  type UpdateBorrowParams,
} from '../../lib/api'

export const booksService = {
  async fetchBooks(): Promise<Book[]> {
    return apiFetchBooks()
  },

  async fetchBook(id: number): Promise<Book> {
    return apiFetchBook(id)
  },

  async searchBooks(query: string): Promise<Book[]> {
    return apiSearchBooks(query)
  },

  async createBook(book: CreateBookParams): Promise<Book> {
    return apiCreateBook(book)
  },

  async updateBook(id: number, book: CreateBookParams): Promise<Book> {
    return apiUpdateBook(id, book)
  },

  async deleteBook(id: number): Promise<void> {
    return apiDeleteBook(id)
  },

  async createBorrow(params: CreateBorrowParams): Promise<Borrow> {
    return apiCreateBorrow(params)
  },

  async fetchBorrows(): Promise<Borrow[]> {
    return apiFetchBorrows()
  },

  async updateBorrow(id: number, params: UpdateBorrowParams): Promise<Borrow> {
    return apiUpdateBorrow(id, params)
  },
}

export type { Book, Borrow, CreateBookParams, CreateBorrowParams, UpdateBorrowParams }
