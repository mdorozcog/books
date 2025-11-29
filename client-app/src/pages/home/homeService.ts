import {
  fetchDashboard as apiFetchDashboard,
  updateBorrow as apiUpdateBorrow,
  type Borrow,
  type UpdateBorrowParams,
  type DashboardResponse,
} from '../../lib/api'

export const homeService = {
  async fetchDashboard(): Promise<DashboardResponse> {
    return apiFetchDashboard()
  },

  async updateBorrow(id: number, params: UpdateBorrowParams): Promise<Borrow> {
    return apiUpdateBorrow(id, params)
  },
}

export type { Borrow, UpdateBorrowParams, DashboardResponse }
