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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material'
import DashboardLayout from '../../components/DashboardLayout'
import '../../App.css'
import { getStoredToken, fetchBooks, type Book } from '../../lib/api'
import { useHomeStore } from './useHomeStore'
import { isOverdue, formatDate, getDaysUntilDue } from './utils'
import type { User } from './types'

function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(
    (location.state as { user?: User })?.user || null
  )
  const [books, setBooks] = useState<Book[]>([])
  const [isBooksLoading, setIsBooksLoading] = useState(false)

  const {
    borrows,
    allBorrows,
    isLoading,
    error,
    returningBorrowId,
    setError,
    loadBorrows,
    handleReturn,
  } = useHomeStore()

  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      navigate('/login')
      return
    }

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
  }, [navigate, user])

  useEffect(() => {
    const loadBooks = async () => {
      setIsBooksLoading(true)
      try {
        const data = await fetchBooks()
        setBooks(data)
      } catch (e) {
        // Silently ignore book loading errors; main borrows flow still works
      } finally {
        setIsBooksLoading(false)
      }
    }

    loadBooks()
  }, [])

  useEffect(() => {
    if (user) {
      const isLibrarian = user.roles.includes('librarian')
      loadBorrows(user.id, isLibrarian)
    }
  }, [user, loadBorrows])

  const overdueBorrows = borrows.filter((borrow) => isOverdue(borrow.due_at))
  const upcomingBorrows = borrows.filter((borrow) => !isOverdue(borrow.due_at))

  const isLibrarian = user?.roles.includes('librarian') || false
  const isAnyLoading = isLoading || isBooksLoading

  const totalBooks = books.reduce((sum, book) => sum + (book.copies ?? 0), 0)
  const totalBorrowed = isLibrarian ? allBorrows.length : borrows.length
  const availableBooks = Math.max(totalBooks - totalBorrowed, 0)

  const pieBorrowedPercentage =
    totalBooks > 0 ? Math.min(100, Math.round((totalBorrowed / totalBooks) * 100)) : 0

  const todaySource = isLibrarian ? allBorrows : borrows
  const todayDueBorrows = todaySource.filter((borrow) => getDaysUntilDue(borrow.due_at) === 0)

  const membersWithDueBooksMap = new Map<string, number>()
  ;(isLibrarian ? allBorrows : borrows).forEach((borrow) => {
    const daysUntilDue = getDaysUntilDue(borrow.due_at)
    if (daysUntilDue !== null && daysUntilDue <= 0) {
      const email = borrow.user?.email || 'Unknown User'
      membersWithDueBooksMap.set(email, (membersWithDueBooksMap.get(email) || 0) + 1)
    }
  })

  const membersWithDueBooks = Array.from(membersWithDueBooksMap.entries()).map(
    ([email, count]) => ({ email, count })
  )

  if (!user) {
    return null
  }

  return (
    <DashboardLayout user={user} title="Home">
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
              {isLibrarian ? 'Library Management' : 'My Borrowed Books'}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-body)',
              }}
            >
              {isLibrarian
                ? 'Manage all borrowed books and track due dates'
                : 'Manage your borrowed books and track due dates'}
            </Typography>
          </Box>

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
          {isAnyLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: 'var(--color-accent)' }} />
            </Box>
          )}

          {/* Content */}
          {!isAnyLoading && !error && (
            <>
              {/* Summary / Pie Chart Section (librarian only) */}
              {isLibrarian && (
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 2fr)' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Card
                      sx={{
                        bgcolor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 2,
                        height: '100%',
                      }}
                    >
                      <CardContent>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                            mb: 2,
                          }}
                        >
                          Library Overview
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              width: 120,
                              height: 120,
                            }}
                          >
                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
                              <path
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="rgba(255,255,255,0.08)"
                                strokeWidth="2.5"
                              />
                              <path
                                d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="var(--color-accent)"
                                strokeWidth="2.8"
                                strokeDasharray={`${pieBorrowedPercentage}, 100`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <Box
                              sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontFamily: 'var(--font-display)',
                                  fontWeight: 600,
                                  color: 'var(--color-text)',
                                }}
                              >
                                {totalBorrowed}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'var(--color-text-muted)',
                                  fontFamily: 'var(--font-body)',
                                }}
                              >
                                Borrowed
                              </Typography>
                            </Box>
                          </Box>
                          <Stack spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              Total books:{' '}
                              <Typography
                                component="span"
                                sx={{
                                  color: 'var(--color-text)',
                                  fontWeight: 500,
                                }}
                              >
                                {totalBooks}
                              </Typography>
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              Borrowed:{' '}
                              <Typography
                                component="span"
                                sx={{
                                  color: 'var(--color-text)',
                                  fontWeight: 500,
                                }}
                              >
                                {totalBorrowed}
                              </Typography>
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              Available:{' '}
                              <Typography
                                component="span"
                                sx={{
                                  color: 'var(--color-text)',
                                  fontWeight: 500,
                                }}
                              >
                                {availableBooks}
                              </Typography>
                            </Typography>
                          </Stack>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 3,
                    }}
                  >
                    <Box>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'var(--color-surface)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 2,
                          height: '100%',
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontFamily: 'var(--font-display)',
                            fontWeight: 500,
                            color: 'var(--color-text)',
                            mb: 1.5,
                          }}
                        >
                          Books Due Today ({todayDueBorrows.length})
                        </Typography>
                        {todayDueBorrows.length === 0 ? (
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'var(--color-text-muted)',
                              fontFamily: 'var(--font-body)',
                            }}
                          >
                            No books are due today.
                          </Typography>
                        ) : (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  sx={{
                                    fontFamily: 'var(--font-body)',
                                    fontWeight: 600,
                                    color: 'var(--color-text)',
                                  }}
                                >
                                  Title
                                </TableCell>
                                {isLibrarian && (
                                  <TableCell
                                    sx={{
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                      color: 'var(--color-text)',
                                    }}
                                  >
                                    Member
                                  </TableCell>
                                )}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {todayDueBorrows.map((borrow) => (
                                <TableRow key={borrow.id}>
                                  <TableCell
                                    sx={{
                                      fontFamily: 'var(--font-body)',
                                      color: 'var(--color-text)',
                                    }}
                                  >
                                    {borrow.book?.title || 'Unknown Book'}
                                  </TableCell>
                                  {isLibrarian && (
                                    <TableCell
                                      sx={{
                                        fontFamily: 'var(--font-body)',
                                        color: 'var(--color-text-muted)',
                                      }}
                                    >
                                      {borrow.user?.email || 'Unknown User'}
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Paper>
                    </Box>

                    {isLibrarian && (
                      <Box>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: 'var(--color-surface)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 2,
                            height: '100%',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 500,
                              color: 'var(--color-text)',
                              mb: 1.5,
                            }}
                          >
                            Members with Due Books ({membersWithDueBooks.length})
                          </Typography>
                          {membersWithDueBooks.length === 0 ? (
                            <Typography
                              variant="body2"
                              sx={{
                                color: 'var(--color-text-muted)',
                                fontFamily: 'var(--font-body)',
                              }}
                            >
                              No members have books due today or overdue.
                            </Typography>
                          ) : (
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell
                                    sx={{
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                      color: 'var(--color-text)',
                                    }}
                                  >
                                    Member
                                  </TableCell>
                                  <TableCell
                                    sx={{
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                      color: 'var(--color-text)',
                                    }}
                                  >
                                    Due Books
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {membersWithDueBooks.map((member) => (
                                  <TableRow key={member.email}>
                                    <TableCell
                                      sx={{
                                        fontFamily: 'var(--font-body)',
                                        color: 'var(--color-text)',
                                      }}
                                    >
                                      {member.email}
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontFamily: 'var(--font-body)',
                                        color: 'var(--color-text-muted)',
                                      }}
                                    >
                                      {member.count}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </Box>
              )}

              {/* Librarian Table Section */}
              {isLibrarian && allBorrows.length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      mb: 2,
                    }}
                  >
                    All Borrowed Books ({allBorrows.length})
                  </Typography>
                  <TableContainer
                    component={Paper}
                    sx={{
                      bgcolor: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 2,
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell
                            sx={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Book Title
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Author
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Borrower
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Due Date
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Status
                          </TableCell>
                          <TableCell
                            sx={{
                              fontFamily: 'var(--font-body)',
                              fontWeight: 600,
                              color: 'var(--color-text)',
                            }}
                          >
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {allBorrows.map((borrow) => {
                          const overdue = isOverdue(borrow.due_at)
                          const daysUntilDue = getDaysUntilDue(borrow.due_at)
                          return (
                            <TableRow
                              key={borrow.id}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'rgba(0, 0, 0, 0.02)',
                                },
                                ...(overdue && {
                                  bgcolor: 'rgba(244, 67, 54, 0.05)',
                                }),
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontFamily: 'var(--font-body)',
                                  color: 'var(--color-text)',
                                }}
                              >
                                {borrow.book?.title || 'Unknown Book'}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontFamily: 'var(--font-body)',
                                  color: 'var(--color-text-muted)',
                                }}
                              >
                                {borrow.book?.author || 'Unknown Author'}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontFamily: 'var(--font-body)',
                                  color: 'var(--color-text-muted)',
                                }}
                              >
                                {borrow.user?.email || 'Unknown User'}
                              </TableCell>
                              <TableCell
                                sx={{
                                  fontFamily: 'var(--font-body)',
                                  color: overdue ? '#f44336' : 'var(--color-text-muted)',
                                  fontWeight: overdue ? 600 : 400,
                                }}
                              >
                                {formatDate(borrow.due_at)}
                                {daysUntilDue !== null && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: 'block',
                                      color: overdue ? '#d32f2f' : 'var(--color-text-muted)',
                                      mt: 0.5,
                                    }}
                                  >
                                    {overdue
                                      ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue`
                                      : daysUntilDue === 0
                                      ? 'Due today'
                                      : daysUntilDue === 1
                                      ? 'Due tomorrow'
                                      : `${daysUntilDue} days remaining`}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {overdue ? (
                                  <Chip
                                    label="OVERDUE"
                                    size="small"
                                    sx={{
                                      bgcolor: '#f44336',
                                      color: '#fff',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                    }}
                                  />
                                ) : daysUntilDue !== null && daysUntilDue <= 3 ? (
                                  <Chip
                                    label="DUE SOON"
                                    size="small"
                                    sx={{
                                      bgcolor: '#ff9800',
                                      color: '#fff',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                    }}
                                  />
                                ) : (
                                  <Chip
                                    label="ACTIVE"
                                    size="small"
                                    sx={{
                                      bgcolor: 'var(--color-accent)',
                                      color: '#000',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                    }}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleReturn(borrow.id, user.id, isLibrarian)}
                                  disabled={returningBorrowId === borrow.id}
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
                                  {returningBorrowId === borrow.id ? (
                                    <CircularProgress size={16} sx={{ color: 'var(--color-text-muted)' }} />
                                  ) : (
                                    'Return'
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Overdue Books Section */}
              {overdueBorrows.length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: '#f44336',
                      mb: 2,
                    }}
                  >
                    Overdue Books ({overdueBorrows.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {overdueBorrows.map((borrow) => {
                      const daysOverdue = getDaysUntilDue(borrow.due_at)
                      return (
                        <Grid item xs={12} sm={6} md={4} key={borrow.id}>
                          <Card
                            sx={{
                              bgcolor: 'rgba(244, 67, 54, 0.05)',
                              border: '2px solid #f44336',
                              borderRadius: 2,
                              height: '100%',
                            }}
                          >
                            <CardContent>
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
                                    }}
                                  >
                                    {borrow.book?.title || 'Unknown Book'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'var(--color-accent)',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {borrow.book?.author || 'Unknown Author'}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Chip
                                    label="OVERDUE"
                                    size="small"
                                    sx={{
                                      bgcolor: '#f44336',
                                      color: '#fff',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 600,
                                      mb: 1,
                                    }}
                                  />
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: '#f44336',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 500,
                                    }}
                                  >
                                    Due: {formatDate(borrow.due_at)}
                                  </Typography>
                                  {daysOverdue !== null && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: '#d32f2f',
                                        fontFamily: 'var(--font-body)',
                                      }}
                                    >
                                      {Math.abs(daysOverdue)} day{daysOverdue !== -1 ? 's' : ''} overdue
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>
                </Box>
              )}

              {/* Upcoming Books Section */}
              {upcomingBorrows.length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 500,
                      color: 'var(--color-text)',
                      mb: 2,
                    }}
                  >
                    Borrowed Books ({upcomingBorrows.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {upcomingBorrows.map((borrow) => {
                      const daysUntilDue = getDaysUntilDue(borrow.due_at)
                      const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0
                      return (
                        <Grid item xs={12} sm={6} md={4} key={borrow.id}>
                          <Card
                            sx={{
                              bgcolor: isDueSoon
                                ? 'rgba(255, 152, 0, 0.05)'
                                : 'var(--color-surface)',
                              border: isDueSoon
                                ? '1px solid #ff9800'
                                : '1px solid var(--color-border)',
                              borderRadius: 2,
                              height: '100%',
                            }}
                          >
                            <CardContent>
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
                                    }}
                                  >
                                    {borrow.book?.title || 'Unknown Book'}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'var(--color-accent)',
                                      fontFamily: 'var(--font-body)',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {borrow.book?.author || 'Unknown Author'}
                                  </Typography>
                                </Box>
                                <Box>
                                  {isDueSoon && (
                                    <Chip
                                      label="DUE SOON"
                                      size="small"
                                      sx={{
                                        bgcolor: '#ff9800',
                                        color: '#fff',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: 600,
                                        mb: 1,
                                      }}
                                    />
                                  )}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: 'var(--color-text-muted)',
                                      fontFamily: 'var(--font-body)',
                                    }}
                                  >
                                    Due: {formatDate(borrow.due_at)}
                                  </Typography>
                                  {daysUntilDue !== null && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: isDueSoon ? '#ff9800' : 'var(--color-text-muted)',
                                        fontFamily: 'var(--font-body)',
                                        fontWeight: isDueSoon ? 600 : 400,
                                      }}
                                    >
                                      {daysUntilDue === 0
                                        ? 'Due today'
                                        : daysUntilDue === 1
                                        ? 'Due tomorrow'
                                        : `${daysUntilDue} days remaining`}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    })}
                  </Grid>
                </Box>
              )}

              {/* Empty State */}
              {borrows.length === 0 && (
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
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 48, height: 48, color: 'var(--color-text-muted)' }}>
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'var(--color-text-muted)',
                      mb: 1,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    No borrowed books
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    You don't have any active borrows. Visit the Books page to borrow a book.
                  </Typography>
                </Paper>
              )}
            </>
          )}
        </Stack>
      </Container>
    </DashboardLayout>
  )
}

export default HomePage
