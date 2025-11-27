%w[librarian member].each do |role_name|
  Role.find_or_create_by!(name: role_name)
end

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