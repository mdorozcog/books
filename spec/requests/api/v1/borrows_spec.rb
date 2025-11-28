# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Borrows", type: :request do
  let(:password) { "password123" }
  let(:librarian) { User.create!(email: "librarian@example.com", password: password, password_confirmation: password) }
  let(:member) { User.create!(email: "member@example.com", password: password, password_confirmation: password) }
  let(:another_member) { User.create!(email: "another@example.com", password: password, password_confirmation: password) }
  let(:librarian_role) { Role.create!(name: "librarian") }
  let(:member_role) { Role.create!(name: "member") }
  let(:book) { Book.create!(title: "Test Book", author: "Test Author", genre: "Fiction", isbn: "1234567890", copies: 5) }
  let(:book_with_one_copy) { Book.create!(title: "Limited Book", author: "Test Author", genre: "Fiction", isbn: "1111111111", copies: 1) }
  let(:valid_borrow_params) { { borrow: { book_id: book.id, due_at: 14.days.from_now } } }

  before do
    librarian.roles << librarian_role
    member.roles << member_role
    another_member.roles << member_role
    librarian.regenerate_authentication_token!
    member.regenerate_authentication_token!
    another_member.regenerate_authentication_token!
  end

  describe "GET /api/v1/borrows" do
    context "when authenticated as librarian" do
      it "returns all borrows" do
        borrow1 = Borrow.create!(user: member, book: book, status: :borrowed)
        borrow2 = Borrow.create!(user: another_member, book: book, status: :borrowed)

        get "/api/v1/borrows", headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(2)
        expect(json_response.map { |b| b[:id] }).to contain_exactly(borrow1.id, borrow2.id)
      end

      it "returns empty array when no borrows exist" do
        get "/api/v1/borrows", headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response).to eq([])
      end
    end

    context "when authenticated as member" do
      it "returns only the member's own borrows" do
        member_borrow = Borrow.create!(user: member, book: book, status: :borrowed)
        Borrow.create!(user: another_member, book: book, status: :borrowed)

        get "/api/v1/borrows", headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response.length).to eq(1)
        expect(json_response.first[:id]).to eq(member_borrow.id)
      end

      it "returns empty array when member has no borrows" do
        Borrow.create!(user: another_member, book: book, status: :borrowed)

        get "/api/v1/borrows", headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response).to eq([])
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        get "/api/v1/borrows"

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end
  end

  describe "GET /api/v1/borrows/:id" do
    let(:borrow) { Borrow.create!(user: member, book: book, status: :borrowed) }

    context "when authenticated as librarian" do
      it "returns the requested borrow" do
        get "/api/v1/borrows/#{borrow.id}", headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response[:id]).to eq(borrow.id)
        expect(json_response[:user_id]).to eq(member.id)
        expect(json_response[:book_id]).to eq(book.id)
        expect(json_response[:status]).to eq("borrowed")
      end

      it "returns not found for non-existent borrow" do
        get "/api/v1/borrows/99999", headers: auth_headers(librarian)

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error]).to eq("Borrow not found")
      end
    end

    context "when authenticated as member" do
      it "returns the member's own borrow" do
        get "/api/v1/borrows/#{borrow.id}", headers: auth_headers(member)

        expect(response).to have_http_status(:ok)
        expect(json_response[:id]).to eq(borrow.id)
      end

      it "returns unauthorized for another member's borrow" do
        other_borrow = Borrow.create!(user: another_member, book: book, status: :borrowed)

        get "/api/v1/borrows/#{other_borrow.id}", headers: auth_headers(member)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        get "/api/v1/borrows/#{borrow.id}"

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "POST /api/v1/borrows" do
    context "when authenticated as member" do
      it "creates a new borrow" do
        expect {
          post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(member)
        }.to change(Borrow, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response[:book_id]).to eq(book.id)
        expect(json_response[:user_id]).to eq(member.id)
        expect(json_response[:status]).to eq("borrowed")
      end

      it "automatically sets the user to current_user" do
        post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(member)

        expect(response).to have_http_status(:created)
        expect(json_response[:user_id]).to eq(member.id)
        expect(Borrow.last.user).to eq(member)
      end

      it "automatically sets status to borrowed" do
        post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(member)

        expect(response).to have_http_status(:created)
        expect(json_response[:status]).to eq("borrowed")
        expect(Borrow.last.status).to eq("borrowed")
      end

      it "returns validation errors when book has no available copies" do
        Borrow.create!(user: another_member, book: book_with_one_copy, status: :borrowed)

        post "/api/v1/borrows", params: { borrow: { book_id: book_with_one_copy.id } }, headers: auth_headers(member)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
        expect(json_response[:errors]).to include("Book has no available copies")
      end

      it "returns validation errors for invalid params" do
        invalid_params = { borrow: { book_id: nil } }

        post "/api/v1/borrows", params: invalid_params, headers: auth_headers(member)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "allows borrowing when copies are available" do
        Borrow.create!(user: another_member, book: book, status: :borrowed)

        post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(member)

        expect(response).to have_http_status(:created)
      end

      it "prevents borrowing the same book when user already has an active borrow" do
        Borrow.create!(user: member, book: book, status: :borrowed)

        post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(member)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
        expect(json_response[:errors]).to include(match(/already borrowed/i))
      end

      it "allows borrowing the same book after returning the previous borrow" do
        borrow = Borrow.create!(user: member, book: book, status: :borrowed)
        borrow.update!(status: :returned)

        post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(member)

        expect(response).to have_http_status(:created)
      end
    end

    context "when authenticated as librarian" do
      it "returns created" do
        post "/api/v1/borrows", params: valid_borrow_params, headers: auth_headers(librarian)

        expect(response).to have_http_status(:created)
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        post "/api/v1/borrows", params: valid_borrow_params

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe "PATCH /api/v1/borrows/:id" do
    let(:borrow) { Borrow.create!(user: member, book: book, status: :borrowed) }

    context "when authenticated as librarian" do
      it "updates the borrow status to returned" do
        patch "/api/v1/borrows/#{borrow.id}", params: { borrow: { status: "returned" } }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:ok)
        expect(json_response[:status]).to eq("returned")
        expect(borrow.reload.status).to eq("returned")
      end

      it "returns validation errors for invalid params" do
        patch "/api/v1/borrows/#{borrow.id}", params: { borrow: { status: "invalid_status" } }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
        expect(json_response[:errors].join).to match(/status/i)
      end

      it "returns not found for non-existent borrow" do
        patch "/api/v1/borrows/99999", params: { borrow: { status: "returned" } }, headers: auth_headers(librarian)

        expect(response).to have_http_status(:not_found)
        expect(json_response[:error]).to eq("Borrow not found")
      end
    end

    context "when authenticated as member" do
      it "returns unauthorized" do
        patch "/api/v1/borrows/#{borrow.id}", params: { borrow: { status: "returned" } }, headers: auth_headers(member)

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        patch "/api/v1/borrows/#{borrow.id}", params: { borrow: { status: "returned" } }

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end
end
