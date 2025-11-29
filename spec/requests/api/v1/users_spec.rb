# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  before do
    Role.find_or_create_by!(name: "member")
    Role.find_or_create_by!(name: "librarian")
  end

  let(:member_role) { Role.find_by!(name: "member") }
  let(:librarian_role) { Role.find_by!(name: "librarian") }

  describe "POST /api/v1/users" do
    let(:valid_user_params) do
      {
        user: {
          email: "newuser@example.com",
          password: "password123",
          password_confirmation: "password123"
        }
      }
    end

    context "with valid parameters" do
      it "creates a new user" do
        expect {
          post "/api/v1/users", params: valid_user_params, as: :json
        }.to change(User, :count).by(1)
      end

      it "returns a created status" do
        post "/api/v1/users", params: valid_user_params, as: :json

        expect(response).to have_http_status(:created)
      end

      it "returns the created user" do
        post "/api/v1/users", params: valid_user_params, as: :json

        expect(json_response[:email]).to eq("newuser@example.com")
      end

      it "automatically assigns the member role to the new user" do
        post "/api/v1/users", params: valid_user_params, as: :json

        user = User.find_by(email: "newuser@example.com")
        expect(user).to be_present
        expect(user.roles).to include(member_role)
        expect(user.has_role?("member")).to be true
      end

      it "assign the librarian role to the new user" do
        post "/api/v1/users", params: valid_user_params.deep_merge(user: { roles: [ :librarian ] }), as: :json

        user = User.find_by(email: "newuser@example.com")
        expect(user).to be_present
        expect(user.roles).to include(librarian_role)
        expect(user.has_role?("librarian")).to be true
      end

      it "does not require authentication" do
        post "/api/v1/users", params: valid_user_params, as: :json

        expect(response).to have_http_status(:created)
      end
    end

    context "with invalid parameters" do
      it "returns unprocessable_entity status for missing email" do
        post "/api/v1/users", params: {
          user: {
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns unprocessable_entity status for invalid email format" do
        post "/api/v1/users", params: {
          user: {
            email: "invalid-email",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns unprocessable_entity status for duplicate email" do
        User.create!(
          email: "existing@example.com",
          password: "password123",
          password_confirmation: "password123"
        )

        post "/api/v1/users", params: {
          user: {
            email: "existing@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns unprocessable_entity status for password mismatch" do
        post "/api/v1/users", params: {
          user: {
            email: "newuser@example.com",
            password: "password123",
            password_confirmation: "differentpassword"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns unprocessable_entity status for short password" do
        post "/api/v1/users", params: {
          user: {
            email: "newuser@example.com",
            password: "short",
            password_confirmation: "short"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns unprocessable_entity status for missing password" do
        post "/api/v1/users", params: {
          user: {
            email: "newuser@example.com",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "returns unprocessable_entity status for missing password_confirmation" do
        post "/api/v1/users", params: {
          user: {
            email: "newuser@example.com",
            password: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end
    end


    context "edge cases" do
      it "handles empty email" do
        post "/api/v1/users", params: {
          user: {
            email: "",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "handles whitespace-only email" do
        post "/api/v1/users", params: {
          user: {
            email: "   ",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "handles case-insensitive email uniqueness" do
        User.create!(
          email: "Test@Example.com",
          password: "password123",
          password_confirmation: "password123"
        )

        post "/api/v1/users", params: {
          user: {
            email: "test@example.com",
            password: "password123",
            password_confirmation: "password123"
          }
        }, as: :json

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response[:errors]).to be_present
      end

      it "defaults to member role when payload is invalid" do
        post "/api/v1/users", params: {
          user: {
            email: "test@example.com",
            password: "password123",
            password_confirmation: "password123",
            roles: [ "invalid" ]
          }
        }, as: :json

        user = User.find_by(email: "test@example.com")

        expect(user.roles.pluck(:name)).to include("member")
      end
    end
  end
end
