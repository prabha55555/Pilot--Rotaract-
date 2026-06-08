import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowRight, Users, TrendingUp, Award, BookOpen, 
  Zap, Target, CheckCircle, Shield, Compass, Calendar, 
  MapPin, ChevronRight, Activity, BarChart2, Star,
  Plane, Cloud, ShieldAlert, Sparkles, PlusCircle, ArrowUpRight
} from 'lucide-react'
import logo from '../../utils/logo.png'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'

// Scroll-Triggered Counter Component
const Counter = ({ value, duration = 2000, suffix = "" }) => {
  const [count, setCount] = useState(0)
  const elementRef = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStarted(true)
      }
    }, { threshold: 0.3 })

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current)
    }
  }, [])

  useEffect(() => {
    if (!started) return

    let startTimestamp = null
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      setCount(Math.floor(progress * value))
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    window.requestAnimationFrame(step)
  }, [started, value, duration])

  return <span ref={elementRef} className="font-outfit font-extrabold">{count}{suffix}</span>
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('evaluation')

  // Scroll Reveal hook
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
        }
      })
    }, { threshold: 0.1 })

    const elements = document.querySelectorAll('.reveal')
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafc] text-text-main font-sans selection:bg-brand-light selection:text-brand overflow-x-hidden relative">
      
      {/* Premium Sticky Glassmorphic Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 py-4 px-6 bg-white/70 backdrop-blur-md border-b border-surface-border/50 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <img src={logo} alt="PILOT" className="h-8 w-auto transition-transform duration-300 group-hover:scale-105" />
            <div className="w-1.5 h-6 bg-brand/30 rounded-full hidden md:block"></div>
            <span className="text-xs font-semibold text-brand tracking-widest uppercase font-mono hidden md:block">
              District 3220 Control
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="secondary" className="px-5 py-2 text-xs font-semibold rounded-full border border-surface-border hover:border-brand/40 shadow-soft bg-white/80 transition-all duration-300 hover:scale-105 active:scale-95">
                {isAuthenticated ? 'Enter Workspace' : 'Sign In'}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Sky Arena Section */}
      <section className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col justify-center overflow-hidden bg-gradient-to-br from-[#E0F2FE] via-[#FFFFFF] to-[#EEF2F6] animate-gradient-shimmer">
        
        {/* Sky / Grid Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-35 pointer-events-none"></div>
        <div className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] bg-brand-light rounded-full blur-[140px] opacity-70 pointer-events-none"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-[#E0E7FF] rounded-full blur-[140px] opacity-50 pointer-events-none"></div>

        {/* Dynamic Flight Trails (Animate-trail paths) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <path
            d="M-100,600 C300,550 600,450 900,300 C1000,250 1150,180 1280,165"
            fill="none"
            stroke="url(#trail-grad-1)"
            strokeWidth="5"
            strokeLinecap="round"
            className="animate-trail opacity-40"
          />
          <path
            d="M-50,620 C350,570 650,470 950,315 C1050,265 1200,195 1290,180"
            fill="none"
            stroke="url(#trail-grad-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="12 18"
            className="animate-trail opacity-30"
            style={{ animationDelay: '-2s' }}
          />
          <defs>
            <linearGradient id="trail-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0" />
              <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#003DA5" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="trail-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0" />
              <stop offset="60%" stopColor="#818CF8" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Parallax Drifting SVG Clouds */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* Cloud 1 */}
          <div className="absolute top-[12%] w-[120px] h-[60px] opacity-40 animate-cloud-slow" style={{ animationDelay: '-10s' }}>
            <svg viewBox="0 0 100 50" fill="#FFFFFF">
              <path d="M10,40 C10,30 25,25 35,30 C40,20 60,15 75,25 C85,20 95,30 90,40 C95,45 80,50 50,50 C20,50 5,45 10,40 Z" />
            </svg>
          </div>
          {/* Cloud 2 */}
          <div className="absolute top-[35%] w-[180px] h-[90px] opacity-25 animate-cloud-med" style={{ animationDelay: '-25s' }}>
            <svg viewBox="0 0 100 50" fill="#FFFFFF">
              <path d="M10,40 C10,30 25,25 35,30 C40,20 60,15 75,25 C85,20 95,30 90,40 C95,45 80,50 50,50 C20,50 5,45 10,40 Z" />
            </svg>
          </div>
          {/* Cloud 3 */}
          <div className="absolute top-[65%] w-[150px] h-[75px] opacity-35 animate-cloud-fast" style={{ animationDelay: '-5s' }}>
            <svg viewBox="0 0 100 50" fill="#FFFFFF">
              <path d="M10,40 C10,30 25,25 35,30 C40,20 60,15 75,25 C85,20 95,30 90,40 C95,45 80,50 50,50 C20,50 5,45 10,40 Z" />
            </svg>
          </div>
          {/* Cloud 4 */}
          <div className="absolute top-[22%] w-[220px] h-[110px] opacity-30 animate-cloud-slow" style={{ animationDelay: '-40s' }}>
            <svg viewBox="0 0 100 50" fill="#FFFFFF">
              <path d="M10,40 C10,30 25,25 35,30 C40,20 60,15 75,25 C85,20 95,30 90,40 C95,45 80,50 50,50 C20,50 5,45 10,40 Z" />
            </svg>
          </div>
          {/* Cloud 5 */}
          <div className="absolute top-[50%] w-[110px] h-[55px] opacity-20 animate-cloud-med" style={{ animationDelay: '-12s' }}>
            <svg viewBox="0 0 100 50" fill="#FFFFFF">
              <path d="M10,40 C10,30 25,25 35,30 C40,20 60,15 75,25 C85,20 95,30 90,40 C95,45 80,50 50,50 C20,50 5,45 10,40 Z" />
            </svg>
          </div>
        </div>

        {/* The Realistic Bobbing SVG Airplane */}
        <div className="absolute right-[5%] md:right-[10%] top-[40%] md:top-[30%] w-[260px] sm:w-[360px] md:w-[500px] h-[160px] sm:h-[220px] md:h-[300px] pointer-events-none animate-jet-glide z-20">
          <svg viewBox="0 0 600 300" className="w-full h-full drop-shadow-floating">
            <defs>
              <linearGradient id="fuselageGrad" x1="0%" y1="30%" x2="100%" y2="70%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#F8FAFC" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
              <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#003DA5" />
              </linearGradient>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="50%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Far Wing */}
            <path d="M 330,130 L 410,50 C 418,42 428,42 432,48 L 435,55 L 370,120 Z" fill="#94A3B8" />
            <path d="M 410,50 L 418,35 L 414,35 L 406,48 Z" fill="#003DA5" />

            {/* Engine Far */}
            <rect x="335" y="122" width="45" height="15" rx="7" fill="url(#metalGrad)" />
            <ellipse cx="335" cy="129.5" rx="4" ry="7.5" fill="#1E293B" />

            {/* Fuselage (Body) */}
            <path d="M 160,190 C 220,195 320,175 420,145 C 520,115 580,90 605,80 C 612,77 615,73 607,73 C 557,75 467,90 367,110 C 267,130 187,155 150,170 C 142,173 145,188 160,190 Z" fill="url(#fuselageGrad)" />

            {/* Sleek Blue Stripe on Fuselage */}
            <path d="M 200,173 C 280,165 370,143 470,113 C 530,95 575,81 592,75 C 590,77 580,81 560,88 C 470,115 370,138 280,158 C 210,173 201,173 200,173 Z" fill="url(#brandGrad)" opacity="0.95" />

            {/* Cockpit Window */}
            <path d="M 565,83 C 560,84 555,87 558,91 L 565,90 Z" fill="url(#windowGrad)" />

            {/* Passenger Windows */}
            <circle cx="260" cy="148" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="280" cy="144" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="300" cy="140" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="320" cy="136" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="340" cy="132" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="360" cy="128" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="380" cy="124" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="400" cy="120" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="420" cy="116" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="440" cy="112" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="460" cy="108" r="2.5" fill="#334155" opacity="0.6" />
            <circle cx="480" cy="104" r="2.5" fill="#334155" opacity="0.6" />

            {/* Tail Fin */}
            <path d="M 185,170 L 145,75 C 142,68 152,65 158,70 L 220,158 Z" fill="url(#brandGrad)" />
            <path d="M 160,78 L 155,70 L 163,68 L 175,85 Z" fill="#38BDF8" />

            {/* Horizontal Stabilizer */}
            <path d="M 170,175 L 125,188 C 120,190 118,185 124,182 L 180,168 Z" fill="#64748B" />

            {/* Near Wing */}
            <path d="M 330,138 L 440,240 C 448,248 458,248 462,242 L 470,230 L 395,125 Z" fill="url(#fuselageGrad)" />
            <path d="M 440,240 L 452,258 L 448,258 L 432,238 Z" fill="#003DA5" />

            {/* Engine Near */}
            <rect x="340" y="145" width="50" height="18" rx="9" fill="url(#metalGrad)" />
            <ellipse cx="340" cy="154" rx="5" ry="9" fill="#1E293B" />
            {/* Near Engine Thrust Glow */}
            <polygon points="390,147 415,152 415,156 390,161" fill="#F97316" opacity="0.75" filter="url(#glow)" />
            <polygon points="390,150 405,153 405,155 390,158" fill="#FDE047" opacity="0.9" />
          </svg>
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-30 max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left max-w-3xl">
            
            {/* Glowing Brand Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-white/80 border border-white/90 shadow-soft backdrop-blur-sm transition-all duration-300 hover:border-brand/30 hover:shadow-floating">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand font-mono">
                PILOT Framework v2.0
              </span>
            </div>

            {/* Main Premium Typography Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-outfit text-text-main leading-[1.15] tracking-tight">
              Navigate Trainer Development.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-[#1D4ED8] to-[#3B82F6] font-extrabold relative">
                Elevate Leadership.
                <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-brand-light/70 -z-10 rounded-full"></span>
              </span>
            </h1>

            {/* Copy Subtext */}
            <p className="text-lg md:text-xl text-text-muted leading-relaxed font-sans max-w-2xl">
              An enterprise-grade orchestration platform for Rotaract District 3220. Seamlessly evaluate credentials, track training activity hours, and promote talent with a centralized, data-driven framework.
            </p>

            {/* Interactive Call To Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link to="/login">
                <Button size="lg" className="rounded-full shadow-floating group px-8 bg-brand text-white hover:bg-[#003080] hover:shadow-[0_12px_30px_rgba(0,61,165,0.25)] hover:scale-105 active:scale-95 transition-all duration-300">
                  Access Control Room
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </Button>
              </Link>
              
              <a href="#dashboard-preview" className="inline-flex items-center justify-center font-semibold text-text-main hover:text-brand px-6 py-3 rounded-full hover:bg-white/50 border border-transparent hover:border-surface-border/40 transition-all duration-300 active:scale-95">
                Explore Dashboard
              </a>
            </div>

            {/* Highlighted Trust Markers */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-surface-border/50 max-w-xl">
              <div>
                <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Evaluation Mode</p>
                <p className="text-lg font-bold text-text-main mt-1">Structured RLS</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Role Access</p>
                <p className="text-lg font-bold text-text-main mt-1">Multi-Tier Portal</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">Audit Security</p>
                <p className="text-lg font-bold text-text-main mt-1">Supabase DB</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive Mockup Dashboard Section */}
      <section id="dashboard-preview" className="py-32 px-6 bg-[#f8fafc] border-y border-surface-border/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-20 reveal">
            <Badge variant="brand" className="mb-4 rounded-full px-4 py-1 uppercase tracking-wider text-xs font-semibold shadow-soft">
              Command Deck Preview
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-text-main tracking-tight leading-tight">
              An enterprise dashboard designed for growth tracking
            </h2>
            <p className="text-text-muted text-lg mt-4 leading-relaxed">
              Explore the real-time interface designed for coordinators and admin leads to supervise, review, and evaluate upcoming trainers.
            </p>
          </div>

          {/* Interactive Glassmorphism Dashboard Mockup Container */}
          <div className="relative max-w-[1100px] mx-auto reveal">
            
            {/* Floating Glassmorphic Badges */}
            <div className="absolute -top-8 -left-12 hidden lg:flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-stripe animate-float-slow z-30">
              <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">District Average Score</p>
                <p className="text-sm font-bold text-text-main">87.4% (Takeoff Speed)</p>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-12 hidden lg:flex items-center gap-3 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-stripe animate-float-medium z-30">
              <div className="w-10 h-10 rounded-xl bg-semantic-successLight flex items-center justify-center text-semantic-success">
                <CheckCircle size={20} />
              </div>
              <div>
                <p className="text-xs text-text-muted font-medium">Logged Flight Hours</p>
                <p className="text-sm font-bold text-text-main">342.5 hrs logged</p>
              </div>
            </div>

            {/* Main Dashboard Frame */}
            <div className="bg-white/70 backdrop-blur-md border border-white shadow-floating rounded-2xl overflow-hidden grid grid-cols-12 min-h-[580px]">
              
              {/* Mock Sidebar */}
              <div className="col-span-3 bg-zinc-950/95 border-r border-zinc-800 text-zinc-400 p-5 flex flex-col justify-between hidden md:flex">
                <div className="space-y-8">
                  <div className="flex items-center gap-2 text-white">
                    <Plane className="text-blue-500 animate-pulse-glow" size={20} />
                    <span className="font-outfit font-bold text-sm tracking-wider uppercase">PILOT Portal</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 px-3 py-2 bg-zinc-800/80 text-white rounded-xl text-xs font-semibold cursor-pointer">
                      <BarChart2 size={16} />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <Users size={16} />
                      Candidates
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <Activity size={16} />
                      Evaluations
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-900 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                      <Award size={16} />
                      Promotions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-zinc-800/80 pt-4">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold font-mono">
                    CO
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-none">Coordinator Lead</p>
                    <p className="text-[10px] text-zinc-500 mt-1">District 3220</p>
                  </div>
                </div>
              </div>

              {/* Mock Main Panel */}
              <div className="col-span-12 md:col-span-9 p-6 sm:p-8 flex flex-col justify-between bg-white/40">
                
                {/* Mock Top bar */}
                <div className="flex justify-between items-center pb-6 border-b border-surface-border/50">
                  <div>
                    <h3 className="text-lg font-bold text-text-main font-outfit">Control Center Overview</h3>
                    <p className="text-xs text-text-muted mt-1">Supervising active training runs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-semantic-success"></span>
                    <span className="text-xs font-bold text-text-main font-mono">Live Control</span>
                  </div>
                </div>

                {/* Dashboard Tabs for Interactive Previews */}
                <div className="grid grid-cols-3 gap-2 py-4">
                  {['evaluation', 'activities', 'leaderboard'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all duration-200 uppercase tracking-wider ${
                        activeTab === tab 
                        ? 'bg-brand text-white border-brand shadow-soft' 
                        : 'bg-white text-text-muted border-surface-border hover:bg-surface-muted'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Mock Active Tab Area */}
                <div className="flex-grow flex flex-col justify-center min-h-[300px]">
                  
                  {activeTab === 'evaluation' && (
                    <div className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Radar/Skill Representation */}
                        <div className="border border-surface-border bg-white/80 p-5 rounded-2xl flex flex-col justify-between">
                          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Competency Radar</p>
                          
                          {/* Radial Mock SVG */}
                          <div className="flex items-center justify-center py-4">
                            <svg className="w-28 h-28" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                              <circle cx="50" cy="50" r="30" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                              <circle cx="50" cy="50" r="15" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                              <polygon points="50,15 80,40 70,75 35,70 20,40" fill="url(#brandGrad)" fillOpacity="0.15" stroke="#003DA5" strokeWidth="1.5" />
                              <circle cx="50" cy="15" r="2" fill="#003DA5" />
                              <circle cx="80" cy="40" r="2" fill="#003DA5" />
                              <circle cx="70" cy="75" r="2" fill="#003DA5" />
                              <circle cx="35" cy="70" r="2" fill="#003DA5" />
                              <circle cx="20" cy="40" r="2" fill="#003DA5" />
                            </svg>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
                            <span>Delivery</span>
                            <span>Content</span>
                            <span>Adaptability</span>
                          </div>
                        </div>

                        {/* Candidate Progress State */}
                        <div className="border border-surface-border bg-white/80 p-5 rounded-2xl flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Candidate Focus</p>
                              <p className="text-sm font-bold text-text-main mt-1">Rtr. Amanda Perera</p>
                            </div>
                            <Badge variant="success">Validated</Badge>
                          </div>

                          <div className="space-y-3 pt-4">
                            <div>
                              <div className="flex justify-between text-[10px] text-text-muted mb-1 font-semibold">
                                <span>Training Delivery Evaluation</span>
                                <span>92/100</span>
                              </div>
                              <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                                <div className="h-full bg-brand rounded-full" style={{ width: '92%' }}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-[10px] text-text-muted mb-1 font-semibold">
                                <span>Communication Proficiency</span>
                                <span>88/100</span>
                              </div>
                              <div className="w-full h-1.5 bg-surface-muted rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '88%' }}></div>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-text-muted mt-2 italic">Ready for District Promotion interview approval.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'activities' && (
                    <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Recent Activity Logs</p>
                      
                      {[
                        { title: 'Project Agni Train-The-Trainer Session', hours: '4.5 hrs', candidate: 'Rtr. Sharon Fernando', tag: 'Co-Pilot' },
                        { title: 'District Assembly Presentation Run', hours: '3.0 hrs', candidate: 'Rtr. Ashan Silva', tag: 'Pre-Flight' },
                        { title: 'Leadership Workshop Mock Class', hours: '2.5 hrs', candidate: 'Rtr. Amanda Perera', tag: 'Co-Pilot' }
                      ].map((act, index) => (
                        <div key={index} className="flex justify-between items-center p-3.5 bg-white/80 border border-surface-border/60 rounded-xl hover:border-brand/30 transition-all duration-200">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-brand-light text-brand flex items-center justify-center">
                              <Activity size={14} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-text-main leading-tight">{act.title}</p>
                              <p className="text-[10px] text-text-muted mt-0.5">{act.candidate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-semibold text-text-muted font-mono">{act.hours}</span>
                            <Badge className="hidden sm:inline-flex">{act.tag}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'leaderboard' && (
                    <div className="space-y-3 animate-[fadeIn_0.3s_ease-out]">
                      <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Top Performing Candidates</p>
                      
                      <div className="border border-surface-border bg-white/80 rounded-xl overflow-hidden divide-y divide-surface-border/50">
                        {[
                          { rank: '1', name: 'Rtr. Sharon Fernando', points: '1240 XP', badges: '🥇 Commander', color: 'bg-amber-100 text-amber-600' },
                          { rank: '2', name: 'Rtr. Amanda Perera', points: '1180 XP', badges: '🥈 Co-Pilot Lead', color: 'bg-slate-100 text-slate-600' },
                          { rank: '3', name: 'Rtr. Ashan Silva', points: '1020 XP', badges: '🥉 Flying Ace', color: 'bg-orange-100 text-orange-600' }
                        ].map((lead, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 text-xs hover:bg-surface-muted/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${lead.color}`}>{lead.rank}</span>
                              <p className="font-semibold text-text-main">{lead.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-text-muted font-mono font-medium">{lead.points}</span>
                              <span className="text-[11px] font-semibold text-brand">{lead.badges}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Dashboard bottom indicator */}
                <div className="flex justify-between items-center text-[11px] text-text-muted border-t border-surface-border/50 pt-5 mt-4">
                  <span>Press Shift + C for Command line access</span>
                  <span>Vite Project • Supabase Auth Integrated</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Leadership Flight Path (Milestone Timeline) */}
      <section className="py-32 px-6 bg-white relative overflow-hidden">
        <div className="absolute top-[30%] left-[-10%] w-[400px] h-[400px] bg-brand-light rounded-full blur-[120px] opacity-40 pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-24 reveal">
            <Badge variant="warning" className="mb-4 rounded-full px-4 py-1 uppercase tracking-wider text-xs font-semibold shadow-soft">
              Career Flight Path
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-text-main tracking-tight leading-tight">
              A structured lifecycle for trainer elevation
            </h2>
            <p className="text-text-muted text-lg mt-4 leading-relaxed">
              From early selection to ultimate pilot training accreditation, follow the flight track designed to assure professional caliber.
            </p>
          </div>

          {/* Timeline Milestones Grid */}
          <div className="relative max-w-[1200px] mx-auto py-12">
            
            {/* Runaway/Flight-Track inspired dashed connector line */}
            <div className="absolute top-1/2 left-0 w-full h-1 border-t-2 border-dashed border-surface-border -translate-y-1/2 hidden lg:block z-0">
              {/* Sliding Micro Plane along the flight track */}
              <div className="absolute top-[-10px] left-[45%] text-brand animate-pulse">
                <Plane size={20} className="rotate-90 transform" />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 relative z-10">
              
              {/* Milestone 1 */}
              <div className="bg-white/60 backdrop-blur-md border border-white hover:border-brand/40 shadow-soft p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-2 group reveal">
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-surface-border text-brand rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  1
                </div>
                
                <h4 className="text-xl font-bold font-outfit text-text-main mb-3 mt-4 flex items-center justify-between">
                  Takeoff (Candidate)
                  <Compass className="text-brand opacity-60" size={20} />
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  Identify emerging candidate leaders within district clubs. Candidates build their portfolio profiles, log their introductory training hours, and map initial skillsets.
                </p>

                <div className="mt-6 pt-5 border-t border-surface-border/50 flex gap-2 flex-wrap">
                  <Badge variant="default">Club Endorsement</Badge>
                  <Badge variant="default">Profile Onboarding</Badge>
                </div>
              </div>

              {/* Milestone 2 */}
              <div className="bg-white/60 backdrop-blur-md border border-white hover:border-brand/40 shadow-soft p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-2 group reveal" style={{ transitionDelay: '0.2s' }}>
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-surface-border text-blue-500 rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                  2
                </div>

                <h4 className="text-xl font-bold font-outfit text-text-main mb-3 mt-4 flex items-center justify-between">
                  Cruising (Evaluation)
                  <Activity className="text-blue-500 opacity-60" size={20} />
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  District coordinators step in to evaluate live mock classes, grading candidates on visual layouts, slide clarity, presentation tone, content command, and flexibility.
                </p>

                <div className="mt-6 pt-5 border-t border-surface-border/50 flex gap-2 flex-wrap">
                  <Badge variant="default">5-Category Rubric</Badge>
                  <Badge variant="default">Activity Hours logged</Badge>
                </div>
              </div>

              {/* Milestone 3 */}
              <div className="bg-white/60 backdrop-blur-md border border-white hover:border-brand/40 shadow-soft p-8 rounded-3xl relative transition-all duration-300 hover:-translate-y-2 group reveal" style={{ transitionDelay: '0.4s' }}>
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-surface-border text-emerald-500 rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  3
                </div>

                <h4 className="text-xl font-bold font-outfit text-text-main mb-3 mt-4 flex items-center justify-between">
                  Promoted (Captain)
                  <Award className="text-emerald-500 opacity-60" size={20} />
                </h4>
                <p className="text-sm text-text-muted leading-relaxed">
                  Data-backed candidate promotion. Deserving candidates are officially recommended for advanced status, undergoing final review boards to become accredited District Trainers.
                </p>

                <div className="mt-6 pt-5 border-t border-surface-border/50 flex gap-2 flex-wrap">
                  <Badge variant="success">Accredited status</Badge>
                  <Badge variant="default">District Trainer</Badge>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* Features & Capabilities Grid */}
      <section className="py-32 px-6 bg-[#f8fafc] border-t border-surface-border/40 relative">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20 reveal">
            <Badge variant="success" className="mb-4 rounded-full px-4 py-1 uppercase tracking-wider text-xs font-semibold shadow-soft">
              Platform Features
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-text-main tracking-tight leading-tight">
              Designed for trainer governance and excellence
            </h2>
            <p className="text-text-muted text-lg mt-4 leading-relaxed">
              Every detail is calibrated to eliminate bias, ensure transparency, and automate records workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <Card className="bg-white hover:border-brand/30 hover:shadow-floating transition-all duration-300 hover:-translate-y-1 p-8 rounded-3xl border-surface-border/60 reveal">
              <div className="w-12 h-12 bg-brand-light text-brand rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Users size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Role-based Access</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Separated panels for candidates, evaluators, and system administrators. Keep evaluations secure and data private with Row Level Security.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="bg-white hover:border-brand/30 hover:shadow-floating transition-all duration-300 hover:-translate-y-1 p-8 rounded-3xl border-surface-border/60 reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-semantic-successLight text-semantic-success rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Detailed Analytics</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Visual progress timelines, leaderboards, and hour tracking statistics. Get insights into candidate progress across domains.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="bg-white hover:border-brand/30 hover:shadow-floating transition-all duration-300 hover:-translate-y-1 p-8 rounded-3xl border-surface-border/60 reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-semantic-warningLight text-semantic-warning rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Award size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Promotion Matrices</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Clear milestones and evaluation checkpoints. Standardize how trainers are selected, tested, and recommended.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="bg-white hover:border-brand/30 hover:shadow-floating transition-all duration-300 hover:-translate-y-1 p-8 rounded-3xl border-surface-border/60 reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <BookOpen size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Document Libraries</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                A centralized, secure library to store slides, presentation slides, mock evaluations, and verification proofs.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="bg-white hover:border-brand/30 hover:shadow-floating transition-all duration-300 hover:-translate-y-1 p-8 rounded-3xl border-surface-border/60 reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Zap size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Instant Feedback</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Coordinators leave grading ratings directly on individual activities. Instant dashboard updates ensure rapid improvement loops.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="bg-white hover:border-brand/30 hover:shadow-floating transition-all duration-300 hover:-translate-y-1 p-8 rounded-3xl border-surface-border/60 reveal" style={{ transitionDelay: '0.5s' }}>
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Shield size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Supabase RLS Security</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                All data resides safely inside custom PostgreSQL structures protected by hardened Supabase RLS (Row Level Security) schemas.
              </p>
            </Card>

          </div>

        </div>
      </section>

      {/* Dynamic Statistics Board (Intersection Count-Up) */}
      <section className="py-24 px-6 bg-white relative">
        <div className="max-w-[1200px] mx-auto bg-gradient-to-r from-brand to-brand-light p-12 md:p-16 rounded-[2.5rem] shadow-soft text-white relative overflow-hidden reveal">
          
          {/* Subtle backgrounds inside stat frame */}
          <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="relative z-10 grid md:grid-cols-3 gap-12 text-center items-center">
            
            <div className="space-y-2">
              <p className="text-3xl sm:text-5xl font-extrabold font-outfit tracking-tight leading-none">
                <Counter value={150} suffix="+" />
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80 font-mono">
                Activities Registered
              </p>
              <p className="text-xs text-white/60">Verified runs completed</p>
            </div>

            <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/20 py-8 md:py-0">
              <p className="text-3xl sm:text-5xl font-extrabold font-outfit tracking-tight leading-none">
                <Counter value={98} suffix="%" />
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80 font-mono">
                Evaluation Accuracy
              </p>
              <p className="text-xs text-white/60">Data-driven performance rubric</p>
            </div>

            <div className="space-y-2">
              <p className="text-3xl sm:text-5xl font-extrabold font-outfit tracking-tight leading-none">
                <Counter value={50} suffix="+" />
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest text-white/80 font-mono">
                Certified Trainers
              </p>
              <p className="text-xs text-white/60">Accredited leadership roles</p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer / CTA Section */}
      <footer className="py-24 px-6 text-center border-t border-surface-border/40 bg-[#f8fafc] relative">
        <div className="max-w-[800px] mx-auto space-y-8 reveal">
          
          <div className="inline-flex w-14 h-14 rounded-2xl bg-brand-light text-brand items-center justify-center shadow-soft animate-bounce">
            <Plane size={28} />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-text-main tracking-tight leading-tight">
            Ready to control the flight deck?
          </h2>
          <p className="text-text-muted text-lg leading-relaxed max-w-xl mx-auto">
            Log in to manage candidate runs, complete grading reports, or monitor evaluations dynamically.
          </p>

          <div>
            <Link to="/login">
              <Button size="lg" className="rounded-full shadow-floating px-10 bg-brand text-white hover:bg-[#003080] hover:shadow-[0_12px_30px_rgba(0,61,165,0.25)] hover:scale-105 active:scale-95 transition-all duration-300">
                {isAuthenticated ? 'Go to Dashboard' : 'Access Control Room'}
              </Button>
            </Link>
          </div>

          <div className="pt-12 text-xs text-text-light border-t border-surface-border/50 max-w-md mx-auto flex flex-col sm:flex-row justify-between gap-4 font-semibold">
            <span>© 2026 PILOT District 3220</span>
            <span className="flex items-center gap-1.5 justify-center">
              <Sparkles size={12} className="text-brand" /> Developed for Excellence
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
