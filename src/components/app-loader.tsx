
"use client";

import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { usePathname } from 'next/navigation';

export const AppLoader = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only run the loader logic on the client side for the public-facing pages
        if (typeof window !== 'undefined' && !pathname.startsWith('/admin') && !pathname.startsWith('/login')) {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
            }, 3000); 

            return () => clearTimeout(timer);
        } else {
            setLoading(false);
        }
    }, [pathname]);

    if (loading) {
        return <LoadingScreen />;
    }

    return <>{children}</>;
}
