import {
  fetchBorrows as apiFetchBorrows,
  updateBorrow as apiUpdateBorrow,
  type Borrow,
  type UpdateBorrowParams,
} from '../../lib/api'

export const homeService = {
  async fetchBorrows(): Promise<Borrow[]> {
    return apiFetchBorrows()
  },

  async updateBorrow(id: number, params: UpdateBorrowParams): Promise<Borrow> {
    return apiUpdateBorrow(id, params)
  },
}

export type { Borrow, UpdateBorrowParams }
