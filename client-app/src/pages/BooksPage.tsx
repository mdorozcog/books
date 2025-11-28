import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  Box,
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import DashboardLayout from '../components/DashboardLayout'
import '../App.css'
import { fetchBooks, searchBooks, deleteBook, createBorrow, fetchBorrows, updateBorrow, getStoredToken, type Book, type Borrow } from '../lib/api'

interface User {
  id: number
  email: string
  roles: string[]
}

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const ClearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function BooksPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(
    (location.state as { user?: User })?.user || null
  )
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [borrowingBookId, setBorrowingBookId] = useState<number | null>(null)
  const [borrows, setBorrows] = useState<Borrow[]>([])
  const [returningBorrowId, setReturningBorrowId] = useState<number | null>(null)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      navigate('/login')
      return
    }

    // Get user from localStorage if not in state
    if (!user) {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          // Invalid stored user
        }
      }
    }

    loadBooks()
    if (user) {
      loadBorrows()
    }
  }, [navigate, user])

  const loadBooks = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchBooks()
      setBooks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books')
    } finally {
      setIsLoading(false)
    }
  }

  const loadBorrows = async () => {
    try {
      const data = await fetchBorrows()
      setBorrows(data)
    } catch (err) {
      // Silently fail - borrows are not critical for the page
      console.error('Failed to load borrows:', err)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadBooks()
      return
    }

    setError(null)
    try {
      const results = await searchBooks(searchQuery)
      setBooks(results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search books')
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    loadBooks()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDeleteClick = (book: Book) => {
    setBookToDelete(book)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return

    setIsDeleting(true)
    setError(null)
    try {
      await deleteBook(bookToDelete.id)
      // Remove the book from the list
      setBooks(books.filter((b) => b.id !== bookToDelete.id))
      setDeleteDialogOpen(false)
      setBookToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete book')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setBookToDelete(null)
  }

  const handleBorrow = async (book: Book) => {
    if (book.available_copies <= 0) {
      setError('No copies available for borrowing')
      return
    }

    setBorrowingBookId(book.id)
    setError(null)
    try {
      await createBorrow({ book_id: book.id })
      // Reload books to update available_copies
      await loadBooks()
      // Reload borrows to update the list
      await loadBorrows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow book')
    } finally {
      setBorrowingBookId(null)
    }
  }

  const handleReturn = async (book: Book) => {
    // Find the active borrow for this book by the current user
    const activeBorrow = borrows.find(
      (borrow) => borrow.book_id === book.id && borrow.user_id === user?.id && borrow.status === 'borrowed'
    )

    if (!activeBorrow) {
      setError('No active borrow found for this book')
      return
    }

    setReturningBorrowId(activeBorrow.id)
    setError(null)
    try {
      await updateBorrow(activeBorrow.id, { status: 'returned' })
      // Reload books to update available_copies
      await loadBooks()
      // Reload borrows to update the list
      await loadBorrows()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return book')
    } finally {
      setReturningBorrowId(null)
    }
  }

  const getActiveBorrowForBook = (bookId: number): Borrow | undefined => {
    return borrows.find(
      (borrow) => borrow.book_id === bookId && borrow.user_id === user?.id && borrow.status === 'borrowed'
    )
  }

  const isLibrarian = user?.roles.includes('librarian') || false
  const isMember = user?.roles.includes('member') || false

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} title="Books Catalog">
      <Container maxWidth="lg">
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontFamily: 'var(--font-display)',
                fontWeight: 500,
                color: 'var(--color-text)',
                mb: 1,
              }}
            >
              Books Catalog
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              Browse and search through our collection of books
            </Typography>
          </Box>

          {/* Search Bar */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 2,
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by title, author, genre, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ color: 'var(--color-text-muted)' }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  bgcolor: 'var(--color-bg)',
                  color: 'var(--color-text)',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-border)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-accent)',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-accent)',
                  },
                },
              }}
            />
          </Paper>

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              sx={{
                bgcolor: 'rgba(211, 47, 47, 0.1)',
                color: '#f44336',
                border: '1px solid rgba(211, 47, 47, 0.3)',
              }}
            >
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'var(--color-accent)' }} />
            </Box>
          )}

          {/* Books Grid */}
          {!isLoading && !error && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {books.length} {books.length === 1 ? 'book' : 'books'} found
                </Typography>
              </Box>

              {books.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    p: 6,
                    textAlign: 'center',
                    bgcolor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'var(--color-text-muted)',
                      mb: 1,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    No books found
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {searchQuery
                      ? 'Try adjusting your search terms'
                      : 'The catalog is currently empty'}
                  </Typography>
                </Paper>
              ) : (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 3,
                  }}
                >
                  {books.map((book) => (
                    <Card
                      key={book.id}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
                          borderColor: 'var(--color-accent)',
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Stack spacing={2}>
                          <Box>
                            <Typography
                              variant="h6"
                              component="h2"
                              sx={{
                                fontFamily: 'var(--font-display)',
                                fontWeight: 500,
                                color: 'var(--color-text)',
                                mb: 0.5,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {book.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--color-accent)',
                                fontFamily: 'var(--font-body)',
                                fontWeight: 500,
                              }}
                            >
                              {book.author}
                            </Typography>
                          </Box>

                          <Box>
                            {book.genre && (
                              <Chip
                                label={book.genre}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(201, 162, 39, 0.2)',
                                  color: 'var(--color-accent)',
                                  border: '1px solid rgba(201, 162, 39, 0.3)',
                                  fontFamily: 'var(--font-body)',
                                  fontSize: '0.75rem',
                                  mb: 1,
                                }}
                              />
                            )}
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                                display: 'block',
                                mb: 0.5,
                              }}
                            >
                              ISBN: {book.isbn}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                                display: 'block',
                              }}
                            >
                              Total copies: {book.copies}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                                display: 'block',
                              }}
                            >
                              Copies Available: {book.available_copies}
                            </Typography>
                          </Box>

                          {isLibrarian && (
                            <Box sx={{ pt: 1 }}>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  onClick={() => navigate(`/dashboard/books/${book.id}/edit`, { state: { user } })}
                                  sx={{
                                    borderColor: 'var(--color-accent)',
                                    color: 'var(--color-accent)',
                                    textTransform: 'none',
                                    fontFamily: 'var(--font-body)',
                                    '&:hover': {
                                      borderColor: 'var(--color-accent-hover)',
                                      bgcolor: 'rgba(201, 162, 39, 0.1)',
                                    },
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  fullWidth
                                  onClick={() => handleDeleteClick(book)}
                                  sx={{
                                    borderColor: '#f44336',
                                    color: '#f44336',
                                    textTransform: 'none',
                                    fontFamily: 'var(--font-body)',
                                    '&:hover': {
                                      borderColor: '#d32f2f',
                                      bgcolor: 'rgba(244, 67, 54, 0.1)',
                                    },
                                  }}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </Box>
                          )}

                          {(isMember || isLibrarian) && (
                            <Box sx={{ pt: 1 }}>
                              <Stack spacing={1}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  fullWidth
                                  onClick={() => handleBorrow(book)}
                                  disabled={book.available_copies <= 0 || borrowingBookId === book.id || getActiveBorrowForBook(book.id) !== undefined}
                                  sx={{
                                    bgcolor: 'var(--color-accent)',
                                    color: '#000',
                                    textTransform: 'none',
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 500,
                                    '&:hover': {
                                      bgcolor: 'var(--color-accent-hover)',
                                    },
                                    '&:disabled': {
                                      bgcolor: 'var(--color-border)',
                                      color: 'var(--color-text-muted)',
                                    },
                                  }}
                                >
                                  {borrowingBookId === book.id ? (
                                    <CircularProgress size={20} sx={{ color: 'var(--color-text-muted)' }} />
                                  ) : book.available_copies <= 0 ? (
                                    'No Copies Available'
                                  ) : getActiveBorrowForBook(book.id) ? (
                                    'Already Borrowed'
                                  ) : (
                                    'Borrow'
                                  )}
                                </Button>
                                {isLibrarian && getActiveBorrowForBook(book.id) && (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() => handleReturn(book)}
                                    disabled={returningBorrowId === getActiveBorrowForBook(book.id)?.id}
                                    sx={{
                                      borderColor: '#4caf50',
                                      color: '#4caf50',
                                      textTransform: 'none',
                                      fontFamily: 'var(--font-body)',
                                      '&:hover': {
                                        borderColor: '#388e3c',
                                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                                      },
                                      '&:disabled': {
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-muted)',
                                      },
                                    }}
                                  >
                                    {returningBorrowId === getActiveBorrowForBook(book.id)?.id ? (
                                      <CircularProgress size={20} sx={{ color: 'var(--color-text-muted)' }} />
                                    ) : (
                                      'Return'
                                    )}
                                  </Button>
                                )}
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </>
          )}
        </Stack>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          sx={{
            '& .MuiDialog-paper': {
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            },
          }}
        >
          <DialogTitle sx={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)' }}>
            Delete Book
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              Are you sure you want to delete "{bookToDelete?.title}" by {bookToDelete?.author}?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              sx={{
                color: 'var(--color-text)',
                textTransform: 'none',
                fontFamily: 'var(--font-body)',
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="contained"
              color="error"
              sx={{
                bgcolor: '#f44336',
                textTransform: 'none',
                fontFamily: 'var(--font-body)',
                '&:hover': {
                  bgcolor: '#d32f2f',
                },
                '&:disabled': {
                  bgcolor: 'var(--color-border)',
                  color: 'var(--color-text-muted)',
                },
              }}
            >
              {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </DashboardLayout>
  )
}

export default BooksPage
