import { get, patch } from '../../lib/api'
import type { DashboardResponse, UpdateBorrowParams, BorrowWithBook } from './types'

export const homeService = {
  async fetchDashboard(): Promise<DashboardResponse> {
    return get<DashboardResponse>('/dashboard')
  },

  async updateBorrow(id: number, params: UpdateBorrowParams): Promise<BorrowWithBook> {
    return patch<UpdateBorrowParams, BorrowWithBook>(`/borrows/${id}`, params, 'borrow')
  },
}

export type { DashboardResponse, UpdateBorrowParams, BorrowWithBook }
