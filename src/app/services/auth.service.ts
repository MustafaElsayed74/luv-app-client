import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://www.luvapp.somee.com/api/auth';
    private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
    public token$ = this.tokenSubject.asObservable();
    private userSubject = new BehaviorSubject<any>(this.getUser());
    public user$ = this.userSubject.asObservable();

    constructor(private http: HttpClient) { }

    signup(username: string, password: string, avatar: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/signup`, { username, password, avatar });
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, { username, password });
    }

    setToken(token: string) {
        localStorage.setItem('token', token);
        this.tokenSubject.next(token);
    }

    setUser(user: any) {
        localStorage.setItem('user', JSON.stringify(user));
        this.userSubject.next(user);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    getUser(): any {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.tokenSubject.next(null);
        this.userSubject.next(null);
    }

    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }
}
