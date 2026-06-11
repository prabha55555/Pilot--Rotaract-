import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FileText, Award, Calendar, Users, Activity, 
  TrendingUp, CheckCircle, Clock, AlertCircle, PlusCircle, ArrowRight, Eye
} from 'lucide-react'
import { ActivityDetailsModal } from '../../components/ui/ActivityDetailsModal'
import { StatCard } from '../../components/ui/StatCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { formatDateIST } from '../../utils/date'
import { DataTable } from '../../components/ui/DataTable'

export default function DashboardPage() {
  const { user, userRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [extraData, setExtraData] = useState({})
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // SuperAdmin promotions pipeline limit
  const [promotionsLimit, setPromotionsLimit] = useState(4)

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        if (userRole === 'DTD') {
          // 1. Activities submitted (exclude Drafts)
          const { count: activitiesCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .neq('status', 'Draft')

          // 2. Evaluation pending (Submitted / Pending Review / Resubmitted)
          const { count: pendingCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .in('status', ['Submitted', 'Pending Review', 'Resubmitted'])

          // 3. Approved count
          const { count: approvedCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'Approved')

          // 4. Rejected count
          const { count: rejectedCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'Rejected')

          // 5. Calculate Leaderboard Rank dynamically in real-time
          const { data: dtdUsers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'DTD')
            .in('status', ['Active', 'Promoted'])

          const { data: dtdApprovedActivities } = await supabase
            .from('activities')
            .select('user_id')
            .eq('status', 'Approved')

          const counts = {}
          dtdApprovedActivities?.forEach(act => {
            counts[act.user_id] = (counts[act.user_id] || 0) + 1
          })

          const dtdList = dtdUsers?.map(u => ({
            id: u.id,
            count: counts[u.id] || 0
          })) || []
          dtdList.sort((a, b) => b.count - a.count)

          const userIndex = dtdList.findIndex(item => item.id === user.id)
          const userRank = userIndex !== -1 ? userIndex + 1 : 'Unranked'
          const userPoints = userIndex !== -1 ? dtdList[userIndex].count : 0

          // 6. Latest Evaluation received
          const { data: latestEval } = await supabase
            .from('evaluations')
            .select('*, evaluator:users!evaluator_id(name)')
            .eq('candidate_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)

          // Fetch recent activities for candidate dashboard
          const { data: recentSubmissions } = await supabase
            .from('activities')
            .select('*, user:users(name, role, club, pilot_id)')
            .eq('user_id', user.id)
            .neq('status', 'Draft')
            .order('created_at', { ascending: false })

          setStats({
            activitiesCount: activitiesCount || 0,
            pendingCount: pendingCount || 0,
            approvedCount: approvedCount || 0,
            rejectedCount: rejectedCount || 0,
            rank: userRank,
            leaderboardPoints: userPoints
          })
          setExtraData({
            latestEvaluation: latestEval?.[0] || null,
            recentSubmissions: recentSubmissions || []
          })

        } else if (userRole === 'DT') {
          // 1. Total DTDs evaluated
          const { count: evaluatedCount } = await supabase
            .from('evaluations')
            .select('*', { count: 'exact', head: true })
            .eq('evaluator_id', user.id)

          // 2. Own activities submitted (exclude Drafts)
          const { count: activitiesCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .neq('status', 'Draft')

          // 3. Pending reviews (All activities submitted strictly by DTDs, LIFO order)
          const { data: pendingActivities } = await supabase
            .from('activities')
            .select('*, user:users!inner(name, club, role, pilot_id)')
            .eq('user.role', 'DTD')
            .in('status', ['Submitted', 'Pending Review', 'Resubmitted'])
            .order('created_at', { ascending: false })

          // 4. Calculate DT leaderboard rank dynamically
          const { data: dtUsers } = await supabase
            .from('users')
            .select('id')
            .eq('role', 'DT')
            .in('status', ['Active', 'Promoted'])

          const { data: dtApprovedActivities } = await supabase
            .from('activities')
            .select('user_id')
            .eq('status', 'Approved')

          const counts = {}
          dtApprovedActivities?.forEach(act => {
            counts[act.user_id] = (counts[act.user_id] || 0) + 1
          })

          const dtList = dtUsers?.map(u => ({
            id: u.id,
            count: counts[u.id] || 0
          })) || []
          dtList.sort((a, b) => b.count - a.count)

          const userIndex = dtList.findIndex(item => item.id === user.id)
          const userRank = userIndex !== -1 ? userIndex + 1 : 'Unranked'
          const userPoints = userIndex !== -1 ? dtList[userIndex].count : 0

          setStats({
            evaluatedCount: evaluatedCount || 0,
            rank: userRank,
            leaderboardPoints: userPoints,
            activitiesCount: activitiesCount || 0,
            pendingCount: pendingActivities?.length || 0
          })
          setExtraData({
            pendingActivities: pendingActivities || []
          })

        } else if (userRole === 'Admin') {
          // 1. DTD and DT counts (from all users to match User Management)
          const { data: usersData } = await supabase
            .from('users')
            .select('role')

          const dtdCount = usersData?.filter(u => u.role === 'DTD').length || 0
          const dtCount = usersData?.filter(u => u.role === 'DT').length || 0

          // 2. Pending evaluations (submitted DT activities count)
          const { count: pendingCount } = await supabase
            .from('activities')
            .select('*, user:users!inner(role)', { count: 'exact', head: true })
            .eq('user.role', 'DT')
            .in('status', ['Submitted', 'Pending Review', 'Resubmitted'])

          // 3. Recent activity submissions (DT submissions only, LIFO order)
          const { data: recentSubmissions } = await supabase
            .from('activities')
            .select('*, user:users!inner(name, role, club, pilot_id)')
            .eq('user.role', 'DT')
            .neq('status', 'Draft')
            .order('created_at', { ascending: false })

          setStats({
            dtdCount,
            dtCount,
            pendingCount: pendingCount || 0
          })
          setExtraData({
            recentSubmissions: recentSubmissions || []
          })

        } else if (userRole === 'SuperAdmin') {
          // 1. Total users count (from all users to match User Management)
          const { data: allUsers } = await supabase
            .from('users')
            .select('role, status')

          const superAdminCount = allUsers?.filter(u => u.role === 'SuperAdmin').length || 0
          const adminCount = allUsers?.filter(u => u.role === 'Admin').length || 0
          const dtCount = allUsers?.filter(u => u.role === 'DT').length || 0
          const dtdCount = allUsers?.filter(u => u.role === 'DTD').length || 0

          // 2. System activity feed (latest submissions, exclude Drafts)
          const { data: recentSubmissions } = await supabase
            .from('activities')
            .select('*, user:users(name, role, club, pilot_id)')
            .neq('status', 'Draft')
            .order('created_at', { ascending: false })

          // 3. Fetch candidates (DTD and DT) for Promotion Pipeline
          const { data: pipelineUsers } = await supabase
            .from('users')
            .select('id, name, role, club')
            .in('role', ['DTD', 'DT'])
            .in('status', ['Active', 'Promoted'])

          const pending = pipelineUsers?.map(u => ({
            id: u.id,
            candidate: u
          })) || []

          setStats({
            superAdminCount,
            adminCount,
            dtCount,
            dtdCount,
            promotionsPending: pending.length
          })
          setExtraData({
            recentSubmissions: recentSubmissions || [],
            pendingPromotions: pending
          })
        }
      } catch (error) {
        console.error('Error loading dashboard statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    // Subscribe to realtime database changes for synchronization
    const activitiesChannel = supabase
      .channel('dashboard-activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    const evaluationsChannel = supabase
      .channel('dashboard-evaluations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'evaluations' },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    const usersChannel = supabase
      .channel('dashboard-users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchDashboardData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(activitiesChannel)
      supabase.removeChannel(evaluationsChannel)
      supabase.removeChannel(usersChannel)
    }
  }, [user, userRole])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // DataTable Columns definitions
  const dtdDashboardColumns = [
    {
      header: 'Activity Title',
      accessor: 'title',
      sortable: true,
      render: (row) => <span className="font-semibold text-text-main text-sm block">{row.title}</span>
    },
    {
      header: 'Category / Avenue',
      accessor: 'category',
      sortable: true,
      render: (row) => <span className="text-xs text-text-light font-medium">{row.avenue || row.category || '-'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'Approved' ? 'success' : 
          row.status === 'Rejected' ? 'error' : 
          row.status === 'Submitted' ? 'warning' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Date Submitted',
      accessor: 'created_at',
      sortable: true,
      render: (row) => <span className="text-xs text-text-muted font-medium">{formatDateIST(row.created_at)}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => { setSelectedActivity(row); setIsDetailsOpen(true); }}
          className="p-2 bg-gray-50 text-text-muted hover:bg-gray-200 hover:text-text-main rounded-lg transition-all"
          title="View Details"
        >
          <Eye size={14} />
        </button>
      )
    }
  ]

  const dtDashboardColumns = [
    {
      header: 'Candidate Name',
      accessor: 'user.name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.user?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.user?.pilot_id || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Activity Title',
      accessor: 'title',
      sortable: true,
      render: (row) => <span className="font-semibold text-text-main text-sm block">{row.title}</span>
    },
    {
      header: 'Category / Avenue',
      accessor: 'category',
      sortable: true,
      render: (row) => <span className="text-xs text-text-light font-medium">{row.avenue || row.category || '-'}</span>
    },
    {
      header: 'Date Submitted',
      accessor: 'created_at',
      sortable: true,
      render: (row) => <span className="text-xs text-text-muted font-medium">{formatDateIST(row.created_at)}</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Eye size={14} />}
            onClick={() => { setSelectedActivity(row); setIsDetailsOpen(true); }}
          >
            Details
          </Button>
          <Button 
            size="sm"
            onClick={() => navigate('/evaluate', { state: { candidateId: row.user_id } })}
          >
            Review Candidate
          </Button>
        </div>
      )
    }
  ]

  const adminDashboardColumns = [
    {
      header: 'Trainer Name',
      accessor: 'user.name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.user?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.user?.pilot_id || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Activity Title',
      accessor: 'title',
      sortable: true,
      render: (row) => <span className="font-semibold text-text-main text-sm block">{row.title}</span>
    },
    {
      header: 'Category / Avenue',
      accessor: 'category',
      sortable: true,
      render: (row) => <span className="text-xs text-text-light font-medium">{row.avenue || row.category || '-'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'Approved' ? 'success' : 
          row.status === 'Rejected' ? 'error' : 
          row.status === 'Submitted' ? 'warning' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => { setSelectedActivity(row); setIsDetailsOpen(true); }}
          className="p-2 bg-gray-50 text-text-muted hover:bg-gray-200 hover:text-text-main rounded-lg transition-all"
          title="View Details"
        >
          <Eye size={14} />
        </button>
      )
    }
  ]

  const superAdminDashboardColumns = [
    {
      header: 'User Name',
      accessor: 'user.name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.user?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.user?.pilot_id || 'N/A'}</span>
        </div>
      )
    },
    {
      header: 'Activity Title',
      accessor: 'title',
      sortable: true,
      render: (row) => <span className="font-semibold text-text-main text-sm block">{row.title}</span>
    },
    {
      header: 'Category / Avenue',
      accessor: 'category',
      sortable: true,
      render: (row) => <span className="text-xs text-text-light font-medium">{row.avenue || row.category || '-'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'Approved' ? 'success' : 
          row.status === 'Rejected' ? 'error' : 
          row.status === 'Submitted' ? 'warning' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (row) => (
        <button
          onClick={() => { setSelectedActivity(row); setIsDetailsOpen(true); }}
          className="p-2 bg-gray-50 text-text-muted hover:bg-gray-200 hover:text-text-main rounded-lg transition-all"
          title="View Details"
        >
          <Eye size={14} />
        </button>
      )
    }
  ]

  const renderDTD = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatCard 
          title="Activities Submitted" 
          value={stats.activitiesCount} 
          icon={Activity} 
          trend={{ value: 'Total submissions', isPositive: true }}
        />
        <StatCard 
          title="Evaluation Pending" 
          value={stats.pendingCount} 
          icon={Clock} 
          trend={{ value: 'Awaiting review', isPositive: stats.pendingCount === 0 }}
        />
        <StatCard 
          title="Approved Activities" 
          value={stats.approvedCount} 
          icon={CheckCircle} 
          trend={{ value: 'Approved submissions', isPositive: true }}
        />
        <StatCard 
          title="Rejected Activities" 
          value={stats.rejectedCount} 
          icon={AlertCircle} 
          trend={{ value: 'Revisions needed', isPositive: stats.rejectedCount === 0 }}
        />
        <StatCard 
          title="Leaderboard Rank" 
          value={stats.rank !== 'Unranked' ? `#${stats.rank}` : stats.rank} 
          icon={TrendingUp} 
          trend={{ value: `${stats.leaderboardPoints} pts`, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-main font-outfit">Latest Evaluation Feedback</h3>
            <Badge variant={extraData.latestEvaluation?.recommendation ? 'success' : 'warning'}>
              {extraData.latestEvaluation?.recommendation ? 'Recommended' : 'Under Review'}
            </Badge>
          </div>
          {extraData.latestEvaluation ? (
            <div className="space-y-4">
              <div className="bg-surface-muted rounded-xl p-4 border border-surface-border">
                <p className="text-xs text-text-muted font-semibold tracking-wider uppercase mb-2">Remarks</p>
                <p className="text-sm text-text-main italic leading-relaxed">
                  "{extraData.latestEvaluation.remarks}"
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-surface-border rounded-xl">
                  <p className="text-xs text-text-muted font-semibold tracking-wider uppercase mb-2">Strengths</p>
                  <p className="text-sm text-text-main font-medium">{extraData.latestEvaluation.strengths || 'N/A'}</p>
                </div>
                <div className="p-4 border border-surface-border rounded-xl">
                  <p className="text-xs text-text-muted font-semibold tracking-wider uppercase mb-2">Key Improvements</p>
                  <p className="text-sm text-text-main font-medium">{extraData.latestEvaluation.improvements || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-2 text-xs text-text-muted font-medium">
                Evaluator: <span className="font-semibold text-text-main">{extraData.latestEvaluation.evaluator?.name}</span> • {formatDateIST(extraData.latestEvaluation.created_at)}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-text-muted font-medium text-sm">
              No evaluations found yet. Keep conducting events and submitting activities!
            </div>
          )}
        </Card>

        <Card className="p-6 flex flex-col justify-between bg-surface-muted border-0 ring-1 ring-inset ring-brand/10">
          <div>
            <div className="w-10 h-10 bg-brand-light text-brand rounded-xl flex items-center justify-center mb-4">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-lg font-semibold font-outfit mb-2 text-text-main">Advance Your Journey</h3>
            <p className="text-sm text-text-muted leading-relaxed mb-6">
              Ready to report a new MC assignment, training session, or project participation? Submitting your activities helps the District Trainers evaluate your progress.
            </p>
          </div>
          <Button 
            onClick={() => navigate('/activities')} 
            fullWidth
            icon={<PlusCircle size={18} />}
          >
            Submit New Activity
          </Button>
        </Card>
      </div>
    </div>
  )

  const renderDT = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Candidates Evaluated" 
          value={stats.evaluatedCount} 
          icon={CheckCircle} 
          trend={{ value: 'Total given', isPositive: true }}
        />
        <StatCard 
          title="Leaderboard Rank" 
          value={stats.rank !== 'Unranked' ? `#${stats.rank}` : stats.rank} 
          icon={TrendingUp} 
          trend={{ value: 'Trainer rank', isPositive: true }}
        />
        <StatCard 
          title="Activities Submitted" 
          value={stats.activitiesCount} 
          icon={Activity} 
          trend={{ value: 'Personal logs', isPositive: true }}
        />
        <StatCard 
          title="Pending DTD Reviews" 
          value={stats.pendingCount} 
          icon={Clock} 
          trend={{ value: 'Requires review', isPositive: stats.pendingCount === 0 }}
        />
      </div>

      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-text-main font-outfit">Submitted Activities Requiring Review</h3>
            <p className="text-sm text-text-muted mt-1">Select a submission to evaluate the candidate's development.</p>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/evaluate')} 
          >
            Evaluator Center
          </Button>
        </div>
        
        <DataTable
          columns={dtDashboardColumns}
          data={extraData.pendingActivities || []}
          searchPlaceholder="Search pending submissions..."
          searchKey="user.name"
          emptyTitle="All Caught Up!"
          emptyDescription="There are no candidate activities currently awaiting review."
        />
      </Card>
    </div>
  )

  const renderAdmin = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active DTD Candidates" 
          value={stats.dtdCount} 
          icon={Users} 
          trend={{ value: 'Deputies', isPositive: true }}
        />
        <StatCard 
          title="District Trainers (DT)" 
          value={stats.dtCount} 
          icon={Award} 
          trend={{ value: 'Approved', isPositive: true }}
        />
        <StatCard 
          title="Pending Evaluations" 
          value={stats.pendingCount} 
          icon={Clock} 
          trend={{ value: 'Needs review', isPositive: stats.pendingCount === 0 }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-text-main font-outfit mb-6">Recent Activity Submissions</h3>
          <DataTable
            columns={adminDashboardColumns}
            data={extraData.recentSubmissions || []}
            searchPlaceholder="Search recent submissions..."
            searchKey="user.name"
            emptyTitle="No Recent Submissions"
            emptyDescription="No recent submissions found."
          />
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-text-main font-outfit mb-2">Quick Actions</h3>
          <p className="text-sm text-text-muted mb-6">Common administrative tasks</p>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/users')}
              className="w-full text-left p-4 bg-surface-muted border border-surface-border hover:border-brand/30 hover:bg-brand-light/20 rounded-xl text-sm font-semibold text-text-main transition-all flex items-center justify-between group"
            >
              <span>Manage Users Directory</span>
              <ArrowRight size={16} className="text-text-muted group-hover:text-brand transition-colors" />
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className="w-full text-left p-4 bg-surface-muted border border-surface-border hover:border-brand/30 hover:bg-brand-light/20 rounded-xl text-sm font-semibold text-text-main transition-all flex items-center justify-between group"
            >
              <span>View Analytics Reports</span>
              <ArrowRight size={16} className="text-text-muted group-hover:text-brand transition-colors" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  )

  const renderSuperAdmin = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Super Admins" 
          value={stats.superAdminCount} 
          icon={Users} 
          trend={{ value: 'Full control', isPositive: true }}
        />
        <StatCard 
          title="Admins" 
          value={stats.adminCount} 
          icon={Users} 
          trend={{ value: 'Coordinators', isPositive: true }}
        />
        <StatCard 
          title="District Trainers (DT)" 
          value={stats.dtCount} 
          icon={Award} 
          trend={{ value: 'Approved', isPositive: true }}
        />
        <StatCard 
          title="Deputies (DTD)" 
          value={stats.dtdCount} 
          icon={Activity} 
          trend={{ value: 'Candidates', isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-text-main font-outfit mb-6">Recent System Activities</h3>
          <DataTable
            columns={superAdminDashboardColumns}
            data={extraData.recentSubmissions || []}
            searchPlaceholder="Search system activities..."
            searchKey="user.name"
            emptyTitle="No Recent Submissions"
            emptyDescription="No recent submissions found."
          />
        </Card>

        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-text-main font-outfit">Promotion Pipeline</h3>
              {stats.promotionsPending > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-semantic-error text-[10px] font-bold text-white">
                  {stats.promotionsPending}
                </span>
              )}
            </div>
            
            {extraData.pendingPromotions?.length > 0 ? (
              <div className="space-y-3">
                {extraData.pendingPromotions.slice(0, promotionsLimit).map((promo) => (
                  <div key={promo.id} className="p-4 bg-surface-muted border border-surface-border rounded-xl flex flex-col gap-3">
                    <div>
                      <h4 className="font-semibold text-sm text-text-main">{promo.candidate?.name}</h4>
                      <p className="text-xs text-text-muted font-medium mt-1">
                        Current: {promo.candidate?.role} • {promo.candidate?.club}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => navigate('/promotions')}
                    >
                      Promote Candidate
                    </Button>
                  </div>
                ))}

                {/* Show More / Show Less Controls */}
                <div className="flex gap-2 pt-2">
                  {promotionsLimit < extraData.pendingPromotions.length && (
                    <Button
                      size="sm"
                      variant="outline"
                      fullWidth
                      onClick={() => setPromotionsLimit(prev => prev + 4)}
                    >
                      Show More
                    </Button>
                  )}
                  {promotionsLimit > 4 && (
                    <Button
                      size="sm"
                      variant="outline"
                      fullWidth
                      onClick={() => setPromotionsLimit(4)}
                    >
                      Show Less
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-text-muted font-medium text-sm leading-relaxed">
                No promotions pending at this time.
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-surface-border">
            <Button 
              variant="outline"
              fullWidth
              onClick={() => navigate('/users')}
              icon={<ArrowRight size={16} />}
            >
              User Management
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        subtitle={`Welcome back, ${user?.name || user?.email?.split('@')[0]}! (${userRole})`}
      />
      {userRole === 'DTD' && renderDTD()}
      {userRole === 'DT' && renderDT()}
      {userRole === 'Admin' && renderAdmin()}
      {userRole === 'SuperAdmin' && renderSuperAdmin()}

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        activity={selectedActivity}
      />
    </div>
  )
}
