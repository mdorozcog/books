import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material'
import DashboardLayout from '../../components/DashboardLayout'
import '../../App.css'
import { useAddBookStore } from './useAddBookStore'
import { useUserStore } from '../../shared/stores/useUserStore'

const genres = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Science',
  'Philosophy',
  'Poetry',
  'Drama',
  'Comedy',
  'Other',
]

function AddBookPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEditMode = !!id
  const { user, isLibrarian } = useUserStore()

  const {
    formData,
    isLoading,
    isLoadingBook,
    error,
    success,
    setError,
    setSuccess,
    loadBook,
    handleChange,
    handleSubmit,
  } = useAddBookStore()

  useEffect(() => {
    if (user && !isLibrarian) {
      navigate('/dashboard/books')
    }
  }, [navigate, user, isLibrarian])

  useEffect(() => {
    if (isEditMode && id) {
      loadBook(parseInt(id))
    }
  }, [isEditMode, id, loadBook])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await handleSubmit(isEditMode, id ? parseInt(id) : undefined)
    if (result) {
      setTimeout(() => {
        navigate('/dashboard/books')
      }, 2000)
    }
  }

  if (!user) {
    return null
  }

  if (!user.roles.includes('librarian')) {
    return null
  }

  if (isLoadingBook) {
    return (
      <DashboardLayout user={user} title={isEditMode ? 'Edit Book' : 'Add New Book'}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              bgcolor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
            }}
          >
            <CircularProgress sx={{ color: 'var(--color-accent)' }} />
          </Paper>
        </Container>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} title={isEditMode ? 'Edit Book' : 'Add New Book'}>
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 2,
          }}
        >
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
                {isEditMode ? 'Edit Book' : 'Add New Book'}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {isEditMode
                  ? 'Update the book details below'
                  : 'Fill in the details below to add a new book to the catalog'}
              </Typography>
            </Box>

            {/* Success Alert */}
            {success && (
              <Alert
                severity="success"
                onClose={() => setSuccess(false)}
                sx={{
                  bgcolor: 'rgba(46, 125, 50, 0.1)',
                  color: '#4caf50',
                  border: '1px solid rgba(46, 125, 50, 0.3)',
                }}
              >
                {isEditMode
                  ? 'Book updated successfully! Redirecting to books catalog...'
                  : 'Book created successfully! Redirecting to books catalog...'}
              </Alert>
            )}

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

            {/* Form */}
            <Box component="form" onSubmit={onSubmit}>
              <Stack spacing={3}>
                <TextField
                  name="title"
                  label="Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      '& fieldset': {
                        borderColor: 'var(--color-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text-muted)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-accent)',
                    },
                  }}
                />

                <TextField
                  name="author"
                  label="Author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      '& fieldset': {
                        borderColor: 'var(--color-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text-muted)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-accent)',
                    },
                  }}
                />

                <TextField
                  name="genre"
                  label="Genre"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                  select
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      '& fieldset': {
                        borderColor: 'var(--color-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text-muted)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-accent)',
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>Select a genre</em>
                  </MenuItem>
                  {genres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="isbn"
                  label="ISBN"
                  value={formData.isbn}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      '& fieldset': {
                        borderColor: 'var(--color-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text-muted)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-accent)',
                    },
                  }}
                />

                <TextField
                  name="copies"
                  label="Number of Copies"
                  type="number"
                  value={formData.copies}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ min: 0, step: 1 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      '& fieldset': {
                        borderColor: 'var(--color-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--color-accent)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text-muted)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-accent)',
                    },
                  }}
                />

                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isLoading}
                    sx={{
                      flex: 1,
                      bgcolor: 'var(--color-accent)',
                      color: 'var(--color-bg)',
                      textTransform: 'none',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: '0.9375rem',
                      padding: '0.875rem',
                      '&:hover': {
                        bgcolor: 'var(--color-accent-hover)',
                      },
                      '&:disabled': {
                        bgcolor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={20} sx={{ color: 'var(--color-bg)' }} />
                    ) : (
                      isEditMode ? 'Update Book' : 'Add Book'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => navigate('/dashboard/books')}
                    disabled={isLoading}
                    sx={{
                      flex: 1,
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      textTransform: 'none',
                      fontFamily: 'var(--font-body)',
                      '&:hover': {
                        borderColor: 'var(--color-accent)',
                        bgcolor: 'rgba(201, 162, 39, 0.1)',
                      },
                      '&:disabled': {
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                      },
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </DashboardLayout>
  )
}

export default AddBookPage
