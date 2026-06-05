import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { 
  TrendingUp, Award, Trophy, Crown, Sparkles, 
  ChevronRight, Users, Star, Medal
} from 'lucide-react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function LeaderboardPage() {
  const { user, userRole } = useAuth()
  const [roleTab, setRoleTab] = useState('DTD')
  const [loading, setLoading] = useState(true)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      // Try to load from leaderboards cache table
      const { data: cacheData, error: cacheError } = await supabase
        .from('leaderboards')
        .select('*, user:users(id, name, club, pilot_id)')
        .eq('role', roleTab)
        .order('rank', { ascending: true })

      if (cacheError) throw cacheError

      if (cacheData && cacheData.length > 0) {
        setLeaderboardData(cacheData)
      } else {
        // Fallback: Calculate leaderboards dynamically by counting activities
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('id, name, club, pilot_id')
          .eq('role', roleTab)
          .eq('status', 'Active')

        if (usersError) throw usersError

        const { data: activitiesData, error: actsError } = await supabase
          .from('activities')
          .select('user_id, status')
          .eq('status', 'Reviewed') // only count reviewed activities

        if (actsError) throw actsError

        // Count activities by user
        const counts = {}
        activitiesData?.forEach(act => {
          counts[act.user_id] = (counts[act.user_id] || 0) + 1
        })

        // Map and sort users
        const calculated = usersData.map(u => ({
          user_id: u.id,
          user: u,
          activity_count: counts[u.id] || 0
        }))
        
        calculated.sort((a, b) => b.activity_count - a.activity_count)

        // Assign ranks
        const ranked = calculated.map((item, index) => ({
          ...item,
          rank: index + 1
        }))

        setLeaderboardData(ranked)
      }
    } catch (err) {
      console.error(err)
      showToast('Error loading leaderboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLeaderboard()
  }, [roleTab])

  // Extract podium and remaining rows
  const podium = leaderboardData.slice(0, 3)
  const remaining = leaderboardData.slice(3)

  const columns = [
    {
      header: 'Rank',
      accessor: 'rank',
      sortable: true,
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs text-text-muted bg-surface-muted border border-surface-border">
          #{row.rank}
        </span>
      )
    },
    {
      header: 'Name',
      accessor: 'user.name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full bg-surface-muted border border-surface-border text-xs font-semibold flex items-center justify-center text-text-main uppercase ${
            row.user_id === user?.id ? 'ring-2 ring-brand ring-offset-1' : ''
          }`}>
            {row.user?.name?.slice(0, 2)}
          </div>
          <div>
            <span className={`font-semibold text-sm block ${
              row.user_id === user?.id ? 'text-brand' : 'text-text-main'
            }`}>
              {row.user?.name}
              {row.user_id === user?.id && <Badge variant="success" className="ml-2">You</Badge>}
            </span>
            <span className="text-xs text-text-muted block mt-0.5">{row.user?.pilot_id}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Rotaract Club',
      accessor: 'user.club',
      render: (row) => <span className="text-sm text-text-muted font-medium">{row.user?.club || '-'}</span>
    },
    {
      header: 'Points',
      accessor: 'activity_count',
      sortable: true,
      render: (row) => (
        <span className="text-sm font-semibold text-text-main">
          {row.activity_count} <span className="text-xs text-text-muted font-medium uppercase ml-1">pts</span>
        </span>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leaderboards"
        subtitle="Track top-performing training candidates and trainers across the district."
      />

      {/* Role Tabs toggler */}
      {userRole !== 'DTD' && (
        <div className="flex justify-center">
          <div className="bg-surface-muted p-1 border border-surface-border rounded-xl flex gap-1 w-full max-w-sm">
            <button
              onClick={() => setRoleTab('DTD')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                roleTab === 'DTD'
                  ? 'bg-white text-text-main shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Deputy Trainers (DTD)
            </button>
            <button
              onClick={() => setRoleTab('DT')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                roleTab === 'DT'
                  ? 'bg-white text-text-main shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              District Trainers (DT)
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Podium section */}
          {podium.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6 max-w-4xl mx-auto pt-6 px-4">
              
              {/* 2nd Place */}
              {podium[1] && (
                <Card className="p-6 text-center relative flex flex-col items-center order-2 md:order-1 transition-all duration-300">
                  <div className="absolute -top-5 bg-surface-muted text-text-main p-2.5 rounded-xl border border-surface-border flex items-center justify-center">
                    <Medal size={20} className="text-gray-400" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-surface-muted border border-surface-border text-base font-semibold flex items-center justify-center text-text-main uppercase mt-4 mb-3">
                    {podium[1].user?.name?.slice(0, 2)}
                  </div>
                  <h4 className="font-semibold text-sm text-text-main line-clamp-1">{podium[1].user?.name}</h4>
                  <p className="text-xs text-text-muted font-medium uppercase mt-1">{podium[1].user?.club}</p>
                  <div className="mt-4 bg-surface-muted px-4 py-1.5 rounded-lg text-xs font-medium text-text-main border border-surface-border">
                    2nd Place • {podium[1].activity_count} pts
                  </div>
                </Card>
              )}

              {/* 1st Place */}
              {podium[0] && (
                <Card className="p-8 text-center relative flex flex-col items-center order-1 md:order-2 transition-all duration-300 md:-translate-y-4 shadow-floating bg-white/50 backdrop-blur-md">
                  <div className="absolute -top-6 bg-brand text-white p-3.5 rounded-xl shadow-sm flex items-center justify-center">
                    <Crown size={24} />
                  </div>
                  <div className="w-20 h-20 rounded-full bg-brand-light border border-brand/20 text-lg font-bold flex items-center justify-center text-brand uppercase mt-4 mb-3">
                    {podium[0].user?.name?.slice(0, 2)}
                  </div>
                  <h4 className="font-semibold text-base text-text-main line-clamp-1">{podium[0].user?.name}</h4>
                  <p className="text-xs text-text-muted font-medium uppercase mt-1">{podium[0].user?.club}</p>
                  <div className="mt-5 bg-brand text-white px-5 py-2 rounded-lg text-xs font-medium shadow-sm">
                    1st Place • {podium[0].activity_count} pts
                  </div>
                </Card>
              )}

              {/* 3rd Place */}
              {podium[2] && (
                <Card className="p-6 text-center relative flex flex-col items-center order-3 transition-all duration-300">
                  <div className="absolute -top-5 bg-surface-muted text-text-main p-2.5 rounded-xl border border-surface-border flex items-center justify-center">
                    <Medal size={20} className="text-orange-400" />
                  </div>
                  <div className="w-16 h-16 rounded-full bg-surface-muted border border-surface-border text-base font-semibold flex items-center justify-center text-text-main uppercase mt-4 mb-3">
                    {podium[2].user?.name?.slice(0, 2)}
                  </div>
                  <h4 className="font-semibold text-sm text-text-main line-clamp-1">{podium[2].user?.name}</h4>
                  <p className="text-xs text-text-muted font-medium uppercase mt-1">{podium[2].user?.club}</p>
                  <div className="mt-4 bg-surface-muted px-4 py-1.5 rounded-lg text-xs font-medium text-text-main border border-surface-border">
                    3rd Place • {podium[2].activity_count} pts
                  </div>
                </Card>
              )}

            </div>
          )}

          {/* Ranks 4+ Table */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-text-main font-outfit">Complete Ranked Listing</h3>
            <DataTable
              columns={columns}
              data={remaining}
              searchPlaceholder="Search rank listings..."
              searchKey="user.name"
              emptyTitle="No Further Rankings"
              emptyDescription="There are no other active trainers currently ranked."
            />
          </div>

        </div>
      )}

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
