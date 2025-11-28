# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      def create
        user = User.new(user_params)
        if user.save
          member_role = Role.find_or_create_by!(name: "member")
          user.roles << member_role
          render json: user_response(user), status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation)
      end

      def user_response(user)
        {
          email: user.email,
          roles: user.roles.pluck(:name)
        }
      end
    end
  end
end
