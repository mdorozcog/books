class CreateBorrows < ActiveRecord::Migration[8.1]
  def change
    create_table :borrows do |t|
      t.references :user, null: false, foreign_key: true
      t.references :book, null: false, foreign_key: true
      t.date :due_at
      t.integer :status, default: 0, null: false

      t.timestamps
    end
  end
end
