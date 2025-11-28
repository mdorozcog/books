import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Container,
  Paper,
  Stack,
  Button,
} from '@mui/material'
// Icon components
const MenuIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <path d="M3 12h18M3 6h18M3 18h18" />
  </svg>
)

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
)

const MenuBookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 24, height: 24 }}>
    <path d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
  </svg>
)

const AddCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </svg>
)

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const PersonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 24, height: 24 }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
  </svg>
)
import '../App.css'
import { getStoredToken, removeStoredToken } from '../lib/api'

interface User {
  email: string
  roles: string[]
}

const DRAWER_WIDTH = 280

function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user] = useState<User | null>(
    (location.state as { user?: User })?.user || null
  )
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    // If no user in state, check if we have a token
    // In a real app, you'd verify the token with the backend
    if (!user) {
      const token = getStoredToken()
      if (!token) {
        navigate('/login')
      }
    }
  }, [user, navigate])

  const handleLogout = () => {
    removeStoredToken()
    navigate('/login')
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  if (!user) {
    return null
  }

  const isLibrarian = user.roles.includes('librarian')
  const isMember = user.roles.includes('member')

  // Define menu items based on user roles
  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      roles: ['librarian', 'member'],
    },
    {
      text: 'All Books',
      icon: <MenuBookIcon />,
      path: '/dashboard/books',
      roles: ['librarian', 'member'],
    },
    {
      text: 'Add Book',
      icon: <AddCircleIcon />,
      path: '/dashboard/books/new',
      roles: ['librarian'],
    },
    {
      text: 'Search Books',
      icon: <SearchIcon />,
      path: '/dashboard/books/search',
      roles: ['librarian', 'member'],
    },
    {
      text: 'Profile',
      icon: <PersonIcon />,
      path: '/dashboard/profile',
      roles: ['librarian', 'member'],
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/dashboard/settings',
      roles: ['librarian'],
    },
  ].filter((item) => item.roles.some((role) => user.roles.includes(role)))

  const drawer = (
    <Box>
      <Toolbar
        sx={{
          background: 'linear-gradient(135deg, var(--color-accent), #8b5cf6)',
          color: 'var(--color-bg)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <MenuBookIcon />
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Books App
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar
            sx={{
              bgcolor: 'var(--color-accent)',
              width: 48,
              height: 48,
            }}
          >
            {user.email.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'var(--color-text)',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
              {user.roles.map((role) => (
                <Chip
                  key={role}
                  label={role}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    bgcolor: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                    fontWeight: 500,
                    textTransform: 'capitalize',
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                // Navigate to the path (you can implement routing here)
                console.log(`Navigate to ${item.path}`)
              }}
              sx={{
                '&:hover': {
                  bgcolor: 'rgba(201, 162, 39, 0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: 'var(--color-text-muted)',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: 'var(--color-text)',
                    fontSize: '0.9375rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: 'var(--color-text)',
            borderColor: 'var(--color-border)',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'var(--color-accent)',
              bgcolor: 'rgba(201, 162, 39, 0.1)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'var(--color-bg)' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          bgcolor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: 'none',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'var(--color-text)' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: 'var(--color-text)', fontWeight: 500 }}
          >
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'var(--color-surface)',
              borderRight: '1px solid var(--color-border)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Container maxWidth="lg">
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
                  Welcome back!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  You're signed in as {user.email}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'var(--color-border)' }} />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'var(--color-text)',
                    mb: 2,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                  }}
                >
                  Your Roles
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      sx={{
                        bgcolor: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                        fontSize: '0.875rem',
                        height: 32,
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Divider sx={{ borderColor: 'var(--color-border)' }} />

              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: 'var(--color-text)',
                    mb: 2,
                    fontFamily: 'var(--font-body)',
                    fontWeight: 500,
                  }}
                >
                  Quick Actions
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {isLibrarian && (
                    <Button
                      variant="contained"
                      startIcon={<AddCircleIcon />}
                      sx={{
                        bgcolor: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: 'var(--color-accent-hover)',
                        },
                      }}
                    >
                      Add New Book
                    </Button>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    sx={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'var(--color-accent)',
                        bgcolor: 'rgba(201, 162, 39, 0.1)',
                      },
                    }}
                  >
                    Search Books
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MenuBookIcon />}
                    sx={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: 'var(--color-accent)',
                        bgcolor: 'rgba(201, 162, 39, 0.1)',
                      },
                    }}
                  >
                    View All Books
                  </Button>
                </Stack>
              </Box>

              {isLibrarian && (
                <>
                  <Divider sx={{ borderColor: 'var(--color-border)' }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      As a librarian, you have full access to manage books, including
                      creating, editing, and deleting book records.
                    </Typography>
                  </Box>
                </>
              )}

              {isMember && !isLibrarian && (
                <>
                  <Divider sx={{ borderColor: 'var(--color-border)' }} />
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'var(--color-text-muted)',
                        fontStyle: 'italic',
                      }}
                    >
                      As a member, you can browse and search the book catalog.
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}

export default DashboardPage
