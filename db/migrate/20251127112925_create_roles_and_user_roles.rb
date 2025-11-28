# frozen_string_literal: true

class CreateRolesAndUserRoles < ActiveRecord::Migration[8.1]
  def change
    create_table :roles do |t|
      t.string :name, null: false

      t.timestamps
    end

    add_index :roles, :name, unique: true

    create_table :user_roles do |t|
      t.references :user, null: false, foreign_key: true
      t.references :role, null: false, foreign_key: true

      t.timestamps
    end

    add_index :user_roles, [:user_id, :role_id], unique: true

    %w[librarian member].each do |role_name|
      Role.find_or_create_by!(name: role_name)
    end
  end
end


