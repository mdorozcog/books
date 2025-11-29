# frozen_string_literal: true

module Api
  module V1
    class UsersController < ApplicationController
      def create
        user = User.new(user_params.except(:roles))
        if user.save
          assign_roles(user, user_params[:roles])
          render json: user_response(user), status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def user_params
        params.require(:user).permit(:email, :password, :password_confirmation, roles: [])
      end

      def assign_roles(user, role_names)
        if role_names.present? && role_names.any?
          role_names.each do |role_name|
            next unless Role::VALID_ROLES.include? role_name
            role = Role.find_by(name: role_name.to_s)
            user.roles << role if role.present?
          end
        end

        if user.roles.empty?
          member_role = Role.find_or_create_by(name: "member")
          user.roles << member_role
        end
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
