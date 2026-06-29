import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plane, Cloud, Sparkles, LogIn } from 'lucide-react'
import logo from '../../utils/logo.png'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../context/AuthContext'

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const heroRef = useRef(null)

  // Ambient Sky Particles Generator
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map(() => ({
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.4 + 0.1,
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

  useEffect(() => {
    const handleGlobalScroll = () => {
      const scrolled = window.scrollY
      if (heroRef.current) {
        heroRef.current.style.setProperty('--scroll-y', `${scrolled}px`)
      }
    }
    window.addEventListener('scroll', handleGlobalScroll, { passive: true })
    handleGlobalScroll()
    return () => {
      window.removeEventListener('scroll', handleGlobalScroll)
    }
  }, [])

  const members = [
    { name: "Rtr. Sharon Fernando", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Amanda Perera", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Ashan Silva", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Kavishka Jayasinghe", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Shenali De Silva", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Minushi Alwis", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Dinuka Bandara", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Sanduni Perera", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Yasiru Cooray", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Nipun Hewage", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Dilshan Senanayake", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Tharushi Wickramasinghe", img: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Hashan Jayawardena", img: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=100&h=100&q=80" },
    { name: "Rtr. Chathuni Senaratne", img: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=100&h=100&q=80" }
  ]

  const sponsors = [
    {
      name: "Skyward Partners",
      hoverClass: "hover:text-teal-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 140 40" fill="currentColor">
          <path d="M 10,30 L 25,10 L 40,30 M 20,30 L 25,18 L 30,30" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <text x="50" y="25" fontFamily="sans-serif" fontSize="12" fontWeight="bold" letterSpacing="1">SKYWARD</text>
        </svg>
      )
    },
    {
      name: "Apex Holdings",
      hoverClass: "hover:text-amber-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 120 40" fill="currentColor">
          <polygon points="15,30 30,5 45,30" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <polygon points="25,30 30,15 35,30" />
          <text x="55" y="25" fontFamily="sans-serif" fontSize="12" fontWeight="bold" letterSpacing="1">APEX</text>
        </svg>
      )
    },
    {
      name: "Nova Tech",
      hoverClass: "hover:text-indigo-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 140 40" fill="currentColor">
          <circle cx="20" cy="20" r="11" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="20" cy="20" r="4.5" fill="currentColor" />
          <line x1="6" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="1.5" />
          <line x1="20" y1="6" x2="20" y2="34" stroke="currentColor" strokeWidth="1.5" />
          <text x="45" y="25" fontFamily="sans-serif" fontSize="12" fontWeight="bold" letterSpacing="1">NOVA TECH</text>
        </svg>
      )
    },
    {
      name: "Meridian Tech",
      hoverClass: "hover:text-emerald-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 140 40" fill="currentColor">
          <path d="M10,20 C10,10 30,10 30,20 C30,30 50,30 50,20" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="10" cy="20" r="2" />
          <circle cx="30" cy="20" r="2" />
          <circle cx="50" cy="20" r="2" />
          <text x="65" y="25" fontFamily="sans-serif" fontSize="12" fontWeight="bold" letterSpacing="1.5">MERIDIAN</text>
        </svg>
      )
    },
    {
      name: "AeroSpace Dynamics",
      hoverClass: "hover:text-sky-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 150 40" fill="currentColor">
          <path d="M10,23 Q30,8 50,23 T90,23" fill="none" stroke="currentColor" strokeWidth="2" />
          <polygon points="90,23 86,19 94,19" />
          <text x="15" y="34" fontFamily="monospace" fontSize="8" fontWeight="bold" letterSpacing="1.5">AEROSPACE</text>
        </svg>
      )
    },
    {
      name: "Rotaract District 3220",
      hoverClass: "hover:text-pink-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 180 40" fill="currentColor">
          <circle cx="20" cy="20" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="20" cy="20" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="18" y="6" width="4" height="3" />
          <rect x="18" y="31" width="4" height="3" />
          <rect x="6" y="18" width="3" height="4" />
          <rect x="31" y="18" width="3" height="4" />
          <text x="45" y="25" fontFamily="sans-serif" fontSize="10" fontWeight="bold" letterSpacing="0.5">ROTARACT 3220</text>
        </svg>
      )
    },
    {
      name: "CloudNine Solutions",
      hoverClass: "hover:text-cyan-600",
      logo: (
        <svg className="h-10 w-auto" viewBox="0 0 140 40" fill="currentColor">
          <path d="M15,24 C15,19 19,14 24,14 C27,14 29,16 30,18 C32,15 36,14 39,14 C44,14 48,18 48,23 Z" fill="none" stroke="currentColor" strokeWidth="2" />
          <text x="58" y="25" fontFamily="sans-serif" fontSize="12" fontWeight="bold" letterSpacing="1">CLOUDNINE</text>
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-[#fafafc] text-text-main font-sans selection:bg-brand-light selection:text-brand overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Stylesheet for custom logo animation, marquees and reveal transitions */}
      <style>{`
        /* Continuous SVG Outer Path Draw loop */
        @keyframes logo-path-draw {
          0% { stroke-dashoffset: 1110; }
          45% { stroke-dashoffset: 0; }
          85% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -1110; }
        }

        /* Sync path draw for curved frame representation */
        .animate-logo-path {
          stroke-dasharray: 1110;
          animation: logo-path-draw 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Sync white motion trail following aircraft */
        @keyframes trail-slide {
          0% { stroke-dashoffset: 1110; }
          100% { stroke-dashoffset: 0; }
        }

        .animate-logo-trail {
          stroke-dasharray: 180 930;
          animation: trail-slide 5s linear infinite;
        }

        /* PILOT Letters Left-to-Right Reveal */
        @keyframes letters-reveal {
          0% { width: 0; }
          5% { width: 0; }
          45% { width: 480px; }
          85% { width: 480px; }
          100% { width: 0; }
        }

        .animate-letters-reveal {
          animation: letters-reveal 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Subtitle workshop description rising reveal */
        @keyframes subtitle-reveal {
          0%, 15% { opacity: 0; transform: translateY(12px); }
          40%, 80% { opacity: 1; transform: translateY(0); }
          95%, 100% { opacity: 0; transform: translateY(-8px); }
        }

        .animate-logo-subtitle {
          animation: subtitle-reveal 5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;
        }

        /* Aircraft Glow Effect loop */
        @keyframes aircraft-glow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4)); opacity: 0.4; }
          10%, 90% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 1)); opacity: 1; }
          50% { filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.8)); opacity: 0.9; }
        }

        .animate-aircraft-glow {
          animation: aircraft-glow 5s ease-in-out infinite;
        }

        /* Ambient blue lighting glow behind the logo */
        @keyframes logo-ambient-glow {
          0%, 100% { filter: drop-shadow(0 0 15px rgba(56, 189, 248, 0.15)); }
          50% { filter: drop-shadow(0 0 28px rgba(56, 189, 248, 0.4)); }
        }

        .animate-logo-glow {
          animation: logo-ambient-glow 5s ease-in-out infinite;
        }

        /* Infinite horizontal scroll marquee */
        @keyframes marquee-scroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .animate-marquee-scroll {
          animation: marquee-scroll 28s linear infinite;
        }

        /* Infinite horizontal scroll marquee reverse */
        @keyframes marquee-scroll-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }

        .animate-marquee-scroll-reverse {
          animation: marquee-scroll-reverse 28s linear infinite;
        }

        /* Premium Upward reveal animation for landing components */
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Decorative Background Flight Path Line */}
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1440 2000" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="vertical-path-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#003DA5" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.8" />
          </linearGradient>
          <filter id="path-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <path
          d="M 1100,200 C 800,400 150,500 100,900 C 50,1300 950,1500 720,1950"
          fill="none"
          stroke="url(#vertical-path-grad)"
          strokeWidth="3"
          strokeDasharray="8 8"
          opacity="0.2"
        />
        <circle r="4.5" fill="#38BDF8" filter="url(#path-glow)">
          <animateMotion
            path="M 1100,200 C 800,400 150,500 100,900 C 50,1300 950,1500 720,1950"
            dur="20s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>

      {/* Premium Sticky Glassmorphic Navbar */}
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

      {/* Hero / Sky Arena Section */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative pt-32 pb-16 px-6 flex flex-col justify-center overflow-hidden text-slate-800 flex-grow"
      >
        {/* Blending Daytime Sky Layers */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-[#ff9a9e] via-[#fecfef] to-[#feebd0] animate-daylight-sunrise"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#2980B9] via-[#6DD5FA] to-[#FFFFFF] animate-daylight-morning"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#F85F73] via-[#ffc3a0] to-[#FBE555] animate-daylight-golden"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#4568DC] via-[#B06AB3] to-[#feb47b] animate-daylight-sunset"></div>
        </div>

        {/* Volumetric Sunbeams & Sunlight Orb */}
        <div className="absolute left-[15%] -top-[100px] w-[500px] h-[900px] bg-gradient-to-b from-white/30 via-white/10 to-transparent animate-spotlight blur-xl pointer-events-none z-10 origin-top"></div>
        <div className="absolute left-[35%] -top-[100px] w-[600px] h-[1000px] bg-gradient-to-b from-amber-200/20 via-amber-100/5 to-transparent animate-spotlight blur-3xl pointer-events-none z-10 origin-top" style={{ animationDelay: '-6s' }}></div>

        {/* Cinematic Daytime Sun */}
        <div className="absolute top-[8%] left-[28%] w-[220px] h-[220px] rounded-full bg-gradient-to-br from-white via-amber-100 to-yellow-50 opacity-80 blur-xl pointer-events-none z-0 animate-sun-rotate"></div>
        <div className="absolute top-[10%] left-[30%] w-10 h-10 rounded-full bg-white blur-sm pointer-events-none z-0"></div>

        {/* Sky / HUD Grid Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>
        <div className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] bg-sky-300/15 rounded-full blur-[140px] opacity-70 pointer-events-none z-0"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-amber-200/15 rounded-full blur-[140px] opacity-50 pointer-events-none z-0"></div>

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

        {/* Animated Rotating Radar */}
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
        </div>

        {/* Ambient Sky Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {particles.map((p, i) => (
            <div
              key={i}
              className="absolute bottom-0 bg-gradient-to-t from-amber-250 to-white rounded-full animate-sky-particle"
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

        {/* Background Cloud Layer */}
        <div
          className="absolute inset-0 pointer-events-none z-[5] overflow-hidden parallax-layer"
          style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.12))' }}
        >
          {/* Cloud 1 */}
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
            </svg>
          </div>
          {/* Cloud 2 */}
          <div className="absolute top-[28%] w-[200px] h-[100px] opacity-30 animate-cloud-slow" style={{ animationDelay: '-35s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#CBD5E1" opacity="0.25" transform="translate(4, 4)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-slow-grad)" />
            </svg>
          </div>
        </div>

        {/* Midground Cloud Layer */}
        <div
          className="absolute inset-0 pointer-events-none z-10 overflow-hidden parallax-layer"
          style={{ transform: 'translateY(calc(var(--scroll-y, 0px) * 0.32))' }}
        >
          {/* Cloud 3 */}
          <div className="absolute top-[42%] w-[240px] h-[120px] opacity-45 animate-cloud-med" style={{ animationDelay: '-18s' }}>
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-md">
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="#CBD5E1" opacity="0.3" transform="translate(4, 4)" />
              <path d="M20,70 C20,55 40,45 60,50 C70,35 100,30 120,40 C135,30 160,40 160,55 C175,55 185,65 180,75 C185,85 170,95 150,95 C110,95 50,95 20,95 C10,95 5,85 20,70 Z" fill="url(#cloud-slow-grad)" />
            </svg>
          </div>
        </div>

        {/* Realistic Bobbing Jet with 3D Mouse Parallax */}
        <div className="absolute right-[5%] md:right-[10%] top-[35%] md:top-[28%] w-[260px] sm:w-[360px] md:w-[480px] h-[160px] sm:h-[220px] md:h-[280px] pointer-events-none animate-jet-glide z-20">
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
              <path d="M 335,129.5 C 180,135 40,145 -350,150" fill="none" stroke="url(#contrailGrad)" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
              <path d="M 340,154 C 185,160 45,170 -350,175" fill="none" stroke="url(#contrailGrad)" strokeWidth="7" strokeLinecap="round" opacity="0.8" />

              {/* Far Wing */}
              <path d="M 330,130 L 410,50 C 418,42 428,42 432,48 L 435,55 L 370,120 Z" fill="#94A3B8" />
              <path d="M 410,50 L 418,35 L 414,35 L 406,48 Z" fill="#003DA5" />

              {/* Engine Far */}
              <rect x="335" y="122" width="45" height="15" rx="7" fill="url(#metalGrad)" />
              <ellipse cx="335" cy="129.5" rx="4" ry="7.5" fill="#1E293B" />

              {/* Fuselage */}
              <path d="M 160,190 C 220,195 320,175 420,145 C 520,115 580,90 605,80 C 612,77 615,73 607,73 C 557,75 467,90 367,110 C 267,130 187,155 150,170 C 142,173 145,188 160,190 Z" fill="url(#fuselageGrad)" />
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

        {/* Hero Content Grid */}
        <div className="relative z-30 max-w-[1400px] mx-auto w-full grid md:grid-cols-12 gap-12 items-center flex-grow">
          
          {/* Logo Animation Section (Left Side) */}
          <div className="md:col-span-6 flex flex-col items-start justify-center w-full max-w-[550px] mx-auto md:mx-0 animate-fade-in-up">
            
            {/* The SVG Logo Animation Container */}
            <div className="w-full relative select-none animate-logo-glow">
              <svg viewBox="0 0 550 220" className="w-full h-auto drop-shadow-[0_12px_28px_rgba(0,61,165,0.18)] overflow-visible">
                <defs>
                  {/* Subtle ambient drop shadows */}
                  <filter id="logo-blue-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  
                  {/* Glowing filter for aircraft */}
                  <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>

                  {/* Mask for revealing text PILOT left-to-right */}
                  <mask id="letters-mask">
                    <rect x="0" y="0" width="550" height="220" fill="black" />
                    {/* Width of white rect increases to reveal content */}
                    <rect x="0" y="0" height="220" fill="white" className="animate-letters-reveal" />
                  </mask>
                  
                  {/* Glow color gradient for flight path trail */}
                  <linearGradient id="trail-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {/* Ambient Blue Background Accent Circle */}
                <circle cx="275" cy="110" r="140" fill="rgba(56, 189, 248, 0.04)" filter="url(#logo-blue-glow)" />

                {/* 1. Curved outer frame base track (aviation flight path) */}
                <path
                  id="frame-track"
                  d="M 92.5,75 C 60,75 40,75 40,97.5 L 40,145 Q 275,160 510,145 L 510,50 Q 275,35 92.5,50 L 92.5,75"
                  fill="none"
                  stroke="rgba(0, 61, 165, 0.22)"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />

                {/* 2. Synced white light trail path */}
                <path
                  d="M 92.5,75 C 60,75 40,75 40,97.5 L 40,145 Q 275,160 510,145 L 510,50 Q 275,35 92.5,50 L 92.5,75"
                  fill="none"
                  stroke="url(#trail-grad)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-logo-trail"
                />

                {/* 3. Curved outer frame drawing itself */}
                <path
                  d="M 40,97.5 L 40,145 Q 275,160 510,145 L 510,50 Q 275,35 92.5,50"
                  fill="none"
                  stroke="#003DA5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  className="animate-logo-path"
                />

                {/* 4. PILOT Text group (revealed via mask) */}
                <g mask="url(#letters-mask)" fill="#003DA5">
                  {/* P (Stem, Bowl, and placeholder background chevron) */}
                  <path d="M 80,65 H 105 V 72 L 92.5,78 L 80,84 Z" opacity="0.22" />
                  <path d="M 80,96 L 105,84 V 130 H 80 Z" />
                  <path d="M 105,65 H 150 C 168,65 174,72 174,81.25 C 174,90.5 168,97.5 150,97.5 H 105 Z M 105,75 H 138 C 145,75 149,78 149,81.25 C 149,84.5 145,87.5 138,87.5 H 105 Z" fillRule="evenodd" />
                  
                  {/* I */}
                  <rect x="195" y="65" width="25" height="65" rx="2" />
                  
                  {/* L */}
                  <path d="M 240,65 H 265 V 105 H 290 V 130 H 240 Z" />
                  
                  {/* O */}
                  <path d="M 315,97.5 C 315,79 328,65 345,65 C 362,65 375,79 375,97.5 C 375,116 362,130 345,130 C 328,130 315,116 315,97.5 Z M 336.5,97.5 C 336.5,89 339,81.5 345,81.5 C 351,81.5 353.5,89 353.5,97.5 C 353.5,106 351,113.5 350,113.5 C 339,113.5 336.5,106 336.5,97.5 Z" fillRule="evenodd" />
                  
                  {/* T */}
                  <rect x="400" y="65" width="60" height="25" rx="2" />
                  <rect x="417.5" y="90" width="25" height="40" rx="2" />
                </g>

                {/* 5. Subtitle "Rotaract District Trainers Workshop" */}
                <text
                  x="275"
                  y="190"
                  fill="#003DA5"
                  fontSize="12.5"
                  fontFamily="'Outfit', sans-serif"
                  fontWeight="600"
                  letterSpacing="1.2"
                  textAnchor="middle"
                  className="animate-logo-subtitle drop-shadow-[0_2px_5px_rgba(0,0,0,0.15)]"
                >
                  Rotaract District Trainers Workshop
                </text>

                {/* 6. The small aircraft shape flying along its closed-loop path */}
                <g className="animate-aircraft-glow">
                  <path
                    d="M -16,-12 L 8,-12 L 22,0 L 8,12 L -16,12 L -2,0 Z"
                    fill="white"
                    filter="url(#glow-filter)"
                  >
                    <animateMotion
                      dur="5s"
                      repeatCount="indefinite"
                      rotate="auto"
                      path="M 92.5,75 C 60,75 40,75 40,97.5 L 40,145 Q 275,160 510,145 L 510,50 Q 275,35 92.5,50 L 92.5,75"
                    />
                  </path>
                </g>
              </svg>
            </div>

          </div>

          <div className="md:col-span-6"></div>
        </div>

      </section>

      {/* Center Large Premium Heading */}
      <div className="relative z-30 w-full max-w-4xl mx-auto text-center px-6 mb-16 animate-fade-in-up">
        
        {/* Glow Badge */}
        <div className="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full bg-brand/10 border border-brand/20 shadow-soft backdrop-blur-sm mb-6 transition-all hover:border-brand/40">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand font-mono">
            PILOT Platform v2.0
          </span>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold font-outfit text-slate-900 leading-tight tracking-tight mb-6">
          Identify Talent.<br className="sm:hidden" /> Train Excellence.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-blue-600 to-[#3B82F6] font-extrabold relative">
            Elevate Leaders.
            <span className="absolute bottom-1.5 left-0 w-full h-[6px] bg-brand-light/35 -z-10 rounded-full"></span>
          </span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-sans max-w-2xl mx-auto mb-8">
          A centralized trainer development operating system designed for Rotaract District 3220 to evaluate, track, mentor, and promote future district trainers with ultimate clarity.
        </p>

        {/* Entry Call to Action */}
        <div className="flex justify-center items-center gap-4">
          <Link to="/login">
            <Button size="lg" className="rounded-full shadow-floating group px-8 py-3 bg-brand text-white hover:bg-[#003080] hover:shadow-[0_12px_30px_rgba(0,61,165,0.25)] hover:scale-105 active:scale-95 transition-all duration-300 font-semibold text-sm">
              {isAuthenticated ? 'Enter Workspace' : 'Access Control Room'}
              <ArrowRight size={18} className="ml-2 inline-block group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </Link>
        </div>

      </div>

      {/* Members Infinite Marquee scrolling from right to left */}
      <div className="w-full overflow-hidden py-6 border-y border-slate-200/50 bg-white/20 backdrop-blur-sm relative z-30 mb-6">
        <div className="relative w-full overflow-hidden flex">
          <div className="flex w-max gap-8 animate-marquee-scroll hover:[animation-play-state:paused] cursor-pointer">
            
            {/* Set 1 */}
            <div className="flex shrink-0 gap-8 items-center">
              {members.map((member, i) => (
                <div key={`m1-${i}`} className="flex flex-col items-center justify-center p-6 w-52 h-52 rounded-2xl bg-white/45 border border-white/65 shadow-soft backdrop-blur-md hover:bg-brand/10 hover:border-brand/35 hover:text-brand transition-all duration-300">
                  <img src={member.img} alt={member.name} className="w-28 h-28 rounded-full object-cover mb-4 border border-slate-200 shadow-sm" />
                  <span className="text-xs font-semibold text-slate-800 text-center leading-snug">{member.name}</span>
                </div>
              ))}
            </div>

            {/* Set 2 (Duplicate for loop seamlessness) */}
            <div className="flex shrink-0 gap-8 items-center">
              {members.map((member, i) => (
                <div key={`m2-${i}`} className="flex flex-col items-center justify-center p-6 w-52 h-52 rounded-2xl bg-white/45 border border-white/65 shadow-soft backdrop-blur-md hover:bg-brand/10 hover:border-brand/35 hover:text-brand transition-all duration-300">
                  <img src={member.img} alt={member.name} className="w-28 h-28 rounded-full object-cover mb-4 border border-slate-200 shadow-sm" />
                  <span className="text-xs font-semibold text-slate-800 text-center leading-snug">{member.name}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Sponsors Infinite Marquee scrolling from left to right */}
      <div className="w-full overflow-hidden py-6 border-b border-slate-200/50 bg-white/10 backdrop-blur-sm relative z-30 mb-8">
        <div className="relative w-full overflow-hidden flex">
          <div className="flex w-max gap-12 animate-marquee-scroll-reverse hover:[animation-play-state:paused] cursor-pointer">
            
            {/* Set 1 */}
            <div className="flex shrink-0 gap-12 items-center">
              {sponsors.map((sponsor, i) => (
                <div key={`s1-${i}`} className={`flex flex-col items-center justify-center p-6 w-60 h-44 rounded-2xl bg-white/15 border border-white/25 shadow-soft backdrop-blur-sm transition-all duration-300 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-105 text-slate-700 ${sponsor.hoverClass}`}>
                  <div className="h-16 flex items-center justify-center mb-4">
                    {sponsor.logo}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 text-center">{sponsor.name}</span>
                </div>
              ))}
            </div>

            {/* Set 2 (Duplicate for loop seamlessness) */}
            <div className="flex shrink-0 gap-12 items-center">
              {sponsors.map((sponsor, i) => (
                <div key={`s2-${i}`} className={`flex flex-col items-center justify-center p-6 w-60 h-44 rounded-2xl bg-white/15 border border-white/25 shadow-soft backdrop-blur-sm transition-all duration-300 filter grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-105 text-slate-700 ${sponsor.hoverClass}`}>
                  <div className="h-16 flex items-center justify-center mb-4">
                    {sponsor.logo}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 text-center">{sponsor.name}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
