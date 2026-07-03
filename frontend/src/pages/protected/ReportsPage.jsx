import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { api } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  FileText, TrendingUp, BarChart3, Award, Calendar, PieChart as PieChartIcon, Activity,
  ArrowUpRight, Download, Filter, Search, ChevronRight
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { Badge } from '../../components/ui/Badge'
import { StatCard } from '../../components/ui/StatCard'
import { formatDateIST, formatIST } from '../../utils/date'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Toast } from '../../components/ui/Toast'
import { Card } from '../../components/ui/Card'

export default function ReportsPage() {
  const { user, userRole, loading: authLoading } = useAuth()
  const [activeTab, setActiveTab] = useState('summary')
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Report Data State
  const [topDTDs, setTopDTDs] = useState([])
  const [topDTs, setTopDTs] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [promotions, setPromotions] = useState([])
  const [roleDistribution, setRoleDistribution] = useState([])
  const [categoryDistribution, setCategoryDistribution] = useState([])
  const [approvedReports, setApprovedReports] = useState([])

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
  }

  // Handle setting default tab when userRole is loaded
  useEffect(() => {
    if (userRole) {
      setActiveTab(userRole === 'DTD' ? 'approved-reports' : 'summary')
    }
  }, [userRole])

  const loadReportData = async () => {
    if (!user || !userRole) return
    setLoading(true)
    try {
      if (userRole !== 'DTD') {
        // 1. Load Monthly Summary Data
        const monthly = await api.getMonthlyReport()
        setMonthlyData(monthly || [])

        // 2. Load Top DTDs and DTs
        // Fallback dynamic counting if leaderboards cache is empty
        const fetchTopMembers = async (role) => {
          try {
            const data = await api.getTopMembers(role, 10)
            if (data && data.length > 0) {
              // Join with users table
              const userIds = data.map(item => item.user_id)
              const { data: users } = await supabase.from('users').select('id, name, club, pilot_id').in('id', userIds)
              const userMap = {}
              users?.forEach(u => { userMap[u.id] = u })
              return data
                .map(item => ({ ...item, user: userMap[item.user_id] }))
                .filter(item => !!item.user)
            }
            return []
          } catch (e) {
            console.warn('Leaderboard table error, falling back to dynamic:', e.message)
          }

          // Dynamic fallback
          try {
            const { data: users } = await supabase.from('users').select('id, name, club, pilot_id').eq('role', role).in('status', ['Active', 'Promoted'])
            const { data: acts } = await supabase.from('activities').select('user_id').eq('status', 'Approved').eq('event_status', 'Conducted')

            const counts = {}
            acts?.forEach(a => { counts[a.user_id] = (counts[a.user_id] || 0) + 1 })

            const res = users?.map(u => ({
              user_id: u.id,
              user: u,
              activity_count: counts[u.id] || 0
            })) || []

            res.sort((a, b) => b.activity_count - a.activity_count)
            return res.slice(0, 10).map((item, idx) => ({ ...item, rank: idx + 1 }))
          } catch (err) {
            console.error('Dynamic fallback error:', err)
            return []
          }
        }

        const dtds = await fetchTopMembers('DTD')
        const dts = await fetchTopMembers('DT')
        setTopDTDs(dtds || [])
        setTopDTs(dts || [])

        // 3. Load Promotion History Log
        const { data: promoData } = await supabase
          .from('promotions')
          .select('*')
          .order('promoted_at', { ascending: false })

        const { data: allUsers } = await supabase.from('users').select('id, name, pilot_id')
        const userMap = {}
        allUsers?.forEach(u => { userMap[u.id] = u })

        const mappedPromos = promoData?.map(p => ({
          ...p,
          candidate: userMap[p.user_id] || { name: 'Unknown User', pilot_id: 'N/A' },
          promoter: userMap[p.promoted_by] || { name: 'System / Admin' }
        })) || []

        setPromotions(mappedPromos)

        // 4. Load Role and Category Distributions
        const { data: usersData } = await supabase.from('users').select('role')
        const roleCounts = {
          'Super Admin': 0,
          'Admin': 0,
          'DT': 0,
          'DTD': 0
        }
        const roleMap = {
          'SuperAdmin': 'Super Admin',
          'Admin': 'Admin',
          'DT': 'DT',
          'DTD': 'DTD'
        }
        usersData?.forEach(user => {
          const displayName = roleMap[user.role] || user.role
          if (displayName in roleCounts) {
            roleCounts[displayName] += 1
          }
        })
        setRoleDistribution(Object.entries(roleCounts).map(([name, value]) => ({ name, value })))

        const { data: actsData } = await supabase.from('activities').select('avenue, category')
        const catCounts = actsData?.reduce((acc, act) => {
          const cat = act.avenue || act.category || 'Other'
          acc[cat] = (acc[cat] || 0) + 1
          return acc
        }, {}) || {}
        setCategoryDistribution(Object.entries(catCounts).map(([name, value]) => ({ name, value })))
      }

      // 5. Load Approved Activities for Report List
      let actsData = []

      if (userRole === 'DT') {
        // Fetch own approved reports
        const { data: ownData, error: ownError } = await supabase
          .from('activities')
          .select('*, user:users!inner(id, name, pilot_id, role, club)')
          .eq('status', 'Approved')
          .eq('user_id', user.id)

        if (ownError) throw ownError

        // Fetch DTD candidates' approved reports
        const { data: dtdData, error: dtdError } = await supabase
          .from('activities')
          .select('*, user:users!inner(id, name, pilot_id, role, club)')
          .eq('status', 'Approved')
          .eq('user.role', 'DTD')

        if (dtdError) throw dtdError

        // Combine and sort by updated_at descending
        actsData = [...(ownData || []), ...(dtdData || [])]
        actsData.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
      } else {
        let query = supabase
          .from('activities')
          .select('*, user:users!inner(id, name, pilot_id, role, club)')
          .eq('status', 'Approved')
          .order('updated_at', { ascending: false })

        if (userRole === 'DTD') {
          query = query.eq('user_id', user.id)
        } else if (userRole === 'Admin') {
          query = query.in('user.role', ['DTD', 'DT'])
        }
        // SuperAdmin has access to all approved reports

        const { data, error } = await query
        if (error) throw error
        actsData = data || []
      }

      setApprovedReports(actsData)

    } catch (err) {
      console.error(err)
      showToast('Error loading report analytics', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !user) return

    loadReportData()

    // Subscribe to realtime database changes for synchronization
    const usersChannel = supabase
      .channel('reports-users')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          loadReportData()
        }
      )
      .subscribe()

    const activitiesChannel = supabase
      .channel('reports-activities')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities' },
        () => {
          loadReportData()
        }
      )
      .subscribe()

    const promotionsChannel = supabase
      .channel('reports-promotions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        () => {
          loadReportData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(usersChannel)
      supabase.removeChannel(activitiesChannel)
      supabase.removeChannel(promotionsChannel)
    }
  }, [authLoading, user])

  // Find maximum activity count for monthly chart normalization
  const maxCount = Math.max(...monthlyData.map(d => d.count), 1)

  const approvedReportsColumns = [
    {
      header: 'Trainer Name',
      accessor: 'user.name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.user?.name || '-'}</span>
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
      header: 'Avenue',
      accessor: 'avenue',
      sortable: true,
      render: (row) => <span className="text-xs text-text-light font-medium">{row.avenue || row.category || '-'}</span>
    },
    {
      header: 'Hours Conducted',
      accessor: 'hours_conducted',
      sortable: true,
      render: (row) => <span className="text-xs text-text-main font-semibold">{row.hours_conducted ? `${row.hours_conducted} Hours` : '-'}</span>
    },
    {
      header: 'Date Approved',
      accessor: 'updated_at',
      sortable: true,
      render: (row) => <span className="text-xs text-text-muted font-medium">{formatIST(row.updated_at)}</span>
    },
    {
      header: 'Official Report',
      accessor: 'report_url',
      render: (row) => (
        row.report_url ? (
          <a
            href={row.report_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition-all"
          >
            <FileText size={13} />
            Download PDF
          </a>
        ) : (
          <span className="text-xs text-text-muted italic">Processing...</span>
        )
      )
    }
  ]

  const topMembersColumns = [
    {
      header: 'Rank',
      accessor: 'rank',
      render: (row) => <span className="font-extrabold text-xs text-text-muted">#{row.rank}</span>
    },
    {
      header: 'Trainer Name',
      accessor: 'user.name',
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.user?.name}</span>
          <span className="text-[10px] text-text-muted font-bold block">{row.user?.pilot_id}</span>
        </div>
      )
    },
    {
      header: 'Club Affiliation',
      accessor: 'user.club',
      render: (row) => <span className="text-xs text-text-light font-medium">{row.user?.club || '-'}</span>
    },
    {
      header: 'Logs Submitted',
      accessor: 'activity_count',
      render: (row) => (
        <span className="text-sm font-extrabold text-brand">
          {row.activity_count} <span className="text-[10px] text-text-muted font-bold">PTS</span>
        </span>
      )
    }
  ]

  const promotionColumns = [
    {
      header: 'User Upgraded',
      accessor: 'candidate.name',
      render: (row) => (
        <div>
          <span className="font-semibold text-text-main text-sm block">{row.candidate?.name}</span>
          <span className="text-[10px] text-text-muted font-bold uppercase block">{row.candidate?.pilot_id}</span>
        </div>
      )
    },
    {
      header: 'Transition',
      accessor: 'roles',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs">
          <Badge variant={row.old_role}>{row.old_role}</Badge>
          <span className="text-text-muted font-bold">→</span>
          <Badge variant={row.new_role}>{row.new_role}</Badge>
        </div>
      )
    },
    {
      header: 'Authorized By',
      accessor: 'promoter.name',
      render: (row) => <span className="text-xs font-semibold text-text-light">{row.promoter?.name}</span>
    },
    {
      header: 'Approval Date',
      accessor: 'promoted_at',
      render: (row) => <span className="text-xs text-text-muted font-medium">{formatIST(row.promoted_at)}</span>
    }
  ]

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Reports Center"
        subtitle="Analyze overall activity volumes, track leading training candidates, and audit promotion logs."
      />

      {/* Tabs Menu */}
      <div className="flex border-b border-surface-border gap-6 overflow-x-auto no-scrollbar whitespace-nowrap pb-1">
        {userRole !== 'DTD' && (
          <>
            <button
              onClick={() => setActiveTab('summary')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'summary'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text-main'
                }`}
            >
              <BarChart3 size={18} />
              Monthly Volume
            </button>
            <button
              onClick={() => setActiveTab('distributions')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'distributions'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text-main'
                }`}
            >
              <PieChartIcon size={18} />
              Distributions
            </button>
            <button
              onClick={() => setActiveTab('top-members')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'top-members'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text-main'
                }`}
            >
              <TrendingUp size={18} />
              Top Trainers
            </button>
            <button
              onClick={() => setActiveTab('promotions')}
              className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'promotions'
                  ? 'border-brand text-brand'
                  : 'border-transparent text-text-muted hover:text-text-main'
                }`}
            >
              <Award size={18} />
              Promotion Audits
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('approved-reports')}
          className={`pb-4 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'approved-reports'
              ? 'border-brand text-brand'
              : 'border-transparent text-text-muted hover:text-text-main'
            }`}
        >
          <FileText size={18} />
          Approved Reports
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="space-y-6">
          <Card className="p-7">
            <h3 className="text-base font-semibold text-text-main font-outfit mb-8">Activity Logs Volume Trends (Monthly)</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 50 : 30} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Activities Logged"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'distributions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-7">
            <h3 className="text-base font-semibold text-text-main font-outfit mb-4">User Roles Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={isMobile ? { top: 10, right: 10, left: 10, bottom: 10 } : { top: 20, right: 60, left: 60, bottom: 20 }}>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 50}
                    outerRadius={isMobile ? 60 : 80}
                    paddingAngle={5}
                    dataKey="value"
                    label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-7">
            <h3 className="text-base font-semibold text-text-main font-outfit mb-4">Activity Category Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={isMobile ? { top: 10, right: 10, left: 10, bottom: 10 } : { top: 20, right: 60, left: 60, bottom: 20 }}>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={isMobile ? 35 : 50}
                    outerRadius={isMobile ? 60 : 80}
                    paddingAngle={5}
                    dataKey="value"
                    label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'top-members' && (
        <div className="space-y-6">
          <Card className="p-7">
            <h3 className="text-base font-semibold text-text-main font-outfit mb-8">Top Trainers Comparison</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...(topDTs || []).map(t => ({ name: t.user?.name || 'Unknown', score: t.activity_count, role: 'DT' })), ...(topDTDs || []).map(t => ({ name: t.user?.name || 'Unknown', score: t.activity_count, role: 'DTD' }))]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 60 : 30} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {
                      [...(topDTs || []), ...(topDTDs || [])].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.role === 'DT' ? '#2563eb' : '#60a5fa'} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top DTDs */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-text-main font-outfit flex items-center gap-2">
                <Award size={18} className="text-semantic-warning" />
                Top 10 Deputy Trainers (DTD)
              </h3>
              <DataTable
                columns={topMembersColumns}
                data={topDTDs}
                pageSize={5}
                searchPlaceholder="Filter DTDs..."
                searchKey="user.name"
              />
            </div>

            {/* Top DTs */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-text-main font-outfit flex items-center gap-2">
                <Award size={18} className="text-brand" />
                Top 10 District Trainers (DT)
              </h3>
              <DataTable
                columns={topMembersColumns}
                data={topDTs}
                pageSize={5}
                searchPlaceholder="Filter DTs..."
                searchKey="user.name"
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-main font-outfit">District Promotion Audit Logs</h3>
          <DataTable
            columns={promotionColumns}
            data={promotions}
            searchPlaceholder="Search log by candidate name..."
            searchKey="candidate.name"
          />
        </div>
      )}

      {activeTab === 'approved-reports' && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-text-main font-outfit">Approved Activity Reports</h3>
          <DataTable
            columns={approvedReportsColumns}
            data={approvedReports}
            searchPlaceholder="Search reports by activity title..."
            searchKey="title"
            pageSize={10}
            emptyTitle="No Approved Reports"
            emptyDescription="There are no approved activity reports currently linked to your workspace."
          />
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
