import { isNativeApp } from '@/lib/utils/platform';

type ImpactStyle = 'Heavy' | 'Medium' | 'Light';
type NotificationType = 'Success' | 'Warning' | 'Error';

export async function hapticImpact(style: ImpactStyle = 'Medium') {
    if (!isNativeApp()) return;
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle[style] });
}

export async function hapticNotification(type: NotificationType = 'Success') {
    if (!isNativeApp()) return;
    const { Haptics, NotificationType } = await import('@capacitor/haptics');
    await Haptics.notification({ type: NotificationType[type] });
}
