import React, { useEffect, useState, useRef, useMemo } from 'react'
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
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef(null)
  const timelineRef = useRef(null)

  // Ambient Sky Particles Generator
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map(() => ({
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.5 + 0.2,
      delay: Math.random() * -20,
      duration: Math.random() * 15 + 15,
    }))
  }, [])

  // 3D Parallax Mouse Handlers
  const handleMouseMove = (e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const normalizedX = (x / rect.width) - 0.5
    const normalizedY = (y / rect.height) - 0.5
    const rotateY = normalizedX * 16
    const rotateX = -normalizedY * 16
    heroRef.current.style.setProperty('--mouse-rotate-x', `${rotateX}deg`)
    heroRef.current.style.setProperty('--mouse-rotate-y', `${rotateY}deg`)
    heroRef.current.style.setProperty('--mouse-translate-x', `${normalizedX * -25}px`)
    heroRef.current.style.setProperty('--mouse-translate-y', `${normalizedY * -25}px`)
  }

  const handleMouseLeave = () => {
    if (!heroRef.current) return
    heroRef.current.style.setProperty('--mouse-rotate-x', '0deg')
    heroRef.current.style.setProperty('--mouse-rotate-y', '0deg')
    heroRef.current.style.setProperty('--mouse-translate-x', '0px')
    heroRef.current.style.setProperty('--mouse-translate-y', '0px')
  }

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return
      const rect = timelineRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      let progress = 0
      if (rect.top < windowHeight) {
        progress = Math.min(Math.max((windowHeight - rect.top) / rect.height, 0), 1)
      }
      setScrollProgress(progress)
    }

    const handleGlobalScroll = () => {
      const scrolled = window.scrollY
      if (heroRef.current) {
        heroRef.current.style.setProperty('--scroll-y', `${scrolled}px`)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleGlobalScroll, { passive: true })
    handleScroll()
    handleGlobalScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleGlobalScroll)
    }
  }, [])

  // Math for scroll-linked flight journey plane
  const pathX = scrollProgress * 92 + 4
  const pathY = Math.sin(scrollProgress * Math.PI * 2) * 25
  const pathRotate = Math.cos(scrollProgress * Math.PI * 2) * 20

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
      
      {/* Decorative Vertical Connecting Flight Path */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1440 4500" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="vertical-path-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="30%" stopColor="#003DA5" />
            <stop offset="70%" stopColor="#818CF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          d="M 1100,300 C 800,500 150,600 100,1000 C 50,1400 150,1700 100,2000 C 50,2300 1350,2400 1300,2800 C 1250,3200 1350,3600 1200,3900 C 1000,4200 300,4300 720,4450"
          fill="none"
          stroke="url(#vertical-path-grad)"
          strokeWidth="3"
          strokeDasharray="8 8"
          opacity="0.25"
        />
        <circle r="5" fill="#38BDF8" filter="url(#path-glow)">
          <animateMotion
            path="M 1100,300 C 800,500 150,600 100,1000 C 50,1400 150,1700 100,2000 C 50,2300 1350,2400 1300,2800 C 1250,3200 1350,3600 1200,3900 C 1000,4200 300,4300 720,4450"
            dur="24s"
            repeatCount="indefinite"
          />
        </circle>
        <circle r="10" fill="#38BDF8" opacity="0.25" filter="url(#path-glow)">
          <animateMotion
            path="M 1100,300 C 800,500 150,600 100,1000 C 50,1400 150,1700 100,2000 C 50,2300 1350,2400 1300,2800 C 1250,3200 1350,3600 1200,3900 C 1000,4200 300,4300 720,4450"
            dur="24s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Premium Sticky Glassmorphic Navbar (Sticky Glassmorphic Navbar) */}
      <nav className="fixed top-0 left-0 w-full z-50 py-4 px-6 bg-white/70 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300 text-slate-800">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            <img src={logo} alt="PILOT" className="h-11 w-auto transition-transform duration-300 group-hover:scale-105" />
            <div className="w-1.5 h-6 bg-brand/40 rounded-full hidden md:block"></div>
            <span className="text-xs font-semibold text-brand tracking-widest uppercase font-mono hidden md:block">
              District 3220 Control
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="secondary" className="px-5 py-2 text-xs font-semibold rounded-full border border-slate-200 hover:border-brand/40 shadow-soft bg-white text-slate-700 hover:bg-slate-50 transition-all duration-300 hover:scale-105 active:scale-95">
                {isAuthenticated ? 'Enter Workspace' : 'Sign In'}
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero / Sky Arena Section (Midnight Aerospace Aurora theme) */}
      <section 
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-screen pt-32 pb-24 px-6 flex flex-col justify-center overflow-hidden text-slate-800"
      >
        
        {/* Blending Daytime Sky Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Sunrise Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff9a9e] via-[#fecfef] to-[#feebd0] animate-daylight-sunrise"></div>
          {/* Morning Day Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2980B9] via-[#6DD5FA] to-[#FFFFFF] animate-daylight-morning"></div>
          {/* Golden Hour Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F85F73] via-[#ffc3a0] to-[#FBE555] animate-daylight-golden"></div>
          {/* Sunset Layer */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4568DC] via-[#B06AB3] to-[#feb47b] animate-daylight-sunset"></div>
        </div>

        {/* Volumetric Sunbeams & Sunlight Orb */}
        <div className="absolute left-[15%] -top-[100px] w-[500px] h-[900px] bg-gradient-to-b from-white/30 via-white/10 to-transparent animate-spotlight blur-xl pointer-events-none z-10 origin-top"></div>
        <div className="absolute left-[35%] -top-[100px] w-[600px] h-[1000px] bg-gradient-to-b from-amber-200/20 via-amber-100/5 to-transparent animate-spotlight blur-3xl pointer-events-none z-10 origin-top" style={{ animationDelay: '-6s' }}></div>

        {/* Cinematic Daytime Sun */}
        <div className="absolute top-[8%] left-[28%] w-[220px] h-[220px] rounded-full bg-gradient-to-br from-white via-amber-100 to-yellow-50 opacity-80 blur-xl pointer-events-none z-0 animate-sun-rotate"></div>
        <div className="absolute top-[10%] left-[30%] w-10 h-10 rounded-full bg-white blur-sm pointer-events-none z-0"></div>

        {/* Sky / HUD Grid Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
        <div className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] bg-sky-300/20 rounded-full blur-[140px] opacity-70 pointer-events-none z-0"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[140px] opacity-50 pointer-events-none z-0"></div>

        {/* Aerospace HUD Pitch Ladder Left */}
        <div className="absolute left-[5%] top-[25%] h-[40%] w-[60px] border-r border-slate-400/20 flex flex-col justify-between py-6 font-mono text-[9px] text-slate-500/40 z-15 pointer-events-none hidden md:flex">
          <div className="flex items-center gap-1.5 justify-end"><span>+10</span><div className="w-4 h-[1px] bg-slate-400/30"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>+05</span><div className="w-2 h-[1px] bg-slate-400/20"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>00</span><div className="w-6 h-[1px] bg-slate-400/40"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>-05</span><div className="w-2 h-[1px] bg-slate-400/20"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>-10</span><div className="w-4 h-[1px] bg-slate-400/30"></div></div>
        </div>

        {/* Aerospace HUD Pitch Ladder Right */}
        <div className="absolute right-[5%] top-[25%] h-[40%] w-[60px] border-l border-slate-400/20 flex flex-col justify-between py-6 font-mono text-[9px] text-slate-500/40 z-15 pointer-events-none hidden md:flex">
          <div className="flex items-center gap-1.5 justify-start"><div className="w-4 h-[1px] bg-slate-400/30"></div><span>+10</span></div>
          <div className="flex items-center gap-1.5 justify-start"><div className="w-2 h-[1px] bg-slate-400/20"></div><span>+05</span></div>
          <div className="flex items-center gap-1.5 justify-start"><div className="w-6 h-[1px] bg-slate-400/40"></div><span>00</span></div>
          <div className="flex items-center gap-1.5 justify-start"><div className="w-2 h-[1px] bg-slate-400/20"></div><span>-05</span></div>
          <div className="flex items-center gap-1.5 justify-start"><div className="w-4 h-[1px] bg-slate-400/30"></div><span>-10</span></div>
        </div>

        {/* Heading Compass Bar */}
        <div className="absolute top-[100px] left-1/2 -translate-x-1/2 w-[280px] h-[30px] border-b border-slate-400/20 overflow-hidden flex flex-col justify-end font-mono text-[10px] text-slate-500/40 z-15 pointer-events-none hidden sm:flex">
          <div className="flex justify-between items-end px-4">
            <span>W</span><span>28</span><span>29</span><span className="text-slate-700 font-bold">30</span><span>31</span><span>32</span><span>N</span>
          </div>
          <div className="flex justify-between px-[18px]">
            <div className="w-[1px] h-1 bg-slate-400/30"></div>
            <div className="w-[1px] h-1.5 bg-slate-400/40"></div>
            <div className="w-[1px] h-1 bg-slate-400/30"></div>
            <div className="w-[1px] h-2 bg-slate-600 font-bold"></div>
            <div className="w-[1px] h-1 bg-slate-400/30"></div>
            <div className="w-[1px] h-1.5 bg-slate-400/40"></div>
            <div className="w-[1px] h-1 bg-slate-400/30"></div>
          </div>
        </div>

        {/* Animated Rotating Radar (Daytime Flight Compass style) */}
        <div className="absolute right-[12%] top-[15%] w-[220px] h-[220px] rounded-full border border-slate-300/30 bg-white/10 pointer-events-none z-[1] hidden lg:block overflow-hidden opacity-40">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[180px] h-[180px] rounded-full border border-dashed border-slate-400/20"></div>
            <div className="w-[120px] h-[120px] rounded-full border border-slate-400/20"></div>
            <div className="w-[60px] h-[60px] rounded-full border border-dashed border-slate-400/20"></div>
            <div className="absolute w-full h-[1px] bg-slate-400/20"></div>
            <div className="absolute h-full w-[1px] bg-slate-400/20"></div>
          </div>
          <div className="absolute inset-0 animate-radar-sweep">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-brand/20 origin-right transform rotate-180"></div>
          </div>
          <div className="absolute top-[35%] left-[25%] w-2.5 h-2.5 rounded-full bg-brand animate-pulse-glow z-10"></div>
          <div className="absolute top-[35%] left-[25%] w-6 h-6 rounded-full border border-brand/30 animate-radar-ping z-0"></div>
          <span className="absolute top-[28%] left-[29%] font-mono text-[8px] text-slate-600">TRK-032</span>

          <div className="absolute top-[60%] left-[70%] w-2 h-2 rounded-full bg-brand animate-pulse-glow z-10" style={{ animationDelay: '1.5s' }}></div>
          <div className="absolute top-[60%] left-[70%] w-5 h-5 rounded-full border border-brand/30 animate-radar-ping z-0" style={{ animationDelay: '1.5s' }}></div>
          <span className="absolute top-[54%] left-[74%] font-mono text-[8px] text-slate-600">TRK-220</span>

          <div className="absolute top-[18%] left-[62%] w-2 h-2 rounded-full bg-brand animate-pulse-glow z-10" style={{ animationDelay: '3s' }}></div>
          <span className="absolute top-[12%] left-[66%] font-mono text-[8px] text-slate-600">TRK-3220</span>

          <div className="absolute bottom-2 left-2 font-mono text-[8px] text-slate-500 flex flex-col">
            <span>HDG: 320°</span>
            <span>SYS: SCANNING</span>
          </div>
        </div>

        {/* 3D Runway HUD Visual */}
        <div className="absolute bottom-0 left-0 w-full h-[140px] pointer-events-none overflow-hidden z-10 flex justify-center items-end opacity-20">
          <svg className="w-[800px] h-full" viewBox="0 0 800 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="runway-grad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#38BDF8" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="100,100 380,10 420,10 700,100" fill="none" stroke="url(#runway-grad)" strokeWidth="2" opacity="0.6" />
            <line x1="395" y1="10" x2="150" y2="100" stroke="#38BDF8" strokeWidth="2" strokeDasharray="10 15" className="animate-runway" />
            <line x1="405" y1="10" x2="650" y2="100" stroke="#38BDF8" strokeWidth="2" strokeDasharray="10 15" className="animate-runway" />
            <line x1="400" y1="10" x2="400" y2="100" stroke="#38BDF8" strokeWidth="3" strokeDasharray="20 20" className="animate-runway" />
            <text x="382" y="90" fill="#38BDF8" fontSize="16" fontFamily="monospace" fontWeight="bold" opacity="0.8">32</text>
            <text x="408" y="90" fill="#38BDF8" fontSize="16" fontFamily="monospace" fontWeight="bold" opacity="0.8">20</text>
          </svg>
        </div>        {/* Dynamic Flight Trails (Animate-trail paths) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1440 800" preserveAspectRatio="none">
          <path
            d="M-100,600 C300,550 600,450 900,300 C1000,250 1150,180 1280,165"
            fill="none"
            stroke="url(#trail-grad-1)"
            strokeWidth="5"
            strokeLinecap="round"
            className="animate-trail opacity-45"
          />
          <path
            d="M-50,620 C350,570 650,470 950,315 C1050,265 1200,195 1290,180"
            fill="none"
            stroke="url(#trail-grad-2)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="12 18"
            className="animate-trail opacity-35"
            style={{ animationDelay: '-2s' }}
          />
          <defs>
            <linearGradient id="trail-grad-1" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFF" stopOpacity="0" />
              <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFF" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="trail-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0" />
              <stop offset="60%" stopColor="#FDE047" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#FFF" stopOpacity="0.75" />
            </linearGradient>
          </defs>
        </svg>

        {/* Ambient Sky Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-gradient-to-t from-amber-300 to-white rounded-full animate-sky-particle"
              style={{
                left: `${p.left}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`,
              }}
            />
          ))}
        </div>

        {/* Background Cloud Layer (Slow Parallax) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[5] overflow-hidden parallax-layer"
          style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.12))' }}
        >
          {/* Cloud 1 - Slow */}
          <div className="absolute top-[8%] w-[160px] h-[80px] opacity-35 animate-cloud-slow" style={{ animationDelay: '-8s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="cloud-slow-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#CBD5E1" opacity="0.3" transform="translate(4, 4)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-slow-grad)" />
              <path d="M40,55 C45,50 55,48 60,50 C70,35 90,32 105,42 C115,38 125,38 135,42 C145,45 150,50 152,55" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
          {/* Cloud 2 - Slow */}
          <div className="absolute top-[28%] w-[200px] h-[100px] opacity-30 animate-cloud-slow" style={{ animationDelay: '-35s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#CBD5E1" opacity="0.25" transform="translate(4, 4)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-slow-grad)" />
              <path d="M40,55 C45,50 55,48 60,50 C70,35 90,32 105,42 C115,38 125,38 135,42 C145,45 150,50 152,55" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
        </div>

        {/* Midground Cloud Layer (Medium Parallax) */}
        <div 
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden parallax-layer"
          style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.32))' }}
        >
          {/* Cloud 3 - Med */}
          <div className="absolute top-[42%] w-[240px] h-[120px] opacity-45 animate-cloud-med" style={{ animationDelay: '-18s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="cloud-med-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#E2E8F0" />
                </linearGradient>
              </defs>
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#CBD5E1" opacity="0.3" transform="translate(4, 4)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-med-grad)" />
              <path d="M40,55 C45,50 55,48 60,50 C70,35 90,32 105,42 C115,38 125,38 135,42 C145,45 150,50 152,55" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
          {/* Cloud 4 - Med */}
          <div className="absolute top-[68%] w-[260px] h-[130px] opacity-40 animate-cloud-med" style={{ animationDelay: '-42s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#CBD5E1" opacity="0.25" transform="translate(4, 4)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-med-grad)" />
              <path d="M40,55 C45,50 55,48 60,50 C70,35 90,32 105,42 C115,38 125,38 135,42 C145,45 150,50 152,55" fill="none" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
        </div>

        {/* Foreground Cloud Layer (Fast Parallax, passing in front of everything) */}
        <div 
          className="absolute inset-0 pointer-events-none z-[35] overflow-hidden parallax-layer"
          style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.52))' }}
        >
          {/* Cloud 5 - Fast */}
          <div className="absolute top-[52%] w-[360px] h-[180px] opacity-45 animate-cloud-fast" style={{ animationDelay: '-5s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient id="cloud-fast-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#CBD5E1" />
                </linearGradient>
              </defs>
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#94A3B8" opacity="0.3" transform="translate(5, 5)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-fast-grad)" />
              <path d="M40,55 C45,50 55,48 60,50 C70,35 90,32 105,42 C115,38 125,38 135,42 C145,45 150,50 152,55" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
          {/* Cloud 6 - Fast */}
          <div className="absolute top-[80%] w-[400px] h-[200px] opacity-40 animate-cloud-fast" style={{ animationDelay: '-22s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-lg">
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#94A3B8" opacity="0.25" transform="translate(5, 5)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-fast-grad)" />
              <path d="M40,55 C45,50 55,48 60,50 C70,35 90,32 105,42 C115,38 125,38 135,42 C145,45 150,50 152,55" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.95" />
            </svg>
          </div>
        </div>

        {/* The Realistic Bobbing SVG Airplane with 3D Mouse Parallax */}
        <div className="absolute right-[5%] md:right-[10%] top-[40%] md:top-[30%] w-[260px] sm:w-[360px] md:w-[500px] h-[160px] sm:h-[220px] md:h-[300px] pointer-events-none animate-jet-glide z-20">
          <div 
            className="w-full h-full parallax-layer preserve-3d"
            style={{
              transform: 'perspective(1200px) rotateX(var(--mouse-rotate-x, 0deg)) rotateY(var(--mouse-rotate-y, 0deg))'
            }}
          >
            <svg viewBox="0 0 600 300" className="w-full h-full filter drop-shadow-[0_15px_35px_rgba(253,186,116,0.35)]" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="30%" stopColor="#FFFDF5" />
                  <stop offset="70%" stopColor="#F8FAFC" />
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
                <linearGradient id="contrailGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF" stopOpacity="0.95" />
                  <stop offset="30%" stopColor="#FEF3C7" stopOpacity="0.7" />
                  <stop offset="70%" stopColor="#FFF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#FFF" stopOpacity="0" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Glowing Contrails */}
              <path
                d="M 335,129.5 C 180,135 40,145 -350,150"
                fill="none"
                stroke="url(#contrailGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                opacity="0.85"
              />
              <path
                d="M 340,154 C 185,160 45,170 -350,175"
                fill="none"
                stroke="url(#contrailGrad)"
                strokeWidth="7"
                strokeLinecap="round"
                opacity="0.85"
              />

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
              <polygon points="390,147 415,152 415,156 390,161" fill="#FBBF24" opacity="0.8" filter="url(#glow)" />
              <polygon points="390,150 405,153 405,155 390,158" fill="#FFF" opacity="0.95" />
            </svg>
          </div>
        </div>

        {/* Floating Interactive Key Cards (Aerospace HUD Theme) */}
        <div className="absolute inset-0 pointer-events-none z-30 hidden lg:block">
          
          {/* Card 1: Trainer Development */}
          <div 
            className="absolute right-[45%] top-[20%] pointer-events-auto"
            style={{ transform: 'translate3d(var(--mouse-translate-x, 0px), var(--mouse-translate-y, 0px), 0)' }}
          >
            <div className="w-[200px] p-4 glass-premium hover-glow rounded-2xl animate-float-slow">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="text-brand h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Altitude HUD</span>
              </div>
              <h4 className="text-xs font-bold text-text-main">Trainer Development</h4>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20 font-mono text-[9px] text-brand">
                <span>ALT: 32,000 FT</span>
                <span>RATE: +1,200</span>
              </div>
            </div>
          </div>

          {/* Card 2: Leadership Growth */}
          <div 
            className="absolute right-[43%] top-[60%] pointer-events-auto"
            style={{ transform: 'translate3d(var(--mouse-translate-x, 0px), var(--mouse-translate-y, 0px), 0)' }}
          >
            <div className="w-[190px] p-4 glass-premium hover-glow rounded-2xl animate-float-medium" style={{ animationDelay: '-1.5s' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-blue-500 h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Climb Vector</span>
              </div>
              <h4 className="text-xs font-bold text-text-main">Leadership Growth</h4>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20 font-mono text-[9px] text-blue-500">
                <span>IAS: 420 KTS</span>
                <span>HDG: 092°</span>
              </div>
            </div>
          </div>

          {/* Card 3: Performance Tracking */}
          <div 
            className="absolute right-[6%] top-[24%] pointer-events-auto"
            style={{ transform: 'translate3d(var(--mouse-translate-x, 0px), var(--mouse-translate-y, 0px), 0)' }}
          >
            <div className="w-[180px] p-4 glass-premium hover-glow rounded-2xl animate-float-slow" style={{ animationDelay: '-3s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Activity className="text-emerald-500 h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">EGT Monitor</span>
              </div>
              <h4 className="text-xs font-bold text-text-main">Performance Tracking</h4>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20 font-mono text-[9px] text-emerald-500">
                <span>EGT: 720°C</span>
                <span>FUEL: 82%</span>
              </div>
            </div>
          </div>

          {/* Card 4: Activity Analytics */}
          <div 
            className="absolute right-[4%] top-[62%] pointer-events-auto"
            style={{ transform: 'translate3d(var(--mouse-translate-x, 0px), var(--mouse-translate-y, 0px), 0)' }}
          >
            <div className="w-[200px] p-4 glass-premium hover-glow rounded-2xl animate-float-medium" style={{ animationDelay: '-4.5s' }}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart2 className="text-brand h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Course Drift</span>
              </div>
              <h4 className="text-xs font-bold text-text-main">Activity Analytics</h4>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20 font-mono text-[9px] text-brand">
                <span>WIND: 24KTS</span>
                <span>XWIND: 12KTS</span>
              </div>
            </div>
          </div>

          {/* Card 5: Promotion Pipeline */}
          <div 
            className="absolute right-[28%] top-[76%] pointer-events-auto"
            style={{ transform: 'translate3d(var(--mouse-translate-x, 0px), var(--mouse-translate-y, 0px), 0)' }}
          >
            <div className="w-[190px] p-4 glass-premium hover-glow rounded-2xl animate-float-slow" style={{ animationDelay: '-6s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Award className="text-purple-500 h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Mach Target</span>
              </div>
              <h4 className="text-xs font-bold text-text-main">Promotion Pipeline</h4>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20 font-mono text-[9px] text-purple-500">
                <span>MACH: 0.82</span>
                <span>G-FORCE: 1.2G</span>
              </div>
            </div>
          </div>

          {/* Card 6: Evaluation Management */}
          <div 
            className="absolute right-[24%] top-[12%] pointer-events-auto"
            style={{ transform: 'translate3d(var(--mouse-translate-x, 0px), var(--mouse-translate-y, 0px), 0)' }}
          >
            <div className="w-[210px] p-4 glass-premium hover-glow rounded-2xl animate-float-medium" style={{ animationDelay: '-7.5s' }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="text-cyan-500 h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Flight Guard</span>
              </div>
              <h4 className="text-xs font-bold text-text-main">Evaluation Management</h4>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/20 font-mono text-[9px] text-cyan-500">
                <span>AP: ENGAGED</span>
                <span>RLS: HARDENED</span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Hero Content Grid */}
        <div className="relative z-30 max-w-[1400px] mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-left max-w-3xl">
            
            {/* Glowing Brand Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full bg-brand/10 border border-brand/20 shadow-soft backdrop-blur-sm transition-all duration-300 hover:border-brand/40 hover:shadow-floating">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-brand font-mono">
                PILOT Framework v2.0
              </span>
            </div>

            {/* Main Premium Typography Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-outfit text-slate-900 leading-[1.15] tracking-tight">
              Navigate Trainer Development.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-600 to-[#3B82F6] font-extrabold relative">
                Elevate Leadership.
                <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-brand-light/35 -z-10 rounded-full"></span>
              </span>
            </h1>

            {/* Copy Subtext */}
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-sans max-w-2xl">
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
              
              <a href="#dashboard-preview" className="inline-flex items-center justify-center font-semibold text-brand hover:text-[#003080] px-6 py-3 rounded-full hover:bg-brand/5 border border-transparent hover:border-brand/10 transition-all duration-300 active:scale-95">
                Explore Dashboard
              </a>
            </div>

            {/* Highlighted Trust Markers */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-slate-300/40 max-w-xl">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Evaluation Mode</p>
                <p className="text-lg font-bold text-slate-900 mt-1">Structured RLS</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Role Access</p>
                <p className="text-lg font-bold text-slate-900 mt-1">Multi-Tier Portal</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Audit Security</p>
                <p className="text-lg font-bold text-slate-900 mt-1">Supabase DB</p>
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
            <div className="glass-premium shadow-floating hover-glow rounded-2xl overflow-hidden grid grid-cols-12 min-h-[580px]">
              
              {/* Mock Sidebar */}
              <div className="col-span-3 bg-slate-50/90 border-r border-slate-200/60 text-slate-600 p-5 flex flex-col justify-between hidden md:flex">
                <div className="space-y-8">
                  <div className="flex items-center gap-2 text-slate-800">
                    <Plane className="text-brand animate-pulse-glow" size={20} />
                    <span className="font-outfit font-bold text-sm tracking-wider uppercase">PILOT Portal</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-3 px-3 py-2 bg-brand/10 text-brand rounded-xl text-xs font-semibold cursor-pointer">
                      <BarChart2 size={16} />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-slate-600">
                      <Users size={16} />
                      Candidates
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-slate-600">
                      <Activity size={16} />
                      Evaluations
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 rounded-xl text-xs font-semibold cursor-pointer transition-colors text-slate-600">
                      <Award size={16} />
                      Promotions
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-200/60 pt-4">
                  <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-xs font-bold font-mono">
                    CO
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-none">Coordinator Lead</p>
                    <p className="text-[10px] text-slate-400 mt-1">District 3220</p>
                  </div>
                </div>
              </div>

              {/* Mock Main Panel */}
              <div className="col-span-12 md:col-span-9 p-6 sm:p-8 flex flex-col justify-between bg-white/40 backdrop-blur-md">
                
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
                        <div className="glass-premium border-white/40 p-5 rounded-2xl flex flex-col justify-between hover-glow-soft">
                          <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Competency Radar</p>
                          
                          {/* Radial Mock SVG */}
                          <div className="flex items-center justify-center py-4">
                            <svg className="w-28 h-28" viewBox="0 0 100 100">
                              <defs>
                                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#F59E0B" />
                                  <stop offset="100%" stopColor="#D97706" />
                                </linearGradient>
                              </defs>
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                              <circle cx="50" cy="50" r="30" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                              <circle cx="50" cy="50" r="15" fill="none" stroke="#E4E4E7" strokeWidth="1" />
                              <polygon points="50,15 80,40 70,75 35,70 20,40" fill="url(#goldGrad)" fillOpacity="0.18" stroke="#F59E0B" strokeWidth="1.5" />
                              <circle cx="50" cy="15" r="2" fill="#F59E0B" />
                              <circle cx="80" cy="40" r="2" fill="#F59E0B" />
                              <circle cx="70" cy="75" r="2" fill="#F59E0B" />
                              <circle cx="35" cy="70" r="2" fill="#F59E0B" />
                              <circle cx="20" cy="40" r="2" fill="#F59E0B" />
                            </svg>
                          </div>
                          
                          <div className="flex justify-between items-center text-[10px] font-bold text-text-muted">
                            <span>Delivery</span>
                            <span>Content</span>
                            <span>Adaptability</span>
                          </div>
                        </div>
 
                        {/* Candidate Progress State */}
                        <div className="glass-premium border-white/40 p-5 rounded-2xl flex flex-col justify-between hover-glow-soft">
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
                        <div key={index} className="flex justify-between items-center p-3.5 glass-premium rounded-xl hover-glow-soft">
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
                      
                      <div className="glass-premium rounded-xl overflow-hidden divide-y divide-slate-200/50">
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

      {/* Leadership Flight Path (Milestone Timeline - Scroll-Bound Flight Journey) */}
      <section className="py-32 px-6 bg-gradient-to-b from-[#FFFFFF] via-[#E0F2FE] to-[#FDF4E3] text-slate-800 border-y border-slate-200 relative overflow-hidden">
        <div className="absolute top-[20%] left-[-10%] w-[350px] h-[350px] bg-sky-300/20 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-amber-200/20 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-24 reveal">
            <Badge variant="warning" className="mb-4 rounded-full px-4 py-1 uppercase tracking-wider text-xs font-semibold shadow-soft bg-amber-100 text-amber-800 border border-amber-200">
              Career Flight Path
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-slate-900 tracking-tight leading-tight">
              A structured flight journey for trainer elevation
            </h2>
            <p className="text-slate-600 text-lg mt-4 leading-relaxed">
              From early selection to ultimate pilot training accreditation, follow the flight track designed to assure professional caliber.
            </p>
          </div>

          {/* Timeline Milestones Grid */}
          <div ref={timelineRef} className="relative max-w-[1200px] mx-auto py-16">
            
            {/* Runway/Flight-Track inspired curved dotted connector line */}
            <div className="absolute top-1/2 left-0 w-full h-[150px] -translate-y-1/2 hidden lg:block z-0 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 1200 150" fill="none" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="active-path-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>
                </defs>
                {/* Background Dotted Line */}
                <path 
                  d="M 30,75 C 300,10 300,140 600,75 C 900,10 900,140 1170,75" 
                  stroke="rgba(15,23,42,0.12)" 
                  strokeWidth="3" 
                  strokeDasharray="8 8" 
                />
                {/* Active Colored Trail Drawing on Scroll */}
                <path 
                  d="M 30,75 C 300,10 300,140 600,75 C 900,10 900,140 1170,75" 
                  stroke="url(#active-path-grad)" 
                  strokeWidth="3" 
                  strokeDasharray="1200" 
                  strokeDashoffset={1200 * (1 - scrollProgress)} 
                  className="transition-all duration-100 ease-out"
                />
              </svg>

              {/* Scroll-Bound Micro Jet Overlay */}
              <div 
                className="absolute top-[75px] w-10 h-10 -mt-5 -ml-5 text-brand transition-all duration-100 ease-out"
                style={{
                  left: `${pathX}%`,
                  transform: `translateY(${pathY}px) rotate(${pathRotate}deg)`,
                }}
              >
                <Plane size={24} className="rotate-90 filter drop-shadow-[0_0_6px_rgba(0,61,165,0.4)]" />
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8 relative z-10">
              
              {/* Milestone 1 */}
              <div className="glass-premium shadow-soft p-8 rounded-3xl relative hover-glow group reveal">
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-slate-200 text-brand rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                  1
                </div>
                
                <h4 className="text-xl font-bold font-outfit text-slate-900 mb-3 mt-4 flex items-center justify-between">
                  Trainee (Takeoff)
                  <Compass className="text-brand opacity-80" size={20} />
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Identify emerging candidate leaders within district clubs. Candidates build profiles, log initial training hours, and map initial skillsets.
                </p>

                <div className="mt-6 pt-5 border-t border-slate-200 flex gap-2 flex-wrap">
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">Club Endorse</Badge>
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">Onboarding</Badge>
                </div>
              </div>
              
              {/* Milestone 2 */}
              <div className="glass-premium shadow-soft p-8 rounded-3xl relative hover-glow group reveal" style={{ transitionDelay: '0.1s' }}>
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-slate-200 text-blue-500 rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                  2
                </div>
                
                <h4 className="text-xl font-bold font-outfit text-slate-900 mb-3 mt-4 flex items-center justify-between">
                  Emerging Trainer
                  <TrendingUp className="text-blue-500 opacity-80" size={20} />
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Log active training hours, deliver local presentations, receive peer critiques, and participate in district-wide pilot workshop training runs.
                </p>

                <div className="mt-6 pt-5 border-t border-slate-200 flex gap-2 flex-wrap">
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">Hours Logged</Badge>
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">Peer Review</Badge>
                </div>
              </div>

              {/* Milestone 3 */}
              <div className="glass-premium shadow-soft p-8 rounded-3xl relative hover-glow group reveal" style={{ transitionDelay: '0.2s' }}>
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-slate-200 text-cyan-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-cyan-500 group-hover:text-white transition-colors duration-300">
                  3
                </div>

                <h4 className="text-xl font-bold font-outfit text-slate-900 mb-3 mt-4 flex items-center justify-between">
                  DTD (Cruising)
                  <Activity className="text-cyan-500 opacity-80" size={20} />
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  District coordinators evaluate mock delivery sessions, scoring candidates on slide layouts, vocal presence, content mastery, and adaptability.
                </p>

                <div className="mt-6 pt-5 border-t border-slate-200 flex gap-2 flex-wrap">
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">5-Tier Rubric</Badge>
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">Coordinators</Badge>
                </div>
              </div>

              {/* Milestone 4 */}
              <div className="glass-premium shadow-soft p-8 rounded-3xl relative hover-glow group reveal" style={{ transitionDelay: '0.3s' }}>
                <div className="absolute top-[-25px] left-8 w-12 h-12 bg-white border border-slate-200 text-emerald-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-soft group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                  4
                </div>

                <h4 className="text-xl font-bold font-outfit text-slate-900 mb-3 mt-4 flex items-center justify-between">
                  DT (Accredited)
                  <Award className="text-emerald-500 opacity-80" size={20} />
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Final board review approval checks candidate logs and competency scores. Accredited trainers are inducted into the active District 3220 catalog.
                </p>

                <div className="mt-6 pt-5 border-t border-slate-200 flex gap-2 flex-wrap">
                  <Badge variant="success" className="bg-emerald-100 text-emerald-800 border border-emerald-250">Accredited</Badge>
                  <Badge variant="default" className="bg-slate-100 text-slate-700 border border-slate-200">Flight Deck</Badge>
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
            <Card className="glass-premium hover-glow p-8 rounded-3xl reveal">
              <div className="w-12 h-12 bg-brand-light text-brand rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Users size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Role-based Access</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Separated panels for candidates, evaluators, and system administrators. Keep evaluations secure and data private with Row Level Security.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="glass-premium hover-glow p-8 rounded-3xl reveal" style={{ transitionDelay: '0.1s' }}>
              <div className="w-12 h-12 bg-semantic-successLight text-semantic-success rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Detailed Analytics</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Visual progress timelines, leaderboards, and hour tracking statistics. Get insights into candidate progress across domains.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="glass-premium hover-glow p-8 rounded-3xl reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="w-12 h-12 bg-semantic-warningLight text-semantic-warning rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Award size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Promotion Matrices</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Clear milestones and evaluation checkpoints. Standardize how trainers are selected, tested, and recommended.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="glass-premium hover-glow p-8 rounded-3xl reveal" style={{ transitionDelay: '0.3s' }}>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <BookOpen size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Document Libraries</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                A centralized, secure library to store slides, presentation slides, mock evaluations, and verification proofs.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="glass-premium hover-glow p-8 rounded-3xl reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                <Zap size={22} />
              </div>
              <h3 className="text-xl font-bold text-text-main font-outfit mb-3">Instant Feedback</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Coordinators leave grading ratings directly on individual activities. Instant dashboard updates ensure rapid improvement loops.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="glass-premium hover-glow p-8 rounded-3xl reveal" style={{ transitionDelay: '0.5s' }}>
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

      {/* Dynamic Statistics Board (Intersection Count-Up with Circular Progress HUD Rings) */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#f8fafc] via-[#E0F2FE] to-[#FEF3C7] relative overflow-hidden border-t border-slate-200/80">
        <div className="absolute top-[10%] right-[-10%] w-[350px] h-[350px] bg-sky-300/20 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-[1200px] mx-auto glass-premium p-12 md:p-16 rounded-[2.5rem] shadow-soft text-slate-800 relative overflow-hidden reveal border border-white/60 animate-aurora">
          {/* Subtle backgrounds inside stat frame */}
          <div className="absolute right-[-10%] top-[-20%] w-[350px] h-[350px] bg-white/40 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-center">
            
            {/* Stat 1: Total Trainers */}
            <div className="flex flex-col items-center p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl hover-glow-soft">
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#38BDF8" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - 0.8)} strokeLinecap="round" />
                </svg>
                <div className="font-outfit font-extrabold text-slate-900 text-base">
                  <Counter value={120} suffix="+" />
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 font-mono text-center">Total Trainers</p>
              <p className="text-[9px] text-slate-500 text-center mt-1">Accredited capacity</p>
            </div>

            {/* Stat 2: Activities Completed */}
            <div className="flex flex-col items-center p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl hover-glow-soft">
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - 0.95)} strokeLinecap="round" />
                </svg>
                <div className="font-outfit font-extrabold text-slate-900 text-base">
                  <Counter value={450} suffix="+" />
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 font-mono text-center">Activities</p>
              <p className="text-[9px] text-slate-500 text-center mt-1">Runs completed</p>
            </div>

            {/* Stat 3: Leadership Programs */}
            <div className="flex flex-col items-center p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl hover-glow-soft">
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#F59E0B" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - 0.7)} strokeLinecap="round" />
                </svg>
                <div className="font-outfit font-extrabold text-slate-900 text-base">
                  <Counter value={15} suffix="+" />
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 font-mono text-center">Programs</p>
              <p className="text-[9px] text-slate-500 text-center mt-1">Active curricular courses</p>
            </div>

            {/* Stat 4: Evaluations Completed */}
            <div className="flex flex-col items-center p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl hover-glow-soft">
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#38BDF8" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - 0.85)} strokeLinecap="round" />
                </svg>
                <div className="font-outfit font-extrabold text-slate-900 text-base">
                  <Counter value={320} suffix="+" />
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 font-mono text-center">Evaluations</p>
              <p className="text-[9px] text-slate-500 text-center mt-1">Rubrics completed</p>
            </div>

            {/* Stat 5: District Coverage */}
            <div className="flex flex-col items-center p-6 bg-white/40 backdrop-blur-md border border-white/60 rounded-3xl hover-glow-soft col-span-2 sm:col-span-1">
              <div className="relative w-20 h-20 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset={213.6 * (1 - 1.0)} strokeLinecap="round" />
                </svg>
                <div className="font-outfit font-extrabold text-slate-900 text-base">
                  <Counter value={100} suffix="%" />
                </div>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-700 font-mono text-center">Coverage</p>
              <p className="text-[9px] text-slate-500 text-center mt-1">District clubs mapped</p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer / CTA Section (Takeoff Sunset visual) */}
      <footer className="py-24 px-6 text-center border-t border-amber-200 bg-gradient-to-t from-[#FFE0B2] via-[#FFF3E0] to-[#FFF9F2] text-slate-800 relative overflow-hidden">
        
        {/* Takeoff Runway Perspective Drawing */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[550px] h-[160px] opacity-25 overflow-hidden z-0 pointer-events-none" style={{ perspective: '200px' }}>
          <div className="w-full h-full border-x border-dashed border-slate-400/20 origin-bottom transform rotateX(60deg) flex flex-col justify-between items-center py-4">
            <div className="w-[1px] h-full bg-dashed bg-gradient-to-t from-slate-400/50 to-transparent"></div>
          </div>
        </div>

        {/* Takeoff Jet Visual Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex justify-center items-center">
          <div className="w-[120px] h-[120px] opacity-0 animate-jet-takeoff">
            <svg viewBox="0 0 100 100" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
              <path d="M 50,15 L 60,45 L 85,55 L 60,65 L 50,95 L 40,65 L 15,55 L 40,45 Z" fill="rgba(245, 158, 11, 0.15)" />
            </svg>
            <div className="w-[8px] h-[70px] bg-gradient-to-t from-transparent via-[#F59E0B]/50 to-[#F59E0B] blur-[3px] mx-auto mt-[-5px] opacity-80"></div>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto space-y-8 reveal relative z-10">
          
          <div className="inline-flex w-14 h-14 rounded-2xl bg-white/60 border border-amber-200 text-amber-600 items-center justify-center shadow-soft animate-bounce">
            <Plane size={28} className="rotate-45" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold font-outfit text-slate-900 tracking-tight leading-tight">
            Ready to control the flight deck?
          </h2>
          <p className="text-slate-700 text-lg leading-relaxed max-w-xl mx-auto font-sans">
            Log in to manage candidate runs, complete grading reports, or monitor evaluations dynamically.
          </p>

          <div>
            <Link to="/login">
              <Button size="lg" className="rounded-full shadow-floating px-10 bg-brand text-white hover:bg-[#003080] hover:shadow-[0_12px_30px_rgba(0,61,165,0.25)] hover:scale-105 active:scale-95 transition-all duration-300">
                {isAuthenticated ? 'Go to Dashboard' : 'Access Control Room'}
              </Button>
            </Link>
          </div>

          <div className="pt-12 text-xs text-slate-505 border-t border-slate-250 max-w-md mx-auto flex flex-col sm:flex-row justify-between gap-4 font-semibold">
            <span>© 2026 PILOT District 3220</span>
            <span className="flex items-center gap-1.5 justify-center text-slate-500">
              <Sparkles size={12} className="text-amber-500" /> Developed for Excellence
            </span>
          </div>

        </div>
      </footer>

    </div>
  )
}
