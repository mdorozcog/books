# frozen_string_literal: true

module Api
  module V1
    class BooksController < BaseController
      before_action :authorize_resource
      before_action :set_book, only: [:show, :update, :destroy]

      RESOURCE = Book

      def index
        books = Book.all
        render json: books
      end

      def show
        render json: @book
      end

      def create
        book = Book.create(book_params)
        if book.persisted?
          render json: book, status: :created
        else
          render json: { errors: book.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        if @book.update(book_params)
          render json: @book
        else
          render json: { errors: @book.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        @book.destroy
        render json: { message: "Book deleted successfully" }
      end

      private

      def set_book
        @book = Book.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Book not found" }, status: :not_found
      end

      def book_params
        params.require(:book).permit(:title, :author, :genre, :isbn, :copies)
      end
    end
  end
end
