import { useState, useCallback } from 'react'
import { booksService, type Book, type Borrow } from './booksService'

interface UseBooksStoreReturn {
  books: Book[]
  borrows: Borrow[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  deleteDialogOpen: boolean
  bookToDelete: Book | null
  isDeleting: boolean
  borrowingBookId: number | null
  returningBorrowId: number | null

  setSearchQuery: (query: string) => void
  setError: (error: string | null) => void
  loadBooks: () => Promise<void>
  loadBorrows: () => Promise<void>
  handleSearch: () => Promise<void>
  handleClearSearch: () => void
  handleDeleteClick: (book: Book) => void
  handleDeleteConfirm: () => Promise<void>
  handleDeleteCancel: () => void
  handleBorrow: (book: Book) => Promise<void>
  handleReturn: (book: Book, userId: number) => Promise<void>
  getActiveBorrowForBook: (bookId: number, userId: number) => Borrow | undefined
}

export function useBooksStore(): UseBooksStoreReturn {
  const [books, setBooks] = useState<Book[]>([])
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [borrowingBookId, setBorrowingBookId] = useState<number | null>(null)
  const [returningBorrowId, setReturningBorrowId] = useState<number | null>(null)

  const loadBooks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await booksService.fetchBooks()
      setBooks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadBorrows = useCallback(async () => {
    try {
      const data = await booksService.fetchBorrows()
      setBorrows(data)
    } catch (err) {
      console.error('Failed to load borrows:', err)
    }
  }, [])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      await loadBooks()
      return
    }

    setError(null)
    try {
      const results = await booksService.searchBooks(searchQuery)
      setBooks(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search books')
    }
  }, [searchQuery, loadBooks])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    loadBooks()
  }, [loadBooks])

  const handleDeleteClick = useCallback((book: Book) => {
    setBookToDelete(book)
    setDeleteDialogOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!bookToDelete) return

    setIsDeleting(true)
    setError(null)
    try {
      await booksService.deleteBook(bookToDelete.id)
      setBooks((prevBooks) => prevBooks.filter((b) => b.id !== bookToDelete.id))
      setDeleteDialogOpen(false)
      setBookToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book')
    } finally {
      setIsDeleting(false)
    }
  }, [bookToDelete])

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialogOpen(false)
    setBookToDelete(null)
  }, [])

  const handleBorrow = useCallback(
    async (book: Book) => {
      if (book.available_copies <= 0) {
        setError('No copies available for borrowing')
        return
      }

      setBorrowingBookId(book.id)
      setError(null)
      try {
        await booksService.createBorrow({ book_id: book.id })
        // Reload books to update available_copies
        await loadBooks()
        // Reload borrows to update the list
        await loadBorrows()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to borrow book')
      } finally {
        setBorrowingBookId(null)
      }
    },
    [loadBooks, loadBorrows]
  )

  const handleReturn = useCallback(
    async (book: Book, userId: number) => {
      const activeBorrow = borrows.find(
        (borrow) => borrow.book_id === book.id && borrow.user_id === userId && borrow.status === 'borrowed'
      )

      if (!activeBorrow) {
        setError('No active borrow found for this book')
        return
      }

      setReturningBorrowId(activeBorrow.id)
      setError(null)
      try {
        await booksService.updateBorrow(activeBorrow.id, { status: 'returned' })
        await loadBooks()
        await loadBorrows()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to return book')
      } finally {
        setReturningBorrowId(null)
      }
    },
    [borrows, loadBooks, loadBorrows]
  )

  const getActiveBorrowForBook = useCallback(
    (bookId: number, userId: number): Borrow | undefined => {
      return borrows.find(
        (borrow) => borrow.book_id === bookId && borrow.user_id === userId && borrow.status === 'borrowed'
      )
    },
    [borrows]
  )

  return {
    books,
    borrows,
    isLoading,
    error,
    searchQuery,
    deleteDialogOpen,
    bookToDelete,
    isDeleting,
    borrowingBookId,
    returningBorrowId,

    setSearchQuery,
    setError,
    loadBooks,
    loadBorrows,
    handleSearch,
    handleClearSearch,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleBorrow,
    handleReturn,
    getActiveBorrowForBook,
  }
}
