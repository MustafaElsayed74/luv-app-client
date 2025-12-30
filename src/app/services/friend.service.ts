import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class FriendService {
    private apiUrl = '/api/friends';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getFriendsList(): Observable<any> {
        return this.http.get(`${this.apiUrl}/list`, { headers: this.getHeaders() });
    }

    sendFriendRequest(toUserId: number): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/request/${toUserId}`,
            {},
            { headers: this.getHeaders() }
        );
    }

    getPendingRequests(): Observable<any> {
        return this.http.get(`${this.apiUrl}/requests/pending`, { headers: this.getHeaders() });
    }

    getSentRequests(): Observable<any> {
        return this.http.get(`${this.apiUrl}/requests/sent`, { headers: this.getHeaders() });
    }

    acceptFriendRequest(requestId: number): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/request/${requestId}/accept`,
            {},
            { headers: this.getHeaders() }
        );
    }

    rejectFriendRequest(requestId: number): Observable<any> {
        return this.http.post(
            `${this.apiUrl}/request/${requestId}/reject`,
            {},
            { headers: this.getHeaders() }
        );
    }
}
