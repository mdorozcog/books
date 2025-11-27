class CreateBooks < ActiveRecord::Migration[8.1]
  def change
    create_table :books do |t|
      t.string :title
      t.string :author
      t.string :genre
      t.string :isbn
      t.integer :copies

      t.timestamps
    end
  end
end
