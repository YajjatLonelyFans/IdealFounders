import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { getCurrentUser } from '@/lib/api';

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    // Get current pathname to check if we're on onboarding page
    const headersList = await headers();
    const pathname = headersList.get('x-pathname') || '';
    const isOnboardingPage = pathname.includes('/onboarding');

    // Check if user has completed onboarding
    if (!isOnboardingPage) {
        try {
            const token = await getToken();
            if (token) {
                await getCurrentUser(token);
            }
        } catch (error: any) {
            console.error('[ProtectedLayout] Error checking profile:', error.message);

            // Re-enable smart redirect for legitimate 404s
            const errorMessage = error.message?.toLowerCase() || '';
            if (errorMessage.includes('404') ||
                errorMessage.includes('not found') ||
                errorMessage.includes('onboarding')) {
                redirect('/onboarding?redirected=true');
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
