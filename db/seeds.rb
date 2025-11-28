User.find_or_create_by!(email: "librarian@books.com") do |user|
  user.password = "password"
  user.password_confirmation = "password"
  user.roles << Role.find_by!(name: "librarian")
end

User.find_or_create_by!(email: "member@books.com") do |user|
  user.password = "password"
  user.password_confirmation = "password"
  user.roles << Role.find_by!(name: "member")
end

Book.create!(title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", isbn: "9780743273565", copies: 3)
Book.create!(title: "To Kill a Mockingbird", author: "Harper Lee", genre: "Fiction", isbn: "9780061120084", copies: 5)
Book.create!(title: "1984", author: "George Orwell", genre: "Dystopian", isbn: "9780451524935", copies: 2)
Book.create!(title: "Pride and Prejudice", author: "Jane Austen", genre: "Romance", isbn: "9780141439518", copies: 4)
