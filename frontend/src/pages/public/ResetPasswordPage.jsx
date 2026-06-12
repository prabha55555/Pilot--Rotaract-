import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await updatePassword(password)
      setMessage('Password updated successfully. Redirecting to login...')
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please request a new link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted p-4">
      <div className="bg-white p-8 rounded-2xl shadow-floating border border-surface-border w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-text-main font-outfit">Reset Password</h1>
        <p className="text-text-muted text-sm text-center mb-6">Enter your new credentials below</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-semantic-error px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 border border-green-200 text-semantic-success px-4 py-3 rounded-xl mb-4 text-sm font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all placeholder:text-text-light"
              placeholder="Confirm password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-2.5 rounded-xl font-bold hover:bg-brand/90 transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm font-semibold text-brand hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
