# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Borrow, type: :model do
  let(:user) { User.create!(email: "user@example.com", password: "password123", password_confirmation: "password123") }
  let(:book) { Book.create!(title: "Test Book", author: "Test Author", genre: "Fiction", isbn: "1234567890", copies: 5) }
  let(:borrow) { Borrow.new(user: user, book: book, due_at: 15.days.from_now) }

  describe 'associations' do
    it 'belongs to a user' do
      association = described_class.reflect_on_association(:user)
      expect(association).to be_present
      expect(association.macro).to eq(:belongs_to)
    end

    it 'belongs to a book' do
      association = described_class.reflect_on_association(:book)
      expect(association).to be_present
      expect(association.macro).to eq(:belongs_to)
    end
  end

  describe 'validations' do
    it 'requires a user' do
      borrow.user = nil
      expect(borrow).not_to be_valid
      expect(borrow.errors[:user]).to include("must exist")
    end

    it 'requires a book' do
      borrow.book = nil
      expect(borrow).not_to be_valid
      expect(borrow.errors[:book]).to include("must exist")
    end

    it 'is valid with user and book' do
      expect(borrow).to be_valid
    end

    it 'does not allow borrowing when there are no available copies' do
      # Create borrows for all available copies using different users
      book.update!(copies: 2)
      another_user = User.create!(email: "another@example.com", password: "password123", password_confirmation: "password123")
      Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      Borrow.create!(user: another_user, book: book, status: :borrowed, due_at: 15.days.from_now)
      
      # Try to create another borrow when all copies are borrowed
      third_user = User.create!(email: "third@example.com", password: "password123", password_confirmation: "password123")
      new_borrow = Borrow.new(user: third_user, book: book, due_at: 15.days.from_now)
      expect(new_borrow).not_to be_valid
      expect(new_borrow.errors[:book]).to include("has no available copies")
    end

    it 'allows borrowing when copies are available' do
      book.update!(copies: 3)
      # Create one borrow, leaving 2 copies available
      another_user = User.create!(email: "another@example.com", password: "password123", password_confirmation: "password123")
      Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      
      # Should be able to create another borrow with a different user
      new_borrow = Borrow.new(user: another_user, book: book, due_at: 15.days.from_now)
      expect(new_borrow).to be_valid
    end

    it 'prevents borrowing the same book when user already has an active borrow' do
      # Create an active borrow
      Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      
      # Try to create another borrow for the same user and book
      new_borrow = Borrow.new(user: user, book: book, due_at: 15.days.from_now)
      expect(new_borrow).not_to be_valid
      expect(new_borrow.errors[:book]).to include("is already borrowed by this user. Please return it before borrowing again.")
    end

    it 'allows borrowing the same book after returning the previous borrow' do
      # Create and return a borrow
      borrow_record = Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      borrow_record.update!(status: :returned)
      
      # Should be able to create another borrow since the previous one was returned
      new_borrow = Borrow.new(user: user, book: book, due_at: 15.days.from_now)
      expect(new_borrow).to be_valid
    end

    it 'allows borrowing when previous borrows are returned' do
      book.update!(copies: 1)
      # Create a borrow and return it
      borrow_record = Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      borrow_record.update!(status: :returned)
      
      # Should be able to create another borrow since the previous one was returned
      new_borrow = Borrow.new(user: user, book: book, due_at: 15.days.from_now)
      expect(new_borrow).to be_valid
    end

    it 'counts only borrowed status when calculating available copies' do
      book.update!(copies: 2)
      # Create borrows with different statuses using different users
      another_user = User.create!(email: "another@example.com", password: "password123", password_confirmation: "password123")
      Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      Borrow.create!(user: another_user, book: book, status: :returned, due_at: 15.days.from_now)
      
      # Should still have 1 copy available (only the borrowed one counts)
      # But user already has an active borrow, so use a different user
      third_user = User.create!(email: "third@example.com", password: "password123", password_confirmation: "password123")
      new_borrow = Borrow.new(user: third_user, book: book, due_at: 15.days.from_now)
      expect(new_borrow).to be_valid
    end
  end

  describe 'enum status' do
    it 'has the correct enum values' do
      expect(described_class.statuses).to eq({
        'borrowed' => 0,
        'returned' => 1
      })
    end

    it 'defaults to borrowed status' do
      borrow.save!
      expect(borrow.status).to eq('borrowed')
      expect(borrow.borrowed?).to be true
    end

    describe 'borrowed status' do
      it 'can be set to borrowed' do
        borrow.status = :borrowed
        borrow.save!
        expect(borrow.borrowed?).to be true
        expect(borrow.returned?).to be false
      end

      it 'can use borrowed! method' do
        borrow.returned!
        borrow.borrowed!
        expect(borrow.borrowed?).to be true
      end
    end

    describe 'returned status' do
      it 'can be set to returned' do
        borrow.status = :returned
        borrow.save!
        expect(borrow.returned?).to be true
        expect(borrow.borrowed?).to be false
      end

      it 'can use returned! method' do
        borrow.returned!
        expect(borrow.returned?).to be true
      end
    end


    it 'accepts integer values' do
      borrow.status = 0
      expect(borrow.borrowed?).to be true

      borrow.status = 1
      expect(borrow.returned?).to be true
    end
  end

  describe 'scopes' do
    before do
      another_user = User.create!(email: "another@example.com", password: "password123", password_confirmation: "password123")
      Borrow.create!(user: user, book: book, status: :borrowed, due_at: 15.days.from_now)
      Borrow.create!(user: another_user, book: book, status: :returned, due_at: 15.days.from_now)
    end

    it 'has borrowed scope' do
      expect(Borrow.borrowed.count).to eq(1)
      expect(Borrow.borrowed.first.status).to eq('borrowed')
    end

    it 'has returned scope' do
      expect(Borrow.returned.count).to eq(1)
      expect(Borrow.returned.first.status).to eq('returned')
    end
  end

  describe 'creation' do
    it 'creates a borrow with valid attributes' do
      expect {
        Borrow.create!(user: user, book: book, due_at: 15.days.from_now)
      }.to change(Borrow, :count).by(1)
    end

    it 'creates a borrow with status' do
      borrow = Borrow.create!(user: user, book: book, status: :returned, due_at: 15.days.from_now)
      expect(borrow.status).to eq('returned')
    end

    it 'creates a borrow with due_at date' do
      due_date = 15.days.from_now.to_date
      borrow = Borrow.create!(user: user, book: book, due_at: due_date)
      expect(borrow.due_at).to eq(due_date)
    end
  end

  describe 'associations behavior' do
    it 'belongs to a user' do
      borrow.save!
      expect(borrow.user).to eq(user)
    end

    it 'belongs to a book' do
      borrow.save!
      expect(borrow.book).to eq(book)
    end

    it 'can access user through borrow' do
      borrow.save!
      expect(borrow.user.email).to eq("user@example.com")
    end

    it 'can access book through borrow' do
      borrow.save!
      expect(borrow.book.title).to eq("Test Book")
    end
  end
end
