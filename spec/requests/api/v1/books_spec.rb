# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Books", type: :request do
  let(:password) { "password123" }
  let(:librarian) { User.create!(email: "librarian@example.com", password: password, password_confirmation: password) }
  let(:member) { User.create!(email: "member@example.com", password: password, password_confirmation: password) }
  let(:librarian_role) { Role.create!(name: "librarian") }
  let(:member_role) { Role.create!(name: "member") }
  let(:book) { Book.create!(title: "Test Book", author: "Test Author", genre: "Fiction", isbn: "1234567890", copies: 5) }
  let(:valid_book_params) { { book: { title: "New Book", author: "New Author", genre: "Non-Fiction", isbn: "0987654321", copies: 3 } } }

  before do
    librarian.roles << librarian_role
    member.roles << member_role
    librarian.regenerate_authentication_token!
    member.regenerate_authentication_token!
  end

  describe "GET /api/v1/books" do
    context "when authenticated as librarian" do
      it "returns all books" do
        book
        Book.create!(title: "Another Book", author: "Another Author", genre: "Sci-Fi", isbn: "1111111111", copies: 2)

        get "/api/v1/books", headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(2)
        expect(json_response.first[:title]).to eq("Test Book")
      end

      it "returns empty array when no books exist" do
        get "/api/v1/books", headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response).to eq([])
      end
    end

    context "when authenticated as member" do
      it "returns all books" do
        book

        get "/api/v1/books", headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        get "/api/v1/books"

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end
  end

  describe "GET /api/v1/books/:id" do
    context "when authenticated as librarian" do
      it "returns the requested book" do
        get "/api/v1/books/#{book.id}", headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response[:id]).to eq(book.id)
        expect(json_response[:title]).to eq("Test Book")
        expect(json_response[:author]).to eq("Test Author")
      end

      it "returns not found for non-existent book" do
        get "/api/v1/books/99999", headers: auth_headers(librarian)

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error]).to eq("Book not found")
      end
    end

    context "when authenticated as member" do
      it "returns the requested book" do
        get "/api/v1/books/#{book.id}", headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response[:title]).to eq("Test Book")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        get "/api/v1/books/#{book.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/books" do
    context "when authenticated as librarian" do
      it "creates a new book" do
        expect {
          post "/api/v1/books", params: valid_book_params, headers: auth_headers(librarian)
        }.to change(Book, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:title]).to eq("New Book")
        expect(json_response[:author]).to eq("New Author")
      end

      it "returns validation errors for invalid params" do
        invalid_params = { book: { title: "", author: "", isbn: "" } }

        post "/api/v1/books", params: invalid_params, headers: auth_headers(librarian)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end

    context "when authenticated as member" do
      it "returns unauthorized" do
        post "/api/v1/books", params: valid_book_params, headers: auth_headers(member)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        post "/api/v1/books", params: valid_book_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/books/:id" do
    context "when authenticated as librarian" do
      it "updates the book" do
        patch "/api/v1/books/#{book.id}", params: { book: { title: "Updated Title" } }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response[:title]).to eq("Updated Title")
        expect(book.reload.title).to eq("Updated Title")
      end

      it "returns validation errors for invalid params" do
        patch "/api/v1/books/#{book.id}", params: { book: { copies: -1 } }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns not found for non-existent book" do
        patch "/api/v1/books/99999", params: { book: { title: "Updated" } }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error]).to eq("Book not found")
      end
    end

    context "when authenticated as member" do
      it "returns unauthorized" do
        patch "/api/v1/books/#{book.id}", params: { book: { title: "Updated" } }, headers: auth_headers(member)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        patch "/api/v1/books/#{book.id}", params: { book: { title: "Updated" } }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "DELETE /api/v1/books/:id" do
    context "when authenticated as librarian" do
      it "deletes the book" do
        book_to_delete = Book.create!(title: "To Delete", author: "Author", genre: "Genre", isbn: "2222222222", copies: 1)

        expect {
          delete "/api/v1/books/#{book_to_delete.id}", headers: auth_headers(librarian)
        }.to change(Book, :count).by(-1)

        expect(response).to have_http_status(:ok)
        expect(json_response[:message]).to eq("Book deleted successfully")
      end

      it "returns not found for non-existent book" do
        delete "/api/v1/books/99999", headers: auth_headers(librarian)

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error]).to eq("Book not found")
      end
    end

    context "when authenticated as member" do
      it "returns unauthorized" do
        delete "/api/v1/books/#{book.id}", headers: auth_headers(member)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        delete "/api/v1/books/#{book.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/books/search" do
    let!(:book1) { Book.create!(title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", isbn: "9780743273565", copies: 3) }
    let!(:book2) { Book.create!(title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", isbn: "9780061120084", copies: 5) }
    let!(:book3) { Book.create!(title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "9780451524935", copies: 2) }
    let!(:book4) { Book.create!(title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", isbn: "9780141439518", copies: 4) }

    context "when authenticated as librarian" do
      it "searches books by title" do
        post "/api/v1/books/search", params: { q: "Gatsby" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:title]).to eq("The Great Gatsby")
      end

      it "searches books by author" do
        post "/api/v1/books/search", params: { q: "Orwell" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:author]).to eq("George Orwell")
      end

      it "searches books by genre" do
        post "/api/v1/books/search", params: { q: "Fiction" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(2)
        expect(json_response.map { |b| b[:title] }).to contain_exactly("The Great Gatsby", "To Kill a Mockingbird")
      end

      it "searches books by ISBN" do
        post "/api/v1/books/search", params: { q: "9780061120084" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:isbn]).to eq("9780061120084")
      end

      it "performs case-insensitive search" do
        post "/api/v1/books/search", params: { q: "gatsby" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:title]).to eq("The Great Gatsby")
      end

      it "returns multiple results when search term matches multiple books" do
        post "/api/v1/books/search", params: { q: "the" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to be >= 1
        expect(json_response.map { |b| b[:title] }).to include("The Great Gatsby")
      end

      it "returns empty array when no books match" do
        post "/api/v1/books/search", params: { q: "NonexistentBook123" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response).to eq([])
      end

      it "returns error when search parameter is missing" do
        post "/api/v1/books/search", headers: auth_headers(librarian)

        expect(response).to have_http_status(:bad_request)
        expect(json_response[:error]).to eq("Search parameter is required")
      end

      it "returns error when search parameter is blank" do
        post "/api/v1/books/search", params: { q: "" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:bad_request)
        expect(json_response[:error]).to eq("Search parameter is required")
      end

      it "accepts search_string parameter as alternative to q" do
        post "/api/v1/books/search", params: { search_string: "Gatsby" }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:title]).to eq("The Great Gatsby")
      end
    end

    context "when authenticated as member" do
      it "searches books by title" do
        post "/api/v1/books/search", params: { q: "Gatsby" }, headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:title]).to eq("The Great Gatsby")
      end

      it "searches books by author" do
        post "/api/v1/books/search", params: { q: "Lee" }, headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:author]).to eq("Harper Lee")
      end

      it "returns empty array when no books match" do
        post "/api/v1/books/search", params: { q: "NonexistentBook123" }, headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response).to eq([])
      end

      it "returns error when search parameter is missing" do
        post "/api/v1/books/search", headers: auth_headers(member)

        expect(response).to have_http_status(:bad_request)
        expect(json_response[:error]).to eq("Search parameter is required")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        post "/api/v1/books/search", params: { q: "Gatsby" }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end
  end
end
