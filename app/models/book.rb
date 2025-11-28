class Book < ApplicationRecord
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
end
