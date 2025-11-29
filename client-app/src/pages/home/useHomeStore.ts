import { useState, useCallback } from 'react'
import { homeService, type DashboardResponse } from './homeService'
import type { BorrowWithBook } from './types'

interface UseHomeStoreReturn {
  borrows: BorrowWithBook[]
  allBorrows: BorrowWithBook[]
  libraryStats: DashboardResponse['library_stats']
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
  const [libraryStats, setLibraryStats] = useState<DashboardResponse['library_stats']>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [returningBorrowId, setReturningBorrowId] = useState<number | null>(null)

  const loadBorrows = useCallback(
    async (userId: number | undefined, isLibrarian: boolean) => {
      setIsLoading(true)
      setError(null)
      try {
        const dashboard = await homeService.fetchDashboard()
        const activeBorrows = dashboard.borrows as BorrowWithBook[]

        if (isLibrarian) {
          const allActive = (dashboard.all_borrows || []) as BorrowWithBook[]
          setAllBorrows(allActive)
          const myBorrows = allActive.filter((borrow) => borrow.user_id === userId)
          setBorrows(myBorrows)
        } else {
          setBorrows(activeBorrows)
        }

        setLibraryStats(dashboard.library_stats)
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
    libraryStats,
    isLoading,
    error,
    returningBorrowId,

    setError,
    loadBorrows,
    handleReturn,
  }
}
