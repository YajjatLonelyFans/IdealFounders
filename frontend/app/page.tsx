import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { HeroSection, FeatureGrid, FeatureCard } from '@/components/animations/HomeAnimations';
import { getCurrentUser } from '@/lib/api';

export default async function HomePage() {
  const { userId, getToken } = await auth();

  // Check if user is authenticated and has completed onboarding
  if (userId) {
    try {
      const token = await getToken();
      if (token) {
        // Try to fetch user profile
        await getCurrentUser(token);
        // If successful, user has completed onboarding - redirect to dashboard
        redirect('/dashboard');
      }
    } catch (error: any) {
      // Only redirect to onboarding if user is definitely not found (404)
      const errorMessage = error.message?.toLowerCase() || '';
      if (errorMessage.includes('404') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('onboarding')) {
        redirect('/onboarding?redirected=true');
      }
      // For other errors (network issues, etc.), redirect to dashboard anyway
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar for landing page */}
      <nav className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image src="/logo.jpeg" alt="IdealFounders" width={40} height={40} className="rounded-lg" />
              <span className="text-xl font-bold text-primary">IdealFounders</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <HeroSection>
            <div className="inline-block mb-6 px-4 py-2 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-full border border-primary-200">
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                🚀 Skill-Based Matchmaking Platform
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Find Your Perfect{' '}
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient">
                Co-founder
              </span>{' '}
              or{' '}
              <span className="bg-gradient-to-r from-accent via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                Investor
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Connect with like-minded founders and investors through our{' '}
              <span className="font-semibold text-primary">skill-based algorithmic matching</span> platform.
              No swiping, just smart connections.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="text-lg px-10 py-6 h-auto group">
                  Start Matching Today
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 h-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </HeroSection>

          {/* Features */}
          <FeatureGrid>
            <FeatureCard>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
              <div className="relative text-center p-8 rounded-2xl border border-border/50 bg-white/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25 group-hover:shadow-xl group-hover:shadow-primary/40 group-hover:-translate-y-1 transition-all duration-300">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Skill-Based Matching
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our algorithm matches you based on complementary skills and industry expertise
                </p>
              </div>
            </FeatureCard>

            <FeatureCard>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative text-center p-8 rounded-2xl border border-border/50 bg-white/50 backdrop-blur-sm hover:border-secondary/20 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-secondary to-secondary-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-secondary/25 group-hover:shadow-xl group-hover:shadow-secondary/40 group-hover:-translate-y-1 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Real-Time Chat
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Connect instantly with your matches through our built-in messaging system
                  </p>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard>
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                <div className="relative text-center p-8 rounded-2xl border border-border/50 bg-white/50 backdrop-blur-sm hover:border-accent/20 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-accent/25 group-hover:shadow-xl group-hover:shadow-accent/40 group-hover:-translate-y-1 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Quality Connections
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Focus on meaningful partnerships with verified founders and investors
                  </p>
                </div>
              </div>
            </FeatureCard>
          </FeatureGrid>
        </div>
      </main >

      {/* Footer */}
      < footer className="bg-white border-t border-border mt-auto" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} IdealFounders. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer >
    </div >
  );
}
