# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      def is_allowed_to?(resource_class, action)
        return false unless current_user

        role_name = current_user.roles.first&.name
        return false unless role_name

        resource_permissions = resource_class.const_get(:PERMISSIONS)
        resource_permissions[role_name.to_sym]&.fetch(action, false)
      rescue NameError, NoMethodError
        false
      end

      def authorize_resource
        return if is_allowed_to?(self.class::RESOURCE, action_name.to_sym)

        render json: { error: "Unauthorized" }, status: :unauthorized
      end

      private

      def authenticate_user!
        token = request.headers["Authorization"]&.split(" ")&.last
        @current_user = User.find_by(authentication_token: token) if token.present?

        render json: { error: "Unauthorized" }, status: :unauthorized unless @current_user
      end

      def current_user
        @current_user
      end
    end
  end
end
