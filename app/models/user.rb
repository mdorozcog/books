class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :user_roles, dependent: :destroy
  has_many :roles, through: :user_roles

  validates :password_confirmation, presence: true, on: :create

  def has_role?(role_name)
    roles.exists?(name: role_name)
  end

  def regenerate_authentication_token!
    update!(authentication_token: generate_token)
  end

  def invalidate_authentication_token!
    update!(authentication_token: nil)
  end

  private

  def generate_token
    loop do
      token = SecureRandom.hex(32)
      break token unless User.exists?(authentication_token: token)
    end
  end
end
