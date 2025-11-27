# frozen_string_literal: true

module Api
  module V1
    class WelcomeController < BaseController
      skip_before_action :authenticate_user!

      def index
        render json: {
          message: "Welcome to the Books API",
          version: "v1"
        }
      end
    end
  end
end
