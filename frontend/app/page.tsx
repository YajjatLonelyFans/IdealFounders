'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  HeroSection,
  ScrollReveal,
  BentoGrid,
  BentoItem,
} from '@/components/animations/HomeAnimations';

/* ─── SVG Icons ──────────────────────────────────────────────── */
const TargetIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth="2" />
    <circle cx="12" cy="12" r="6" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" strokeWidth="2" />
  </svg>
);
const FilterIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);
const ChatIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);
const ArrowRightIcon = () => (
  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
  </svg>
);

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] antialiased selection:bg-blue-200 selection:text-blue-900">

      {/* ───────── Navbar ───────── */}
      <nav className="glass-nav fixed w-full z-50 top-0 py-4" id="navbar">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/idealfounders.jpeg"
              alt="IdealFounders"
              width={40}
              height={40}
              className="rounded-xl shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-105"
            />
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Ideal<span className="text-gradient">Founders</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/sign-in" className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="btn-hero-primary px-6 py-2.5 rounded-full text-white text-sm font-semibold ml-2">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden text-slate-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
      </nav>

      {/* ───────── Hero Section ───────── */}
      <HeroSection>
        <main className="relative pt-40 pb-20 lg:pt-52 lg:pb-32 overflow-hidden px-6 lg:px-8 max-w-7xl mx-auto min-h-[90vh] flex flex-col justify-center">
          {/* Background decor */}
          <div className="absolute inset-0 z-[-1] bg-mesh opacity-70"></div>
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 -left-20 w-[500px] h-[500px] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" style={{ animationDelay: '2s' }}></div>

          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Hero text */}
            <div className="lg:col-span-7 z-10 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold mb-8 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                Intelligent Founder Matching
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-8">
                Find Your Perfect <br className="hidden lg:block" />
                <span className="text-gradient">Co-Founder</span> or <br className="hidden lg:block" />
                <span className="text-gradient">Investor</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed">
                Connect with like-minded entrepreneurs and investors through our advanced algorithmic matching. No swiping, just highly targeted, meaningful connections built for success.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/sign-up" className="btn-hero-primary w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 group">
                  Start Matching
                  <ArrowRightIcon />
                </Link>
                <Link href="/sign-in" className="btn-hero-secondary w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2">
                  Sign In
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="lg:col-span-5 relative z-10 hidden lg:block">
              <div className="relative w-full aspect-square animate-float">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[3rem] transform rotate-3 scale-105 border border-white/50 shadow-2xl"></div>

                {/* Abstract UI */}
                <div className="glass-panel absolute inset-4 rounded-[2.5rem] p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div className="w-24 h-4 rounded-full bg-slate-200"></div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
                  </div>

                  {/* Mock profile card */}
                  <div className="flex-1 bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex-shrink-0"></div>
                    <div className="space-y-2 w-full">
                      <div className="w-2/3 h-4 rounded-full bg-slate-800"></div>
                      <div className="w-1/2 h-3 rounded-full bg-slate-300"></div>
                      <div className="flex gap-2 mt-2">
                        <div className="w-12 h-6 rounded-md bg-blue-50"></div>
                        <div className="w-16 h-6 rounded-md bg-green-50"></div>
                      </div>
                    </div>
                  </div>

                  {/* Match indicator */}
                  <div className="absolute -right-6 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckIcon />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Match Found</div>
                      <div className="text-sm font-bold text-slate-800">94% Compatibility</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </HeroSection>

      {/* ───────── Bento Features Section ───────── */}
      <section className="py-24 relative px-6 lg:px-8 max-w-[90rem] mx-auto">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Why Choose IdealFounders?
          </h2>
          <p className="text-xl text-slate-500 font-medium">
            We use advanced algorithms to match you with the perfect partners based on skills, experience, and goals.
          </p>
        </ScrollReveal>

        <BentoGrid>
          {/* Smart Matching – Large */}
          <BentoItem
            size="large"
            title="Smart Precision Matching"
            description="Say goodbye to random connections. Our proprietary algorithm deeply analyzes your skills, industry background, and long-term goals to surface only highly compatible co-founders and investors."
            icon={<TargetIcon />}
          >
            {/* Chart graphic */}
            <div className="bento-graphic bg-gradient-to-br from-blue-50 to-transparent rounded-tl-[4rem] border-t border-l border-white/60 hidden md:block" style={{ right: 0, bottom: 0 }}>
              <div className="absolute inset-8 bg-white/50 rounded-3xl border border-white backdrop-blur-sm p-6 shadow-sm">
                <div className="flex items-end gap-2 h-full opacity-50">
                  <div className="w-1/6 bg-blue-200 rounded-t-lg h-1/3"></div>
                  <div className="w-1/6 bg-blue-300 rounded-t-lg h-1/2"></div>
                  <div className="w-1/6 bg-blue-400 rounded-t-lg h-2/3"></div>
                  <div className="w-1/6 bg-blue-500 rounded-t-lg h-full"></div>
                  <div className="w-1/6 bg-indigo-500 rounded-t-lg h-4/5"></div>
                  <div className="w-1/6 bg-indigo-600 rounded-t-lg h-5/6"></div>
                </div>
              </div>
            </div>
          </BentoItem>

          {/* No Swiping – Medium */}
          <BentoItem
            size="medium"
            title="No Swiping"
            description="Gamification is for dating, not business. We focus on curating quality connections, not mindless endless scrolling."
            icon={<FilterIcon />}
            iconColorClass="bg-gradient-to-br from-indigo-50 to-white !text-indigo-600 !border-indigo-100"
          />

          {/* Real-Time Chat – Half */}
          <BentoItem
            size="half"
            title="Real-Time Chat"
            description="Connect instantly and seamlessly with your matches through our secure, high-performance built-in messaging system."
            icon={<ChatIcon />}
            iconColorClass="bg-gradient-to-br from-cyan-50 to-white !text-cyan-600 !border-cyan-100"
          >
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-50 rounded-full opacity-50"></div>
          </BentoItem>

          {/* Verified Profiles – Half */}
          <BentoItem
            size="half"
            title="Verified Profiles"
            description="Trust is the foundation of every startup. Every user goes through strict verification to ensure you're interacting with genuine people."
            icon={<ShieldIcon />}
            iconColorClass="bg-gradient-to-br from-emerald-50 to-white !text-emerald-600 !border-emerald-100"
          >
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-50 rounded-full opacity-50"></div>
          </BentoItem>
        </BentoGrid>
      </section>

      {/* ───────── CTA Section ───────── */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>

        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40"></div>

        <ScrollReveal className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tight">
            Ready to Find Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Perfect Match?
            </span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of visionary founders and strategic investors building the future together. Let&apos;s make your idea a reality.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-slate-900 font-bold text-lg hover:scale-105 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 gap-3 group"
          >
            Get Started Free
            <ArrowRightIcon />
          </Link>
        </ScrollReveal>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/idealfounders.jpeg"
              alt="IdealFounders"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-sm font-bold text-slate-800 tracking-tight">IdealFounders</span>
          </Link>
          <p className="text-slate-500 text-sm font-medium">© 2026 IdealFounders. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
