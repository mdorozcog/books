import { useState, useCallback } from 'react'
import { homeService, type Borrow } from './homeService'
import type { BorrowWithBook } from './types'

interface UseHomeStoreReturn {
  borrows: BorrowWithBook[]
  allBorrows: BorrowWithBook[]
  isLoading: boolean
  error: string | null
  returningBorrowId: number | null

  setError: (error: string | null) => void
  loadBorrows: (userId: number | undefined, isLibrarian: boolean) => Promise<void>
  handleReturn: (borrowId: number, userId: number | undefined, isLibrarian: boolean) => Promise<void>
}

export function useHomeStore(): UseHomeStoreReturn {
  const [borrows, setBorrows] = useState<BorrowWithBook[]>([])
  const [allBorrows, setAllBorrows] = useState<BorrowWithBook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [returningBorrowId, setReturningBorrowId] = useState<number | null>(null)

  const loadBorrows = useCallback(
    async (userId: number | undefined, isLibrarian: boolean) => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await homeService.fetchBorrows()
        const activeBorrows = data.filter(
          (borrow) => borrow.status === 'borrowed'
        ) as BorrowWithBook[]

        if (isLibrarian) {
          setAllBorrows(activeBorrows)
          const myBorrows = activeBorrows.filter((borrow) => borrow.user_id === userId)
          setBorrows(myBorrows)
        } else {
          setBorrows(activeBorrows)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load borrows')
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const handleReturn = useCallback(
    async (borrowId: number, userId: number | undefined, isLibrarian: boolean) => {
      setReturningBorrowId(borrowId)
      setError(null)
      try {
        await homeService.updateBorrow(borrowId, { status: 'returned' })
        await loadBorrows(userId, isLibrarian)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to return book')
      } finally {
        setReturningBorrowId(null)
      }
    },
    [loadBorrows]
  )

  return {
    borrows,
    allBorrows,
    isLoading,
    error,
    returningBorrowId,

    setError,
    loadBorrows,
    handleReturn,
  }
}
