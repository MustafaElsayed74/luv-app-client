import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class PokeService {
    private apiUrl = 'http://www.luvapp.somee.com/api/pokes';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    sendPoke(toUserId: number, message: string): Observable<any> {
        return this.http.post(
            this.apiUrl,
            { toUserId, message },
            { headers: this.getHeaders() }
        );
    }

    getReceivedPokes(): Observable<any> {
        return this.http.get(`${this.apiUrl}/received`, { headers: this.getHeaders() });
    }
}
