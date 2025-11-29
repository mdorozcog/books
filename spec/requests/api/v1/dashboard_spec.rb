# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Dashboard", type: :request do
  include ActiveSupport::Testing::TimeHelpers

  let(:password) { "password123" }

  let(:librarian) do
    User.create!(
      email: "librarian@example.com",
      password: password,
      password_confirmation: password
    )
  end

  let(:member) do
    User.create!(
      email: "member@example.com",
      password: password,
      password_confirmation: password
    )
  end

  let(:another_member) do
    User.create!(
      email: "another@example.com",
      password: password,
      password_confirmation: password
    )
  end

  let(:librarian_role) { Role.create!(name: "librarian") }
  let(:member_role) { Role.create!(name: "member") }

  let!(:book1) { Book.create!(title: "Book One", author: "Author", genre: "Fiction", isbn: "111", copies: 3) }
  let!(:book2) { Book.create!(title: "Book Two", author: "Author", genre: "Fiction", isbn: "222", copies: 2) }

  let(:base_time) { Time.zone.local(2025, 1, 1, 12, 0, 0) }

  before do
    librarian.roles << librarian_role
    member.roles << member_role
    another_member.roles << member_role

    librarian.regenerate_authentication_token!
    member.regenerate_authentication_token!
    another_member.regenerate_authentication_token!
  end

  describe "GET /api/v1/dashboard" do
    context "when authenticated as librarian" do
      before do
        travel_to(base_time - 16.days) do
          Borrow.create!(
            user: member,
            book: book1,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end

        travel_to(base_time - 15.days) do
          Borrow.create!(
            user: member,
            book: book2,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end

        travel_to(base_time - 15.days) do
          Borrow.create!(
            user: another_member,
            book: book1,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end

        travel_to(base_time - 13.days) do
          Borrow.create!(
            user: another_member,
            book: book2,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end

        travel_to(base_time - 20.days) do
          Borrow.create!(
            user: member,
            book: book1,
            status: :returned,
            due_at: 15.days.from_now
          )
        end
      end

      it "returns global library stats and all active borrows" do
        travel_to(base_time) do
          get "/api/v1/dashboard", headers: auth_headers(librarian)

          expect(response).to have_http_status(:ok)

          role = json_response[:role]
          expect(role).to eq("librarian")

          library_stats = json_response[:library_stats]

          expect(library_stats[:total_books]).to eq(5)
          expect(library_stats[:total_borrowed]).to eq(4)
          expect(library_stats[:available_books]).to eq(1)

          all_borrows = json_response[:all_borrows]
          expect(all_borrows.size).to eq(4)
          expect(all_borrows.map { |b| b[:status] }.uniq).to eq([ "borrowed" ])

          borrows = json_response[:borrows]
          expect(borrows).to eq([])

          user_stats = json_response[:user_stats]
          expect(user_stats[:borrowed_count]).to eq(0)
          expect(user_stats[:due_today_count]).to eq(0)
          expect(user_stats[:overdue_count]).to eq(0)
        end
      end

      it "returns members with due or overdue books" do
        travel_to(base_time) do
          get "/api/v1/dashboard", headers: auth_headers(librarian)

          expect(response).to have_http_status(:ok)

          members_with_due = json_response[:members_with_due_books]

          expect(members_with_due.size).to eq(2)

          member_entry = members_with_due.find { |m| m[:email] == member.email }
          another_entry = members_with_due.find { |m| m[:email] == another_member.email }

          expect(member_entry[:due_books_count]).to eq(2)
          expect(another_entry[:due_books_count]).to eq(1)
        end
      end
    end

    context "when authenticated as member" do
      before do
        travel_to(base_time - 17.days) do
          Borrow.create!(
            user: member,
            book: book1,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end

        travel_to(base_time - 15.days) do
          Borrow.create!(
            user: member,
            book: book2,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end

        travel_to(base_time - 15.days) do
          Borrow.create!(
            user: another_member,
            book: book2,
            status: :borrowed,
            due_at: 15.days.from_now
          )
        end
      end

      it "returns only member-scoped data and no library stats" do
        travel_to(base_time) do
          get "/api/v1/dashboard", headers: auth_headers(member)

          expect(response).to have_http_status(:ok)

          expect(json_response[:role]).to eq("member")
          expect(json_response[:library_stats]).to be_nil

          borrows = json_response[:borrows]
          expect(borrows.size).to eq(2)
          expect(borrows.map { |b| b[:user_id] }.uniq).to eq([ member.id ])

          expect(json_response[:all_borrows]).to be_nil

          user_stats = json_response[:user_stats]
          expect(user_stats[:borrowed_count]).to eq(2)
          expect(user_stats[:due_today_count]).to eq(1)
          expect(user_stats[:overdue_count]).to eq(1)

          due_today = json_response[:due_today_borrows]
          expect(due_today.size).to eq(1)
          expect(due_today.first[:user_id]).to eq(member.id)

          expect(json_response[:members_with_due_books]).to be_nil
        end
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        get "/api/v1/dashboard"

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end
  end
end
