import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = '/api/users';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders() {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    getAll(): Observable<any> {
        return this.http.get(this.apiUrl);
    }

    getById(id: number): Observable<any> {
        return this.http.get(`${this.apiUrl}/${id}`);
    }

    search(username: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/search/${username}`);
    }

    getCurrentUser(): Observable<any> {
        return this.http.get(`${this.apiUrl}/me`, { headers: this.getHeaders() });
    }

    updateAvatar(userId: number, avatar: string): Observable<any> {
        return this.http.put(
            `${this.apiUrl}/${userId}/avatar`,
            { avatar },
            { headers: this.getHeaders() }
        );
    }
}
