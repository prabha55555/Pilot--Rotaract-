import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import logo from '../../utils/logo.png'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle, error: authError, setError: setAuthError } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (setAuthError) setAuthError(null)
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    if (setAuthError) setAuthError(null)
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value)
    if (error) setError('')
    if (authError && setAuthError) setAuthError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4 relative overflow-hidden">
      {/* Subtle Background Gradients - Concept B */}
      <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-white rounded-full blur-[100px] opacity-60"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-brand-light rounded-full blur-[120px] opacity-40"></div>

      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 sm:p-10 shadow-floating border-0 bg-white/90 backdrop-blur-xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img src={logo} alt="PILOT" className="h-12 w-auto" />
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold font-outfit text-text-main mb-2">
              Welcome back
            </h1>
            <p className="text-text-muted text-sm">
              Sign in to your PILOT workspace
            </p>
          </div>

          {/* Error Message */}
          {(error || authError) && (
            <div className="bg-semantic-errorLight border border-semantic-error/20 text-semantic-error px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="text-sm font-medium">{error || authError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={handleInputChange(setEmail)}
              placeholder="you@example.com"
              icon={<Mail size={18} />}
              required
            />

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-main">Password</label>
                <Link to="/forgot-password" className="text-brand text-xs font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                  placeholder="Enter your password"
                  icon={<Lock size={18} />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loading}
              className="mt-2 py-2.5"
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-text-muted font-medium">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            isLoading={googleLoading}
            onClick={handleGoogleLogin}
            className="py-2.5 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>
          
          <div className="mt-8 pt-6 border-t border-surface-border text-center">
            <p className="text-sm text-text-muted font-outfit">
              Secure login via PILOT district credentials
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
