import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Users, TrendingUp, Award, BookOpen, Zap, Target, CheckCircle } from 'lucide-react'
import logo from '../../utils/logo.png'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-muted font-inter selection:bg-brand-light selection:text-brand">
      {/* Navbar (Public) */}
      <nav className="absolute top-0 w-full z-50 py-6 px-6">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <img src={logo} alt="PILOT" className="h-8 w-auto" />
          <Link to="/login">
            <Button variant="secondary" className="px-6 rounded-full shadow-soft">
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Subtle Background Gradients - Concept B */}
        <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-white rounded-full blur-[100px] opacity-80 pointer-events-none"></div>
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-brand-light rounded-full blur-[120px] opacity-60 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <Badge className="mb-6 rounded-full px-4 py-1.5 shadow-sm bg-white border border-surface-border">
            <span className="text-brand font-medium">Trainer Development Lifecycle</span>
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold font-outfit text-text-main mb-6 leading-tight tracking-tight">
            Build excellence through <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-light font-extrabold text-[#003DA5]">structured development.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Streamline the identification, evaluation, and promotion of future trainers in your Rotaract District with the PILOT platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="rounded-full shadow-floating group px-8">
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-text-main font-outfit mb-4">Everything you need</h2>
            <p className="text-text-muted">Powerful tools designed for trainer excellence.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-floating transition-shadow duration-300">
              <div className="w-12 h-12 bg-brand-light text-brand rounded-xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <h3 className="text-xl font-semibold text-text-main font-outfit mb-2">Identify Talent</h3>
              <p className="text-text-muted leading-relaxed">
                Discover emerging trainer talent and potential within your district community using a structured evaluation matrix.
              </p>
            </Card>

            <Card className="hover:shadow-floating transition-shadow duration-300">
              <div className="w-12 h-12 bg-semantic-successLight text-semantic-success rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={24} />
              </div>
              <h3 className="text-xl font-semibold text-text-main font-outfit mb-2">Track Progress</h3>
              <p className="text-text-muted leading-relaxed">
                Monitor growth and contributions with real-time analytics, leaderboards, and detailed performance metrics.
              </p>
            </Card>

            <Card className="hover:shadow-floating transition-shadow duration-300">
              <div className="w-12 h-12 bg-semantic-warningLight text-semantic-warning rounded-xl flex items-center justify-center mb-6">
                <Award size={24} />
              </div>
              <h3 className="text-xl font-semibold text-text-main font-outfit mb-2">Promote Excellence</h3>
              <p className="text-text-muted leading-relaxed">
                Advance deserving candidates through a transparent, data-backed interview and promotion process.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="py-24 px-6 bg-white relative z-10 border-t border-surface-border">
        <div className="max-w-[1200px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-text-main font-outfit mb-8 leading-tight">Comprehensive Platform</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center shrink-0 text-text-main">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-text-main font-outfit mb-1">Activity Management</h4>
                  <p className="text-text-muted">Track and evaluate trainer activities and contributions effortlessly.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center shrink-0 text-text-main">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-text-main font-outfit mb-1">Evaluation System</h4>
                  <p className="text-text-muted">Structured feedback mechanisms to ensure continuous growth.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-surface-muted rounded-lg flex items-center justify-center shrink-0 text-text-main">
                  <Target size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-lg text-text-main font-outfit mb-1">Performance Analytics</h4>
                  <p className="text-text-muted">Data-driven insights to make informed promotion decisions.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-light to-white rounded-3xl blur-2xl opacity-50"></div>
            <Card className="relative p-10 bg-white/80 backdrop-blur-sm border-white shadow-floating">
              <h3 className="text-2xl font-bold mb-8 font-outfit text-text-main">Built for District Success</h3>
              <ul className="space-y-4">
                {['Role-based dashboards', 'Real-time notifications', 'Secure data storage', 'Document library', 'Interview scheduling', 'Promotion history'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-text-muted">
                    <CheckCircle className="text-semantic-success shrink-0" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-20 text-center border-t border-surface-border">
        <h2 className="text-3xl font-semibold font-outfit text-text-main mb-6">Ready to elevate your trainers?</h2>
        <Link to="/login">
          <Button size="lg" className="rounded-full shadow-soft px-8">
            Access Workspace
          </Button>
        </Link>
      </footer>
    </div>
  )
}
