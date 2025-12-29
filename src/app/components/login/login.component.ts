import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-container">
      <div class="login-card">
        <h1>💖 Love Poke</h1>
        <p class="subtitle">Connect with your crush</p>

        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Username"
              class="input-field"
              required
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Password"
              class="input-field"
              required
            />
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button
            type="submit"
            class="btn-primary"
            [disabled]="loading()"
          >
            {{ loading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <p class="toggle-text">
          Don't have an account?
          <a (click)="goToSignup()" class="link">Sign up</a>
        </p>
      </div>
    </div>
  `,
    styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ffd6e8 0%, #e8d4f8 50%, #f0d9ff 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .login-card {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(255, 182, 193, 0.3);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #ff69b4, #da70d6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .input-field {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #f0d9ff;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }

    .input-field:focus {
      outline: none;
      border-color: #ff69b4;
      box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
    }

    .error-message {
      color: #e74c3c;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #fadbd8;
      border-radius: 8px;
      text-align: center;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #ff69b4, #da70d6);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 1rem;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 105, 180, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .toggle-text {
      text-align: center;
      color: #666;
      font-size: 0.9rem;
    }

    .link {
      color: #ff69b4;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .link:hover {
      color: #da70d6;
    }
  `]
})
export class LoginComponent {
    username = '';
    password = '';
    error = signal('');
    loading = signal(false);

    constructor(private authService: AuthService, private router: Router) { }

    onLogin() {
        if (!this.username || !this.password) {
            this.error.set('Please fill in all fields');
            return;
        }

        this.loading.set(true);
        this.error.set('');

        this.authService.login(this.username, this.password).subscribe({
            next: (response) => {
                this.authService.setToken(response.token);
                this.authService.setUser(response.user);
                this.router.navigate(['/dashboard']);
            },
            error: (error) => {
                this.error.set(error.error?.message || 'Login failed. Please try again.');
                this.loading.set(false);
            }
        });
    }

    goToSignup() {
        this.router.navigate(['/signup']);
    }
}
