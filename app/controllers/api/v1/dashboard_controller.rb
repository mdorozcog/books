# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      def show
        role_name = current_user.roles.first&.name
        is_librarian = role_name == "librarian"

        if is_librarian
          all_active_borrows = Borrow.where(status: :borrowed).includes(:book, :user)
          user_active_borrows = all_active_borrows.where(user: current_user)
        else
          user_active_borrows = Borrow.where(user: current_user, status: :borrowed).includes(:book)
          all_active_borrows = nil
        end

        today = Date.current

        library_stats = nil
        members_with_due_books = nil

        if is_librarian
          total_books = Book.sum(:copies)
          total_borrowed = all_active_borrows.count
          available_books = [ total_books - total_borrowed, 0 ].max

          library_stats = {
            total_books:,
            total_borrowed:,
            available_books:
          }

          due_or_overdue_scope = all_active_borrows.where("DATE(due_at) <= ?", today)
          counts_by_user = due_or_overdue_scope.joins(:user)
                                               .group("users.id", "users.email")
                                               .count

          members_with_due_books = counts_by_user.map do |(user_id, email), count|
            {
              user_id:,
              email:,
              due_books_count: count
            }
          end
        end

        user_due_today = user_active_borrows.where("DATE(due_at) = ?", today)
        user_overdue = user_active_borrows.where("DATE(due_at) < ?", today)

        user_stats = {
          borrowed_count: user_active_borrows.count,
          due_today_count: user_due_today.count,
          overdue_count: user_overdue.count
        }

        render json: {
          role: role_name,
          library_stats:,
          user_stats:,
          borrows: serialize_borrows(user_active_borrows, is_librarian:),
          all_borrows: is_librarian ? serialize_borrows(all_active_borrows, is_librarian: true) : nil,
          due_today_borrows: serialize_borrows(user_due_today, is_librarian:),
          members_with_due_books:
        }
      end

      private

      def serialize_borrows(scope, is_librarian:)
        return [] if scope.nil?

        if is_librarian
          scope.as_json(include: [ :book, user: { only: [ :id, :email ] } ])
        else
          scope.as_json(include: :book)
        end
      end
    end
  end
end
