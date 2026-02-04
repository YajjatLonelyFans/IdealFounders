'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { HeroSection, FeatureGrid, FeatureCard } from '@/components/animations/HomeAnimations';

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-50/30 to-secondary-50/30">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.jpeg"
                alt="IdealFounders"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                IdealFounders
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                {/* @ts-ignore */}
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                {/* @ts-ignore */}
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent leading-tight">
              Find Your Perfect Co-Founder or Investor
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Connect with like-minded entrepreneurs and investors through our intelligent,
              skill-based matching algorithm. No swiping, just meaningful connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                {/* @ts-ignore */}
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Start Matching
                </Button>
              </Link>
              <Link href="/sign-in">
                {/* @ts-ignore */}
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </HeroSection>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Why Choose IdealFounders?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We use advanced algorithms to match you with the perfect partners based on skills,
              experience, and goals.
            </p>
          </div>

          <FeatureGrid>
            <FeatureCard
              title="Smart Matching"
              description="Our algorithm analyzes your skills, industry, and goals to find the perfect match"
              icon="🎯"
            />
            <FeatureCard
              title="No Swiping"
              description="Focus on quality connections, not endless scrolling"
              icon="✨"
            />
            <FeatureCard
              title="Real-Time Chat"
              description="Connect instantly with your matches through our built-in messaging"
              icon="💬"
            />
            <FeatureCard
              title="Verified Profiles"
              description="All users are verified to ensure authentic connections"
              icon="✓"
            />
          </FeatureGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Ready to Find Your Perfect Match?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of founders and investors building the future together
          </p>
          <Link href="/sign-up">
            {/* @ts-ignore */}
            <Button variant="primary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
