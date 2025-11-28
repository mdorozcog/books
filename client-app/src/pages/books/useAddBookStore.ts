import { useState, useCallback } from 'react'
import { booksService, type Book, type CreateBookParams } from './booksService'

export interface BookFormData extends Omit<CreateBookParams, 'copies'> {
  copies: string | number
}

interface UseAddBookStoreReturn {
  formData: BookFormData
  isLoading: boolean
  isLoadingBook: boolean
  error: string | null
  success: boolean

  setFormData: (data: BookFormData | ((prev: BookFormData) => BookFormData)) => void
  setError: (error: string | null) => void
  setSuccess: (success: boolean) => void
  loadBook: (id: number) => Promise<void>
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: (isEditMode: boolean, id: number | undefined) => Promise<Book | null>
  resetForm: () => void
}

const initialFormData: BookFormData = {
  title: '',
  author: '',
  genre: '',
  isbn: '',
  copies: '',
}

export function useAddBookStore(): UseAddBookStoreReturn {
  const [formData, setFormData] = useState<BookFormData>(initialFormData)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBook, setIsLoadingBook] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const loadBook = useCallback(async (id: number) => {
    setIsLoadingBook(true)
    setError(null)
    try {
      const book = await booksService.fetchBook(id)
      setFormData({
        title: book.title,
        author: book.author,
        genre: book.genre,
        isbn: book.isbn,
        copies: book.copies,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load book')
    } finally {
      setIsLoadingBook(false)
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'copies' ? (value === '' ? '' : parseInt(value) || '') : value,
    }))
    setError(null)
  }, [])

  const handleSubmit = useCallback(
    async (isEditMode: boolean, id: number | undefined): Promise<Book | null> => {
      setIsLoading(true)
      setError(null)
      setSuccess(false)

      const bookData: CreateBookParams = {
        ...formData,
        copies: typeof formData.copies === 'string' ? parseInt(formData.copies) || 0 : formData.copies,
      }

      try {
        if (isEditMode && id) {
          const updatedBook = await booksService.updateBook(id, bookData)
          setSuccess(true)
          return updatedBook
        } else {
          const newBook = await booksService.createBook(bookData)
          setSuccess(true)
          resetForm()
          return newBook
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : isEditMode
            ? 'Failed to update book'
            : 'Failed to create book'
        )
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [formData]
  )

  const resetForm = useCallback(() => {
    setFormData(initialFormData)
    setError(null)
    setSuccess(false)
  }, [])

  return {
    formData,
    isLoading,
    isLoadingBook,
    error,
    success,

    setFormData,
    setError,
    setSuccess,
    loadBook,
    handleChange,
    handleSubmit,
    resetForm,
  }
}
