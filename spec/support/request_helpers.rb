# frozen_string_literal: true

module RequestHelpers
  def json_response
    JSON.parse(response.body, symbolize_names: true)
  end

  def auth_headers(user)
    { "Authorization" => "Bearer #{user.authentication_token}" }
  end
end

RSpec.configure do |config|
  config.include RequestHelpers, type: :request
end


