class Borrow < ApplicationRecord
  belongs_to :user
  belongs_to :book

  validate :book_has_available_copies, on: :create

  enum :status, {
    borrowed: 0,
    returned: 1
  }

  private

  def book_has_available_copies
    return unless book.present?
    
    if book.available_copies <= 0
      errors.add(:book, "has no available copies")
    end
  end
end
