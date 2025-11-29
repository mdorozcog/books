# frozen_string_literal: true

class Role < ApplicationRecord
  VALID_ROLES = %w[member librarian]

  has_many :user_roles, dependent: :destroy
  has_many :users, through: :user_roles

  validates :name, presence: true, uniqueness: true
  validates :name, inclusion: { in: VALID_ROLES, message: "%{value} is not a valid role" }
end

