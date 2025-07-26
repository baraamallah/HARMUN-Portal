
"use client";

import React, { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { usePathname } from 'next/navigation';

export const AppLoader = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const hasLoaded = sessionStorage.getItem('hasLoadedBefore');

        if (hasLoaded || pathname.startsWith('/admin') || pathname.startsWith('/login')) {
            setLoading(false);
            return;
        }

        // If it's the first load in the session for a public page
        if (typeof window !== 'undefined') {
            setLoading(true);
            const timer = setTimeout(() => {
                setLoading(false);
                sessionStorage.setItem('hasLoadedBefore', 'true');
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
