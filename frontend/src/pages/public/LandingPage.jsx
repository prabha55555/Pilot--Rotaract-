import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plane, Cloud, Sparkles, LogIn, Users, TrendingUp, Award, ShieldCheck, User } from 'lucide-react'
import logo from '../../utils/logo.png'
import airplane from '../../utils/airplane.png'
import sunsetSkyBg from '../../utils/sunset_sky_bg.png'
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
      <nav className="fixed top-0 left-0 w-full z-50 py-4 px-6 bg-[#E8E9F7]/95 backdrop-blur-md border-b border-slate-200/50 transition-all duration-300 text-slate-800">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3 group">
            {/* Square PILOT logo badge (dark navy blue, rounded corners ~8px) */}
            <div className="p-1 bg-[#003DA5] rounded-lg shadow-md flex items-center justify-center">
              <img src={logo} alt="PILOT" className="h-9 w-9 object-contain rounded-md" />
            </div>
            <div className="w-[1.5px] h-6 bg-[#003DA5]/30 hidden md:block"></div>
            <span className="text-xs font-bold text-[#003DA5] tracking-widest uppercase font-mono hidden md:block">
              DISTRICT 3220 CONTROL
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="px-5 py-2 text-xs font-bold rounded-full border-2 border-[#003DA5] text-[#003DA5] bg-transparent hover:bg-[#003DA5] hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm">
                <User size={14} />
                Sign In
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
        className="relative pt-32 md:pt-32 pb-12 px-6 flex flex-col justify-center overflow-hidden text-slate-800 flex-grow"
        style={{
          background: 'radial-gradient(120% 120% at 50% 10%, #F5F7FF 0%, #FAFAFC 50%, #FFFFFF 100%)',
        }}
      >
        {/* Sky / HUD Grid Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,61,165,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,61,165,0.012)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none z-0"></div>

        {/* Aerospace HUD Pitch Ladder Left */}
        <div className="absolute left-[5%] top-[25%] h-[40%] w-[60px] border-r border-[#003DA5]/8 flex flex-col justify-between py-6 font-mono text-[9px] text-[#003DA5]/20 z-15 pointer-events-none hidden md:flex">
          <div className="flex items-center gap-1.5 justify-end"><span>+10</span><div className="w-4 h-[1px] bg-[#003DA5]/10"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>+05</span><div className="w-2 h-[1px] bg-[#003DA5]/5"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>00</span><div className="w-6 h-[1px] bg-[#003DA5]/15"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>-05</span><div className="w-2 h-[1px] bg-[#003DA5]/5"></div></div>
          <div className="flex items-center gap-1.5 justify-end"><span>-10</span><div className="w-4 h-[1px] bg-[#003DA5]/10"></div></div>
        </div>

        {/* Decorative subtle HUD Radar in upper-right background */}
        <div className="absolute right-[8%] top-[18%] w-[280px] h-[280px] opacity-10 pointer-events-none z-10 hidden lg:block">
          <svg viewBox="0 0 200 200" className="w-full h-full stroke-[#003DA5]/10" fill="none" strokeWidth="0.5">
            <circle cx="100" cy="100" r="80" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="50" />
            <circle cx="100" cy="100" r="20" strokeDasharray="1 1" />
            <line x1="100" y1="10" x2="100" y2="190" strokeDasharray="4 4" />
            <line x1="10" y1="100" x2="190" y2="100" strokeDasharray="4 4" />
            <text x="96" y="25" fill="#003DA5" fontSize="10" fontFamily="monospace" fontWeight="bold">N</text>
            <text x="175" y="103" fill="#003DA5" fontSize="8" fontFamily="monospace">E</text>
          </svg>
        </div>

        {/* Hero Content Split Grid */}
        <div className="relative z-30 max-w-[1400px] mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center flex-grow pt-4 pb-12">

          {/* Left Column Area (Part 1: Circular Logo Badge, Part 2: Stacked Content below it) */}
          <div className="md:col-span-7 flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-fade-in-up order-1 md:order-none">

            {/* 1. Circular Logo Badge (~280px diameter) */}
            <div className="relative flex items-center justify-center p-6 w-[280px] h-[280px] shrink-0">
              {/* Outer thin dashed circle ring with dot accents */}
              <div className="absolute inset-0 rounded-full border border-dashed border-[#003DA5]/15 animate-[spin_60s_linear_infinite] pointer-events-none">
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#003DA5]/20"></div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#003DA5]/20"></div>
              </div>

              {/* Inner solid navy blue filled circle */}
              <div className="w-[220px] h-[220px] rounded-full bg-[#003DA5] flex flex-col items-center justify-center p-6 shadow-2xl relative transition-all duration-700 hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,61,165,0.25)]">
                {/* Inner Logo image */}
                <img src={logo} alt="PILOT Logo" className="w-[170px] h-auto object-contain rounded-md" />
              </div>
            </div>

            {/* 2. Headline & Stacked Text Block */}
            <div className="flex flex-col items-start text-left space-y-5 max-w-md">
              {/* Version Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-soft">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#003DA5] font-mono">
                  PILOT PLATFORM V2.0
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-5xl md:text-4xl lg:text-[48px] xl:text-[52px] font-extrabold font-outfit text-[#0C122C] leading-tight tracking-tight">
                Identify. Train.<br />
                <span className="text-[#003DA5] font-extrabold">
                  Empower. Lead.
                </span>
              </h1>

              {/* Subtext description */}
              <p className="text-xs md:text-sm lg:text-base text-slate-600 leading-relaxed font-sans">
                A comprehensive platform for discovering, developing, and tracking district trainers for a stronger tomorrow.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/login">
                  <Button
                    size="sm"
                    className="
        rounded-full
        shadow-floating
        group
        px-6 py-2.5
        md:px-8 md:py-4
        bg-[#003DA5]
        hover:bg-[#002D80]
        text-white
        text-xs md:text-base
        font-semibold
        hover:scale-105
        active:scale-95
        transition-all
        duration-300
        flex items-center
      "
                  >
                    Explore Platform
                    <ArrowRight
                      size={14}
                      className="ml-1.5 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* Right Column Area: Sleek Commercial Jet graphic centered in container */}
          <div className="md:col-span-5 relative w-full h-[320px] md:h-[420px] flex items-center justify-center animate-fade-in-up order-2 md:order-none">
            <div className="w-full max-w-[480px] pointer-events-none z-20 relative">
              <div
                className="w-full h-full parallax-layer preserve-3d relative flex justify-center"
                style={{
                  transform: 'perspective(1200px) rotateX(var(--mouse-rotate-x, 0deg)) rotateY(var(--mouse-rotate-y, 0deg))'
                }}
              >
                {/* Clean soft backdrop glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#003DA5]/5 to-[#38BDF8]/10 blur-[80px] rounded-full scale-75 -z-10"></div>

                {/* Jet Image */}
                <img
                  src={airplane}
                  alt="Commercial Jet"
                  className="w-[90%] h-auto object-contain filter drop-shadow-[0_20px_35px_rgba(0,61,165,0.12)] relative z-10 animate-jet-glide"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Premium Bottom Features Bar */}
        <div className="relative z-30 w-full max-w-[1100px] mx-auto mt-auto px-6 mb-4 animate-fade-in-up">
          <div className="w-full h-[1px] bg-slate-200/50 mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-lg backdrop-blur-md">

            {/* Feature 1 */}
            <div className="flex items-center gap-3 px-4 border-r border-slate-100 last:border-0 md:justify-center">
              <Users className="text-[#003DA5] flex-shrink-0 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              <div className="text-left font-sans">
                <span className="text-xs md:text-sm lg:text-base font-bold text-slate-800 block">Empowering</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-slate-500 block">Trainers</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3 px-4 border-r border-slate-100 last:border-0 md:justify-center">
              <TrendingUp className="text-[#003DA5] flex-shrink-0 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              <div className="text-left font-sans">
                <span className="text-xs md:text-sm lg:text-base font-bold text-slate-800 block">Tracking</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-slate-500 block">Progress</span>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3 px-4 border-r border-slate-100 last:border-0 md:justify-center">
              <Award className="text-[#003DA5] flex-shrink-0 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              <div className="text-left font-sans">
                <span className="text-xs md:text-sm lg:text-base font-bold text-slate-800 block">Recognizing</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-slate-500 block">Excellence</span>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3 px-4 last:border-0 md:justify-center">
              <ShieldCheck className="text-[#003DA5] flex-shrink-0 w-5 h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              <div className="text-left font-sans">
                <span className="text-xs md:text-sm lg:text-base font-bold text-slate-800 block">Building</span>
                <span className="text-[10px] md:text-xs lg:text-sm text-slate-500 block">Leadership</span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Team Members Header */}
      <div className="w-full max-w-[1400px] mx-auto px-6 mt-12 mb-4 text-left relative z-30 animate-fade-in-up">
        <h2 className="text-xl font-bold font-outfit text-[#0C122C] tracking-tight">Our District Team Members</h2>
        <p className="text-xs text-slate-500 mt-1">Discover the leaders driving success and excellence in Rotaract District 3220.</p>
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

      {/* Sponsors Header */}
      <div className="w-full max-w-[1400px] mx-auto px-6 mt-8 mb-4 text-left relative z-30 animate-fade-in-up">
        <h2 className="text-xl font-bold font-outfit text-[#0C122C] tracking-tight">Supported by Our Partners</h2>
        <p className="text-xs text-slate-500 mt-1">We are proud to collaborate with industry-leading organizations and sponsors.</p>
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
