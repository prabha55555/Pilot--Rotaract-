import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { api } from '../../services/api'
import { 
  User, Mail, Shield, Building, Award, Calendar, 
  Phone, Save, Edit2, CheckCircle2, TrendingUp, Activity
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Toast } from '../../components/ui/Toast'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function ProfilePage() {
  const { user, userRole } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState(null)

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [club, setClub] = useState('')
  const [batch, setBatch] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Stats State
  const [activityCount, setActivityCount] = useState(0)
  const [rank, setRank] = useState('-')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadProfile = async () => {
    if (!user) return
    setLoading(true)
    try {
      // 1. Load user record
      const data = await api.getUser(user.id)
      setProfileData(data)
      setName(data?.name || '')
      setPhone(data?.phone || '')
      setClub(data?.club || '')
      setBatch(data?.batch || '')

      // 2. Load activity count
      const { count } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setActivityCount(count || 0)

      // 3. Load leaderboard rank
      const { data: rankData } = await supabase
        .from('leaderboards')
        .select('rank')
        .eq('user_id', user.id)
        .maybeSingle()
      setRank(rankData?.rank || 'Unranked')

    } catch (err) {
      console.error(err)
      showToast('Error loading profile details', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!name) {
      showToast('Name is a required field', 'error')
      return
    }

    // Validate and sanitize Phone if provided
    let cleanPhone = phone
    if (phone) {
      let digits = phone.replace(/\D/g, '')
      if (digits.startsWith('91') && digits.length === 12) {
        digits = digits.substring(2)
      } else if (digits.startsWith('0') && digits.length === 11) {
        digits = digits.substring(1)
      }
      if (digits.length !== 10) {
        showToast('Phone number must be exactly 10 digits', 'error')
        return
      }
      cleanPhone = digits
    }

    setSubmitting(true)
    try {
      const updated = await api.updateUser(user.id, {
        name,
        phone: cleanPhone,
        club,
        batch
      })
      setProfileData(updated)
      setIsEditing(false)
      showToast('Profile information updated successfully!')
    } catch (err) {
      console.error(err)
      showToast('Failed to update profile information', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal information, Rotaract club affiliation, and view your district rank."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Card - Summary & Badges */}
        <Card className="p-6 text-center flex flex-col items-center justify-between">
          <div className="w-full flex flex-col items-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-brand to-brand-light text-white text-3xl font-extrabold flex items-center justify-center uppercase shadow-lg shadow-brand/20 mb-5 border-2 border-white">
              {profileData?.name?.slice(0, 2)}
            </div>
            
            <h3 className="text-xl font-bold text-text-main">{profileData?.name}</h3>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
              ID: {profileData?.pilot_id}
            </p>
            
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Badge variant={userRole}>{userRole}</Badge>
              <Badge variant={profileData?.status === 'Active' ? 'success' : 'default'}>{profileData?.status}</Badge>
            </div>
          </div>

          {/* Stats quick view */}
          <div className="w-full grid grid-cols-2 gap-4 border-t border-surface-border pt-6 mt-6">
            <div className="bg-brand-light/30 p-3.5 border border-brand/20 rounded-2xl flex flex-col items-center">
              <Activity className="text-brand mb-1" size={18} />
              <span className="text-xl font-extrabold text-text-main">{activityCount}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Logs</span>
            </div>
            <div className="bg-semantic-success/10 p-3.5 border border-semantic-success/20 rounded-2xl flex flex-col items-center">
              <TrendingUp className="text-semantic-success mb-1" size={18} />
              <span className="text-xl font-extrabold text-semantic-success">{rank !== 'Unranked' ? `#${rank}` : '-'}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">Rank</span>
            </div>
          </div>
        </Card>

        {/* Right Card - Profile Details Form */}
        <Card className="lg:col-span-2 p-7">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-surface-border">
            <h4 className="text-base font-semibold text-text-main font-outfit">Account Credentials & Details</h4>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
              >
                <Edit2 size={13} />
                Edit Profile
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    type="email"
                    value={profileData?.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-light focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (val.length <= 10) {
                        setPhone(val)
                      }
                    }}
                    maxLength={10}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Rotaract Club Affiliation
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={club}
                    onChange={(e) => setClub(e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder="e.g. Rotaract Club of Chennai"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Batch Year
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-main focus:outline-none focus:border-brand/30 focus:ring-4 focus:ring-brand/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">
                  Registration Date
                </label>
                <div className="relative">
                  <CheckCircle2 className="absolute left-3.5 top-3 text-text-muted" size={16} />
                  <input
                    type="text"
                    value={new Date(profileData?.created_at).toLocaleDateString()}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 bg-surface-muted border border-surface-border rounded-xl text-sm font-medium text-text-light focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-surface-border mt-6">
                <Button
                  variant="outline"
                  type="button"
                  fullWidth
                  onClick={() => {
                    setIsEditing(false)
                    setName(profileData?.name || '')
                    setPhone(profileData?.phone || '')
                    setClub(profileData?.club || '')
                    setBatch(profileData?.batch || '')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  fullWidth
                  disabled={submitting}
                  isLoading={submitting}
                  icon={<Save size={16} />}
                >
                  {submitting ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </div>
            )}
          </form>
        </Card>

      </div>

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
