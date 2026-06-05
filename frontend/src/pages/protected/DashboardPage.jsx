import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { 
  FileText, Award, Calendar, Users, Activity, 
  TrendingUp, CheckCircle, Clock, AlertCircle, PlusCircle, ArrowRight
} from 'lucide-react'
import { StatCard } from '../../components/ui/StatCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Badge } from '../../components/ui/Badge'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export default function DashboardPage() {
  const { user, userRole } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [extraData, setExtraData] = useState({})

  useEffect(() => {
    if (!user) return

    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        if (userRole === 'DTD') {
          // 1. Total activities submitted
          const { count: activitiesCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          // 2. Leaderboard Rank
          const { data: rankData } = await supabase
            .from('leaderboards')
            .select('rank, activity_count')
            .eq('user_id', user.id)
            .eq('role', 'DTD')
            .maybeSingle()

          // 3. Events Conducted count
          const { count: eventsCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('category', 'Event Conducted')

          // 4. Latest Evaluation received
          const { data: latestEval } = await supabase
            .from('evaluations')
            .select('*, evaluator:users(name)')
            .eq('candidate_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)

          setStats({
            activitiesCount: activitiesCount || 0,
            rank: rankData?.rank || 'Unranked',
            eventsCount: eventsCount || 0,
            leaderboardPoints: rankData?.activity_count || 0
          })
          setExtraData({
            latestEvaluation: latestEval?.[0] || null
          })

        } else if (userRole === 'DT') {
          // 1. Total DTDs evaluated
          const { count: evaluatedCount } = await supabase
            .from('evaluations')
            .select('*', { count: 'exact', head: true })
            .eq('evaluator_id', user.id)

          // 2. Own leaderboard rank
          const { data: rankData } = await supabase
            .from('leaderboards')
            .select('rank, activity_count')
            .eq('user_id', user.id)
            .eq('role', 'DT')
            .maybeSingle()

          // 3. Own activities submitted
          const { count: activitiesCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)

          // 4. Pending reviews (All activities submitted by DTDs)
          const { data: pendingActivities } = await supabase
            .from('activities')
            .select('*, user:users(name, club)')
            .eq('status', 'Submitted')
            .order('created_at', { ascending: true })

          setStats({
            evaluatedCount: evaluatedCount || 0,
            rank: rankData?.rank || 'Unranked',
            activitiesCount: activitiesCount || 0,
            pendingCount: pendingActivities?.length || 0
          })
          setExtraData({
            pendingActivities: pendingActivities || []
          })

        } else if (userRole === 'Admin') {
          // 1. DTD and DT counts
          const { data: usersData } = await supabase
            .from('users')
            .select('role')
            .eq('status', 'Active')

          const dtdCount = usersData?.filter(u => u.role === 'DTD').length || 0
          const dtCount = usersData?.filter(u => u.role === 'DT').length || 0

          // 2. Pending evaluations (submitted activities count)
          const { count: pendingCount } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'Submitted')

          // 3. Recent activity submissions
          const { data: recentSubmissions } = await supabase
            .from('activities')
            .select('*, user:users(name, role, club)')
            .order('created_at', { ascending: false })
            .limit(5)

          setStats({
            dtdCount,
            dtCount,
            pendingCount: pendingCount || 0
          })
          setExtraData({
            recentSubmissions: recentSubmissions || []
          })

        } else if (userRole === 'SuperAdmin') {
          // 1. Total users count
          const { data: allUsers } = await supabase
            .from('users')
            .select('role, status')

          const superAdminCount = allUsers?.filter(u => u.role === 'SuperAdmin').length || 0
          const adminCount = allUsers?.filter(u => u.role === 'Admin').length || 0
          const dtCount = allUsers?.filter(u => u.role === 'DT').length || 0
          const dtdCount = allUsers?.filter(u => u.role === 'DTD').length || 0

          // 2. System activity feed (latest submissions)
          const { data: recentSubmissions } = await supabase
            .from('activities')
            .select('*, user:users(name, role, club)')
            .order('created_at', { ascending: false })
            .limit(5)

          // 3. Pending promotions (passed interviews but still DTD/DT role) - REPLACED WITH JUST PENDING PROMOTIONS TABLE
          const { data: passedPromotions } = await supabase
            .from('promotions') // We should adjust this later, but for now we remove interviews
            .select('*')
            .limit(0)

          setStats({
            superAdminCount,
            adminCount,
            dtCount,
            dtdCount
          })
          setExtraData({
            recentSubmissions: recentSubmissions || [],
            pendingPromotions: []
          })
        }
      } catch (error) {
        console.error('Error loading dashboard statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, userRole])

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const renderDTD = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Activities Submitted" 
          value={stats.activitiesCount} 
          icon={Activity} 
          trend={{ value: 'Total logs', isPositive: true }}
        />
        <StatCard 
          title="Leaderboard Rank" 
          value={stats.rank !== 'Unranked' ? `#${stats.rank}` : stats.rank} 
          icon={TrendingUp} 
          trend={{ value: `${stats.leaderboardPoints} pts`, isPositive: true }}
        />
        <StatCard 
          title="Events Conducted" 
          value={stats.eventsCount} 
          icon={CheckCircle} 
          trend={{ value: 'Facilitated', isPositive: true }}
        />
        <StatCard 
          title="Pending Evaluations" 
          value={extraData.latestEvaluation ? 'Evaluated' : 'None yet'} 
          icon={FileText} 
          trend={{ value: 'Status', isPositive: !!extraData.latestEvaluation }}
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
                Evaluator: <span className="font-semibold text-text-main">{extraData.latestEvaluation.evaluator?.name}</span> • {new Date(extraData.latestEvaluation.created_at).toLocaleDateString()}
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
        
        {extraData.pendingActivities?.length > 0 ? (
          <div className="divide-y divide-surface-border">
            {extraData.pendingActivities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-muted/50 rounded-xl px-2 transition-all">
                <div>
                  <h4 className="font-semibold text-sm text-text-main">{act.title}</h4>
                  <p className="text-xs text-text-muted font-medium mt-1">
                    Candidate: {act.user?.name} • Category: {act.category}
                  </p>
                </div>
                <Button 
                  size="sm"
                  onClick={() => navigate('/evaluate', { state: { candidateId: act.user_id } })}
                >
                  Review Candidate
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-text-muted font-medium text-sm">
            All caught up! No candidate activities are currently pending review.
          </div>
        )}
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
          {extraData.recentSubmissions?.length > 0 ? (
            <div className="space-y-3">
              {extraData.recentSubmissions.map((act) => (
                <div key={act.id} className="p-4 border border-surface-border hover:bg-surface-muted rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm text-text-main">{act.title}</h4>
                    <p className="text-xs text-text-muted font-medium mt-1">
                      By: <span className="text-text-main">{act.user?.name}</span> ({act.user?.role}) • {act.user?.club}
                    </p>
                    <p className="text-xs text-text-muted mt-1 font-medium">Category: {act.category}</p>
                  </div>
                  <Badge variant={
                    act.status === 'Approved' ? 'success' : 
                    act.status === 'Rejected' ? 'error' : 
                    act.status === 'Submitted' ? 'warning' : 'default'
                  }>
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-text-muted font-medium text-sm">
              No recent submissions found.
            </div>
          )}
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
          {extraData.recentSubmissions?.length > 0 ? (
            <div className="space-y-3">
              {extraData.recentSubmissions.map((act) => (
                <div key={act.id} className="p-4 border border-surface-border hover:bg-surface-muted rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                  <div>
                    <h4 className="font-semibold text-sm text-text-main">{act.title}</h4>
                    <p className="text-xs text-text-muted font-medium mt-1">
                      By: <span className="text-text-main">{act.user?.name}</span> ({act.user?.role}) • {act.user?.club}
                    </p>
                    <p className="text-xs text-text-muted mt-1 font-medium">Category: {act.category}</p>
                  </div>
                  <Badge variant={
                    act.status === 'Approved' ? 'success' : 
                    act.status === 'Rejected' ? 'error' : 
                    act.status === 'Submitted' ? 'warning' : 'default'
                  }>
                    {act.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-text-muted font-medium text-sm">
              No recent submissions found.
            </div>
          )}
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
                {extraData.pendingPromotions.map((promo) => (
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
    </div>
  )
}
