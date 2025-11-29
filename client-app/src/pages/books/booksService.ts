import { get, post, put, patch, del } from '../../lib/api'
import type {
  Book,
  Borrow,
  CreateBookParams,
  CreateBorrowParams,
  UpdateBorrowParams,
} from './types'

export const booksService = {
  async fetchBooks(): Promise<Book[]> {
    return get<Book[]>('/books')
  },

  async fetchBook(id: number): Promise<Book> {
    return get<Book>(`/books/${id}`)
  },

  async searchBooks(query: string): Promise<Book[]> {
    return post<{ q: string }, Book[]>('/books/search', { q: query })
  },

  async createBook(book: CreateBookParams): Promise<Book> {
    return post<CreateBookParams, Book>('/books', book, 'book')
  },

  async updateBook(id: number, book: CreateBookParams): Promise<Book> {
    return put<CreateBookParams, Book>(`/books/${id}`, book, 'book')
  },

  async deleteBook(id: number): Promise<void> {
    return del(`/books/${id}`)
  },

  async createBorrow(params: CreateBorrowParams): Promise<Borrow> {
    return post<CreateBorrowParams, Borrow>('/borrows', params, 'borrow')
  },

  async fetchBorrows(): Promise<Borrow[]> {
    return get<Borrow[]>('/borrows')
  },

  async updateBorrow(id: number, params: UpdateBorrowParams): Promise<Borrow> {
    return patch<UpdateBorrowParams, Borrow>(`/borrows/${id}`, params, 'borrow')
  },
}

export type { Book, Borrow, CreateBookParams, CreateBorrowParams, UpdateBorrowParams }
