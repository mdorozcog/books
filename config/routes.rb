Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  root "api/v1/welcome#index"
  # API routes
  namespace :api do
    namespace :v1 do
      get "/", to: "welcome#index"

      # Authentication
      post "login", to: "sessions#create"
      delete "logout", to: "sessions#destroy"

      # Users
      post "users", to: "users#create"

      # Books
      resources :books, only: [ :index, :show, :create, :update, :destroy ] do
        collection do
          post :search
        end
      end

      # Borrows
      resources :borrows, only: [ :index, :show, :create, :update ]
    end
  end
end
