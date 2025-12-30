import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { AVATARS, getAvatarUrl } from '../../constants/avatars';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="signup-container">
      <div class="signup-card">
        <h1>💖 Create Account</h1>
        <p class="subtitle">Start checking in with your love</p>

        <form (ngSubmit)="onSignup()">
          <div class="form-group">
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Choose a username"
              class="input-field"
              required
            />
          </div>

          <div class="form-group">
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="Create a password"
              class="input-field"
              required
            />
          </div>

          <div class="form-group">
            <label class="avatar-label">Choose your avatar:</label>
            <div class="avatar-grid">
              @for (avatar of avatars; track avatar.id) {
                <button
                  type="button"
                  (click)="selectAvatar(avatar.id)"
                  [class.selected]="selectedAvatar === avatar.id"
                  class="avatar-btn"
                >
                  <img [src]="getAvatarUrl(avatar.id)" [alt]="avatar.name" class="avatar-img"/>
                </button>
              }
            </div>
          </div>

          @if (error()) {
            <div class="error-message">{{ error() }}</div>
          }

          <button
            type="submit"
            class="btn-primary"
            [disabled]="loading()"
          >
            {{ loading() ? 'Creating account...' : 'Sign Up' }}
          </button>
        </form>

        <p class="toggle-text">
          Already have an account?
          <a (click)="goToLogin()" class="link">Login</a>
        </p>
      </div>
      <footer class="footer">
        <p>Developed With <span class="heart">❤️</span> القشة الأقوىٰ في العالم</p>
      </footer>
    </div>
  `,
  styles: [`
    .signup-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #ffd6e8 0%, #e8d4f8 50%, #f0d9ff 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 1rem;
      position: relative;
    }

    .signup-card {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(255, 182, 193, 0.3);
      width: 100%;
      max-width: 450px;
    }

    h1 {
      text-align: center;
      font-size: 2rem;
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

    .avatar-label {
      display: block;
      margin-bottom: 1rem;
      font-weight: 600;
      color: #333;
      font-size: 0.95rem;
    }

    .avatar-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .avatar-btn {
      background: #f5f5f5;
      border: 3px solid transparent;
      border-radius: 16px;
      padding: 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .avatar-img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 12px;
    }

    .avatar-btn:hover {
      background: #ffe8f0;
      transform: scale(1.05);
    }

    .avatar-btn.selected {
      background: linear-gradient(135deg, #ffe8f0, #f0e8ff);
      border-color: #ff69b4;
      box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
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

    .footer {
      position: absolute;
      bottom: 1rem;
      width: 100%;
      text-align: center;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
    }

    .footer .heart {
      display: inline-block;
      animation: heartbeat 1.5s ease-in-out infinite;
      color: #ff4081;
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      10%, 30% { transform: scale(1.1); }
      20% { transform: scale(1.15); }
    }
  `]
})
export class SignupComponent {
  username = '';
  password = '';
  selectedAvatar = 'avatar-1';
  error = signal('');
  loading = signal(false);
  avatars = AVATARS;
  getAvatarUrl = getAvatarUrl;

  constructor(private authService: AuthService, private router: Router) { }

  selectAvatar(avatarId: string) {
    this.selectedAvatar = avatarId;
  }

  onSignup() {
    if (!this.username || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.signup(this.username, this.password, this.selectedAvatar).subscribe({
      next: (response) => {
        this.authService.setToken(response.token);
        this.authService.setUser(response.user);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.error.set(error.error?.message || 'Sign up failed. Please try again.');
        this.loading.set(false);
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
