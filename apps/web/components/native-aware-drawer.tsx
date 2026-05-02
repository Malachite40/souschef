'use client';

import type * as React from 'react';

import { isNativeApp } from '@/lib/utils/platform';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerPortal,
    DrawerTitle,
    DrawerTrigger,
} from '@yeschefai/ui/components/drawer';

function NativeAwareDrawer({
    noBodyStyles,
    repositionInputs,
    ...props
}: React.ComponentProps<typeof Drawer>) {
    const isNative = isNativeApp();

    return (
        <Drawer
            {...props}
            noBodyStyles={isNative ? (noBodyStyles ?? true) : noBodyStyles}
            repositionInputs={
                isNative ? (repositionInputs ?? false) : repositionInputs
            }
        />
    );
}

export {
    NativeAwareDrawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
};
