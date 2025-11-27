# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Sessions", type: :request do
  let(:password) { "password123" }
  let(:user) { User.create!(email: "test@example.com", password: password, password_confirmation: password) }

  describe "POST /api/v1/login" do
    context "with valid credentials" do
      it "returns a success response with token" do
        post "/api/v1/login", params: { email: user.email, password: password }

        expect(response).to have_http_status(:ok)
        expect(json_response[:message]).to eq("Login successful")
        expect(json_response[:token]).to be_present
        expect(json_response[:user][:email]).to eq(user.email)
      end

      it "generates an authentication token for the user" do
        expect {
          post "/api/v1/login", params: { email: user.email, password: password }
        }.to change { user.reload.authentication_token }

        expect(user.authentication_token).to be_present
      end

      it "includes user roles in the response" do
        role = Role.create!(name: "librarian")
        user.roles << role

        post "/api/v1/login", params: { email: user.email, password: password }

        expect(json_response[:user][:roles]).to include("librarian")
      end
    end

    context "with invalid credentials" do
      it "returns unauthorized for wrong password" do
        post "/api/v1/login", params: { email: user.email, password: "wrongpassword" }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Invalid email or password")
      end

      it "returns unauthorized for non-existent email" do
        post "/api/v1/login", params: { email: "nonexistent@example.com", password: password }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Invalid email or password")
      end

      it "returns unauthorized for missing credentials" do
        post "/api/v1/login", params: {}

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Invalid email or password")
      end
    end
  end

  describe "DELETE /api/v1/logout" do
    context "when authenticated" do
      before do
        user.regenerate_authentication_token!
      end

      it "returns a success response" do
        delete "/api/v1/logout", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response[:message]).to eq("Logged out successfully")
      end

      it "invalidates the authentication token" do
        delete "/api/v1/logout", headers: auth_headers(user)

        expect(user.reload.authentication_token).to be_nil
      end
    end

    context "when not authenticated" do
      it "returns unauthorized" do
        delete "/api/v1/logout"

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end

      it "returns unauthorized with invalid token" do
        delete "/api/v1/logout", headers: { "Authorization" => "Bearer invalidtoken" }

        expect(response).to have_http_status(:unauthorized)
        expect(json_response[:error]).to eq("Unauthorized")
      end
    end
  end
end

