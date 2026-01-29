import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 px-4">
            <SignIn />
        </div>
    );
}
