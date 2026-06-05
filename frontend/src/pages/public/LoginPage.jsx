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
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
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
          {error && (
            <div className="bg-semantic-errorLight border border-semantic-error/20 text-semantic-error px-4 py-3 rounded-xl mb-6 flex items-start gap-3">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
          
          <div className="mt-8 pt-6 border-t border-surface-border text-center">
            <p className="text-sm text-text-muted">
              Secure login via PILOT district credentials
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
