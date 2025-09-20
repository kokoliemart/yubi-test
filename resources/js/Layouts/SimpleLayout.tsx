import { PropsWithChildren } from 'react';

export default function SimpleLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Sales Order Management
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>
        </div>
    );
}