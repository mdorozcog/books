import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import '../App.css'
import { getStoredToken, removeStoredToken } from '../lib/api'

interface User {
  email: string
  roles: string[]
}

function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(
    (location.state as { user?: User })?.user || null
  )

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

  if (!user) {
    return null
  }

  return (
    <div className="login-container">
      <div className="login-backdrop" />
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1>Welcome!</h1>
          <p>You're signed in as {user.email}</p>
        </div>
        {user.roles.length > 0 && (
          <div className="user-roles">
            {user.roles.map((role) => (
              <span key={role} className="role-badge">{role}</span>
            ))}
          </div>
        )}
        <div style={{ marginTop: '2rem' }}>
          <button onClick={handleLogout} className="login-button">
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
