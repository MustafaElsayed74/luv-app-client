import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface VapidResponse {
    publicKey: string;
}

@Injectable({
    providedIn: 'root'
})
export class PushNotificationService {
    private http = inject(HttpClient);
    private apiUrl = 'http://www.luvapp.somee.com/api/push-subscription';
    private vapidPublicKey: string | null = null;

    async initializePushNotifications(): Promise<void> {
        // Check if browser supports Service Workers and Push API
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log('Push notifications not supported');
            return;
        }

        try {
            // Register service worker
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered:', registration);

            // Get VAPID public key from backend
            const vapidResponse = await firstValueFrom(
                this.http.get<VapidResponse>(`${this.apiUrl}/vapid-public-key`)
            );
            this.vapidPublicKey = vapidResponse.publicKey;

            // Request notification permission
            await this.requestNotificationPermission();
        } catch (error) {
            console.error('Error initializing push notifications:', error);
        }
    }

    async requestNotificationPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.log('Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            await this.subscribeToPushNotifications();
            return true;
        }

        if (Notification.permission !== 'denied') {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    await this.subscribeToPushNotifications();
                    return true;
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }

        return false;
    }

    async subscribeToPushNotifications(): Promise<void> {
        if (!this.vapidPublicKey) {
            console.error('VAPID public key not available');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;

            // Check if already subscribed
            let subscription = await registration.pushManager.getSubscription();

            if (!subscription) {
                // Subscribe to push notifications
                subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as BufferSource
                });
            }

            // Send subscription to backend
            if (subscription) {
                const subscriptionData = {
                    endpoint: subscription.endpoint,
                    p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
                    auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
                };

                await firstValueFrom(
                    this.http.post(`${this.apiUrl}/subscribe`, subscriptionData)
                );

                console.log('Successfully subscribed to push notifications');
            }
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }

    async unsubscribeFromPushNotifications(): Promise<void> {
        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                const unsubscribeData = {
                    endpoint: subscription.endpoint
                };

                await firstValueFrom(
                    this.http.post(`${this.apiUrl}/unsubscribe`, unsubscribeData)
                );

                await subscription.unsubscribe();
                console.log('Successfully unsubscribed from push notifications');
            }
        } catch (error) {
            console.error('Error unsubscribing from push notifications:', error);
        }
    }

    private urlBase64ToUint8Array(base64String: string): Uint8Array {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }

        return outputArray;
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
}
