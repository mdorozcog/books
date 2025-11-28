import { useState } from 'react'
import { useNavigate } from 'react-router'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Checkbox,
  FormControlLabel,
  Link,
  CircularProgress,
  Stack,
} from '@mui/material'
import '../App.css'
import { login, setStoredToken } from '../lib/api'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await login(email, password)
      setStoredToken(response.token)
      // Navigate to dashboard after successful login
      navigate('/dashboard', { state: { user: response.user } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box className="login-container">
      <Box className="login-backdrop" />
      
      <Container maxWidth="xs">
        <Paper 
          elevation={0}
          sx={{
            position: 'relative',
            padding: 4,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 2,
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.03), 0 20px 50px -20px rgba(0, 0, 0, 0.5)',
            animation: 'cardFadeIn 0.6s ease-out',
          }}
        >
          <Stack spacing={3}>
            {/* Header */}
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  margin: '0 auto 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                  borderRadius: 2,
                  color: 'var(--color-bg)',
                  animation: 'logoFloat 3s ease-in-out infinite',
                }}
              >
                <svg 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                  style={{ width: 28, height: 28 }}
                >
                  <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </Box>
              <Typography 
                variant="h4" 
                component="h1"
                sx={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  marginBottom: 0.5,
                }}
              >
                Welcome
              </Typography>
              <Typography 
                variant="body2"
                sx={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Sign in to your Books account
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  id="email"
                  type="email"
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
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
                  id="password"
                  type="password"
                  label="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
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

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: 'var(--color-text-muted)',
                          '&.Mui-checked': {
                            color: 'var(--color-accent)',
                          },
                        }}
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Remember me
                      </Typography>
                    }
                  />
                  <Link
                    href="#"
                    sx={{
                      color: 'var(--color-accent)',
                      textDecoration: 'none',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-body)',
                      '&:hover': {
                        color: 'var(--color-accent-hover)',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
                    color: 'var(--color-bg)',
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    textTransform: 'none',
                    borderRadius: 1,
                    boxShadow: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, var(--color-accent-hover), #9b6cf6)',
                      boxShadow: '0 4px 12px rgba(201, 162, 39, 0.3)',
                    },
                    '&:disabled': {
                      background: 'var(--color-border)',
                      color: 'var(--color-text-muted)',
                    },
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={20} sx={{ color: 'var(--color-bg)' }} />
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', marginTop: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--color-text-muted)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                Don't have an account?{' '}
                <Link
                  href="#"
                  sx={{
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'var(--color-accent-hover)',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Create one
                </Link>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default LoginPage
