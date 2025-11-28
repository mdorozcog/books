class Book < ApplicationRecord
  has_many :borrows, dependent: :destroy
  has_many :users, through: :borrows

  validates :title, presence: true
  validates :author, presence: true
  validates :isbn, presence: true, uniqueness: true
  validates :copies, presence: true, numericality: { greater_than_or_equal_to: 0 }

  PERMISSIONS = {
    librarian: {
      index: true,
      show: true,
      create: true,
      update: true,
      destroy: true,
      search: true
    },
    member: {
      index: true,
      show: true,
      search: true
    }
  }

  def available_copies
    borrowed_count = borrows.where(status: :borrowed).count
    copies.to_i - borrowed_count
  end
end
