import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private hubConnection?: HubConnection;
    public notificationReceived$ = new BehaviorSubject<any>(null);
    public friendRequestReceived$ = new BehaviorSubject<any>(null);
    public friendRequestAccepted$ = new BehaviorSubject<any>(null);

    constructor(private authService: AuthService) { }

    startConnection() {
        const token = this.authService.getToken();
        if (!token) return;

        this.hubConnection = new HubConnectionBuilder()
            .withUrl(`https://luv-app-client.vercel.app/hubs/notifications?access_token=${token}`)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        this.hubConnection.start().catch(err => console.error('SignalR connection error:', err));

        this.hubConnection.on('ReceiveLoveNotification', (data) => {
            this.notificationReceived$.next(data);
        });

        this.hubConnection.on('ReceiveFriendRequest', (data) => {
            this.friendRequestReceived$.next(data);
        });

        this.hubConnection.on('ReceiveFriendRequestAccepted', (data) => {
            this.friendRequestAccepted$.next(data);
        });
    }

    stopConnection() {
        if (this.hubConnection) {
            this.hubConnection.stop().catch(err => console.error('SignalR disconnect error:', err));
        }
    }
}
