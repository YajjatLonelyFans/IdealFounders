import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-white border-t border-border mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600">
                        © {new Date().getFullYear()} IdealFounders. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <span className="text-sm text-gray-600">
                            About
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
