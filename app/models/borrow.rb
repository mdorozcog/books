class Borrow < ApplicationRecord
  belongs_to :user
  belongs_to :book

  validate :book_has_available_copies, on: :create
  validate :user_can_borrow_book, on: :create

  enum :status, {
    borrowed: 0,
    returned: 1
  }

  PERMISSIONS = {
    librarian: {
      index: true,
      show: true,
      create: true,
      update: true,
      destroy: false
    },
    member: {
      index: true,
      show: true,
      create: true,
      update: false,
      destroy: false
    }
  }

  private

  def book_has_available_copies
    return unless book.present?

    if book.available_copies <= 0
      errors.add(:book, "has no available copies")
    end
  end

  def user_can_borrow_book
    return unless user.present? && book.present?

    return unless borrowed?

    if Borrow.where(user: user, book: book, status: :borrowed).exists?
      errors.add(:book, "is already borrowed by this user. Please return it before borrowing again.")
    end
  end
end
