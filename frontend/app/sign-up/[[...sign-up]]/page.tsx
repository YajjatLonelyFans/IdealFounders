import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
            <SignUp
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-xl"
                    }
                }}
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
                forceRedirectUrl="/onboarding"
            />
        </div>
    );
}
