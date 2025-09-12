import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { authAPI, tenantAPI } from '../services/api'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token')
      if (!token) {
        setLoading(false)
        return
      }

      const response = await authAPI.getMe()
      setUser(response.data.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      Cookies.remove('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const { token, user } = response.data
      
      Cookies.set('token', token, { expires: 1 }) // 1 day
      setUser(user)
      
      // Redirect to home page after successful login
      router.push('/')
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
    // Redirect to login page after logout
    router.push('/login')
  }

  const upgradeTenant = async () => {
    try {
      await tenantAPI.upgrade(user.tenant.slug)
      // Refresh user data to get updated tenant info
      await checkAuth()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Upgrade failed' 
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    logout,
    upgradeTenant
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
