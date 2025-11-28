# frozen_string_literal: true

module Api
  module V1
    class BorrowsController < BaseController
      before_action :authorize_resource
      before_action :set_borrow, only: [:show, :update, :destroy]

      RESOURCE = Borrow

      def index
        borrows = if current_user.roles.first&.name == "librarian"
                    Borrow.all.includes(:book, :user)
                  else
                    Borrow.where(user: current_user).includes(:book)
                  end
        if current_user.roles.first&.name == "librarian"
          render json: borrows.as_json(include: [:book, user: { only: [:id, :email] }])
        else
          render json: borrows.as_json(include: :book)
        end
      end

      def show
        if current_user.roles.first&.name != "librarian" && @borrow.user != current_user
          render json: { error: "Unauthorized" }, status: :unauthorized
          return
        end

        render json: @borrow
      end

      def create
        borrow = Borrow.new(borrow_params)
        borrow.user = current_user
        borrow.status = :borrowed
        borrow.due_at = 15.days.from_now

        if borrow.save
          render json: borrow, status: :created
        else
          render json: { errors: borrow.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if current_user.roles.first&.name == "librarian"
          begin
            if @borrow.update(borrow_params)
              render json: @borrow
            else
              render json: { errors: @borrow.errors.full_messages }, status: :unprocessable_content
            end
          rescue ArgumentError => e
            render json: { errors: [e.message] }, status: :unprocessable_content
          end
        else
          render json: { error: "Unauthorized" }, status: :unauthorized
        end
      end

      def destroy
        @borrow.destroy
        render json: { message: "Borrow deleted successfully" }
      end

      private

      def set_borrow
        @borrow = Borrow.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Borrow not found" }, status: :not_found
      end

      def borrow_params
        if current_user.roles.first&.name == "librarian"
          params.require(:borrow).permit(:book_id, :status, :due_at)
        else
          params.require(:borrow).permit(:book_id, :due_at)
        end
      end
    end
  end
end

