import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Lock, Save, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Toast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function SettingsPage() {
  const { updatePassword } = useAuth()
  
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters long', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    setSubmitting(true)
    try {
      await updatePassword(newPassword)
      showToast('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to update password', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your platform credentials, update your secure login password and configure privacy settings."
      />

      <Card className="p-7">
        <h3 className="text-base font-semibold text-text-main font-outfit mb-6 pb-4 border-b border-surface-border flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand" />
          Update Password Credentials
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              New Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-3.5 top-3 text-text-muted" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main placeholder:text-text-light focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all"
                placeholder="Enter new password (min. 6 chars)"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-text-muted hover:text-text-main transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-muted tracking-wide mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-text-muted" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main placeholder:text-text-light focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all"
                placeholder="Confirm your new password"
                required
              />
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              fullWidth
              disabled={submitting}
              isLoading={submitting}
              icon={<Save size={16} />}
            >
              {submitting ? 'Updating password...' : 'Save Password Upgrade'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Floating Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
