# frozen_string_literal: true

module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_user!, only: [:create]

      def create
        user = User.find_by(email: params[:email])

        if user&.valid_password?(params[:password])
          user.regenerate_authentication_token!
          render json: {
            message: "Login successful",
            user: user_response(user),
            token: user.authentication_token
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      def destroy
        current_user.invalidate_authentication_token!
        render json: { message: "Logged out successfully" }, status: :ok
      end

      private

      def user_response(user)
        {
          id: user.id,
          email: user.email,
          roles: user.roles.pluck(:name)
        }
      end
    end
  end
end

