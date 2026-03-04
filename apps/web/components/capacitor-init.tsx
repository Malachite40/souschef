'use client';

import { initCapacitor } from '@/lib/capacitor/init';
import { useEffect } from 'react';

export function CapacitorInit() {
    useEffect(() => {
        initCapacitor();
    }, []);

    return null;
}
