import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { FriendService } from '../../services/friend.service';
import { PokeService } from '../../services/poke.service';
import { NotificationService } from '../../services/notification.service';
import { POKE_MESSAGE_TEMPLATES } from '../../constants/messages';
import { getAvatarUrl, AVATARS } from '../../constants/avatars';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1>💖 Love Check In</h1>
          <div class="user-section">
            <div class="current-user">
              <button (click)="openAvatarPicker()" class="avatar-btn-header">
                <img [src]="getAvatarUrl(currentUser().avatar)" alt="avatar" class="avatar-img small"/>
              </button>
              <span class="username">{{ currentUser().username }}</span>
            </div>
            <button (click)="logout()" class="btn-logout">Logout</button>
          </div>
        </div>
      </header>

      <main class="main-content">
        <!-- Tabs -->
        <div class="tabs">
          <button
            (click)="setActiveTab('friends')"
            [class.active]="activeTab() === 'friends'"
            class="tab-btn"
          >
            👫 Friends
          </button>
          <button
            (click)="setActiveTab('requests')"
            [class.active]="activeTab() === 'requests'"
            class="tab-btn"
          >
            💌 Requests
            @if (pendingRequests().length > 0) {
              <span class="badge">{{ pendingRequests().length }}</span>
            }
          </button>
          <button
            (click)="setActiveTab('users')"
            [class.active]="activeTab() === 'users'"
            class="tab-btn"
          >
            🔍 Find Friends
          </button>
          <button
            (click)="setActiveTab('pokes')"
            [class.active]="activeTab() === 'pokes'"
            class="tab-btn"
          >
            💕 Check Ins
            @if (unreadPokeIds().length > 0) {
              <span class="badge">{{ unreadPokeIds().length }}</span>
            }
          </button>
        </div>

        <!-- Friends Tab -->
        @if (activeTab() === 'friends') {
          <div class="tab-content">
            <h2>Your Friends</h2>
            @if (friends().length > 0) {
              <div class="friends-list">
                @for (friend of friends(); track friend.id) {
                  <div class="friend-card">
                    <img [src]="getAvatarUrl(friend.avatar)" alt="avatar" class="avatar-img"/>
                    <div class="friend-info">
                      <h3>{{ friend.username }}</h3>
                      <p>Friends since {{ formatDate(friend.createdAt) }}</p>
                    </div>
                    <div class="friend-actions">
                      <button
                        (click)="openPokeDialog(friend)"
                        class="btn-poke"
                      >
                        💕 Check In
                      </button>
                      <button
                        (click)="quickPoke(friend)"
                        class="btn-poke"
                        [disabled]="isQuickPokeLoading(friend.id) || isQuickPoked(friend.id)"
                        title="Send a random sweet message"
                      >
                        {{ getQuickPokeLabel(friend.id) }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-state">You don't have any friends yet. Search for friends!</p>
            }
          </div>
        }

        <!-- Requests Tab -->
        @if (activeTab() === 'requests') {
          <div class="tab-content">
            <h2>Friend Requests</h2>
            @if (pendingRequests().length > 0) {
              <div class="requests-list">
                @for (req of pendingRequests(); track req.id) {
                  <div class="request-card">
                    <img [src]="getAvatarUrl(req.fromAvatar)" alt="avatar" class="avatar-img"/>
                    <div class="request-info">
                      <h3>{{ req.fromUsername }}</h3>
                      <p>Sent {{ formatDate(req.createdAt) }}</p>
                    </div>
                    <div class="request-actions">
                      <button
                        (click)="acceptRequest(req.id)"
                        class="btn-accept"
                      >
                        ✓ Accept
                      </button>
                      <button
                        (click)="rejectRequest(req.id)"
                        class="btn-reject"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-state">No friend requests yet.</p>
            }
          </div>
        }

        <!-- Find Friends Tab -->
        @if (activeTab() === 'users') {
          <div class="tab-content">
            <h2>Find Friends</h2>
            <div class="search-box">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="searchUsers($event)"
                placeholder="Search by username..."
                class="search-input"
              />
            </div>
            @if (searchResults().length > 0) {
              <div class="users-list">
                @for (user of searchResults(); track user.id) {
                  <div class="user-card">
                    <img [src]="getAvatarUrl(user.avatar)" alt="avatar" class="avatar-img"/>
                    <div class="user-info">
                      <h3>{{ user.username }}</h3>
                      <p>Joined {{ formatDate(user.createdAt) }}</p>
                    </div>
                    <button
                      (click)="sendFriendRequest(user.id)"
                      [disabled]="isFriend(user.id) || isRequested(user.id)"
                      class="btn-add-friend"
                    >
                      {{ isFriend(user.id) ? '✓ Friend' : (isRequested(user.id) ? 'Sent' : '+ Add Friend') }}
                    </button>
                  </div>
                }
              </div>
            } @else if (searchQuery) {
              <p class="empty-state">No users found.</p>
            }
          </div>
        }

        <!-- Check Ins Tab -->
        @if (activeTab() === 'pokes') {
          <div class="tab-content">
            <h2>Your Check Ins</h2>
            @if (receivedPokes().length > 0) {
              <div class="pokes-list">
                @for (poke of receivedPokes(); track poke.id) {
                  <div class="poke-card">
                    <div class="poke-header">
                      <img [src]="getAvatarUrl(poke.fromAvatar)" alt="avatar" class="avatar-img"/>
                      <div class="poke-from">
                        <h3>{{ poke.fromUsername }} checked in on you</h3>
                        <p>{{ formatDate(poke.createdAt) }}</p>
                      </div>
                    </div>
                    <p class="poke-message">"{{ poke.message }}"</p>
                  </div>
                }
              </div>
            } @else {
              <p class="empty-state">No check ins yet. Send one to get started!</p>
            }
          </div>
        }
      </main>

      <!-- Poke Dialog -->
      @if (showPokeDialog()) {
        <div class="modal-overlay" (click)="closePokeDialog()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h2>Send a check in to {{ selectedFriend()?.username }}!</h2>
            <textarea
              [(ngModel)]="pokeMessage"
              placeholder="Write something sweet..."
              class="poke-textarea"
            ></textarea>
            <div class="modal-actions">
              <button (click)="sendPoke()" class="btn-send">Send Check In 💕</button>
              <button (click)="closePokeDialog()" class="btn-cancel">Cancel</button>
            </div>
          </div>
        </div>
      }

      <!-- Avatar Picker Modal -->
      @if (showAvatarPicker()) {
        <div class="modal-overlay" (click)="closeAvatarPicker()">
          <div class="modal avatar-picker-modal" (click)="$event.stopPropagation()">
            <h2>Choose Your Avatar</h2>
            <div class="avatar-picker-grid">
              @for (avatar of AVATARS; track avatar.id) {
                <button
                  type="button"
                  (click)="changeAvatar(avatar.id)"
                  [class.selected]="currentUser().avatar === avatar.id"
                  [disabled]="isChangingAvatar()"
                  class="avatar-picker-btn"
                >
                  <img [src]="getAvatarUrl(avatar.id)" [alt]="avatar.name" class="avatar-picker-img"/>
                </button>
              }
            </div>
            <div class="modal-actions">
              <button (click)="closeAvatarPicker()" class="btn-cancel">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
    styles: [`
    .dashboard {
      min-height: 100vh;
      background: linear-gradient(135deg, #ffd6e8 0%, #e8d4f8 50%, #f0d9ff 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .header {
      background: white;
      border-bottom: 2px solid rgba(255, 182, 193, 0.3);
      padding: 1rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      font-size: 1.8rem;
      background: linear-gradient(135deg, #ff69b4, #da70d6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .current-user {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #f5f5f5;
      padding: 0.5rem 1rem;
      border-radius: 20px;
    }

    .avatar {
      font-size: 1.5rem;
    }

    .avatar-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .avatar-img.small {
      width: 28px;
      height: 28px;
    }

    .avatar-btn-header {
      background: none;
      border: 2px solid transparent;
      border-radius: 50%;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .avatar-btn-header:hover {
      border-color: #ff69b4;
      transform: scale(1.1);
    }

    .avatar-picker-modal {
      max-width: 500px;
    }

    .avatar-picker-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin: 2rem 0;
    }

    .avatar-picker-btn {
      background: #f5f5f5;
      border: 3px solid transparent;
      border-radius: 12px;
      padding: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;
      overflow: hidden;
    }

    .avatar-picker-img {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
    }

    .avatar-picker-btn:hover:not(:disabled) {
      background: #ffe8f0;
      transform: scale(1.05);
    }

    .avatar-picker-btn.selected {
      background: linear-gradient(135deg, #ffe8f0, #f0e8ff);
      border-color: #ff69b4;
      box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.2);
    }

    .avatar-picker-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .username {
      font-weight: 600;
      color: #333;
    }

    .btn-logout {
      padding: 0.5rem 1rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
    }

    .btn-logout:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }

    .main-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      background: white;
      padding: 0.5rem;
      border-radius: 15px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      flex-wrap: wrap;
    }

    .tab-btn {
      padding: 0.75rem 1.5rem;
      background: transparent;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.95rem;
      font-weight: 600;
      color: #666;
      position: relative;
    }

    .tab-btn:hover {
      background: #f5f5f5;
    }

    .tab-btn.active {
      background: linear-gradient(135deg, #ffe8f0, #f0e8ff);
      color: #ff69b4;
    }

    .badge {
      position: absolute;
      top: -5px;
      right: 5px;
      background: #ff6b6b;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: bold;
    }

    .tab-content {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    }

    .tab-content h2 {
      color: #333;
      margin-top: 0;
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
    }

    .empty-state {
      text-align: center;
      color: #999;
      padding: 2rem;
      font-size: 1rem;
    }

    .friends-list, .requests-list, .users-list, .pokes-list {
      display: grid;
      gap: 1rem;
    }

    .friend-card, .request-card, .user-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9f9f9;
      border-radius: 12px;
      transition: all 0.2s ease;
    }

    .friend-card:hover, .request-card:hover, .user-card:hover {
      background: #f0e8ff;
      transform: translateX(5px);
    }

    .friend-info, .request-info, .user-info {
      flex: 1;
    }

    .friend-info h3, .request-info h3, .user-info h3 {
      margin: 0;
      color: #333;
      font-size: 1rem;
    }

    .friend-info p, .request-info p, .user-info p {
      margin: 0.25rem 0 0 0;
      color: #999;
      font-size: 0.85rem;
    }

    .friend-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-poke, .btn-add-friend {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #ff69b4, #da70d6);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .btn-poke:hover, .btn-add-friend:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(255, 105, 180, 0.4);
    }

    .btn-add-friend:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .request-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-accept {
      padding: 0.5rem 1rem;
      background: #27ae60;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-accept:hover {
      background: #229954;
      transform: translateY(-2px);
    }

    .btn-reject {
      padding: 0.5rem 1rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .btn-reject:hover {
      background: #c0392b;
      transform: translateY(-2px);
    }

    .search-box {
      margin-bottom: 1.5rem;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #f0d9ff;
      border-radius: 10px;
      font-size: 1rem;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #ff69b4;
      box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
    }

    .poke-card {
      background: linear-gradient(135deg, #ffe8f0, #f0e8ff);
      padding: 1.5rem;
      border-radius: 12px;
      border-left: 4px solid #ff69b4;
    }

    .poke-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .poke-from h3 {
      margin: 0;
      color: #333;
      font-size: 1rem;
    }

    .poke-from p {
      margin: 0.25rem 0 0 0;
      color: #999;
      font-size: 0.85rem;
    }

    .poke-message {
      margin: 0;
      color: #555;
      font-style: italic;
      padding: 1rem;
      background: white;
      border-radius: 8px;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }

    .modal h2 {
      color: #333;
      margin-top: 0;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .poke-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #f0d9ff;
      border-radius: 10px;
      font-size: 1rem;
      font-family: inherit;
      resize: vertical;
      min-height: 100px;
      box-sizing: border-box;
      margin-bottom: 1.5rem;
    }

    .poke-textarea:focus {
      outline: none;
      border-color: #ff69b4;
      box-shadow: 0 0 0 3px rgba(255, 105, 180, 0.1);
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-send {
      flex: 1;
      padding: 0.75rem;
      background: linear-gradient(135deg, #ff69b4, #da70d6);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
    }

    .btn-send:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(255, 105, 180, 0.4);
    }

    .btn-cancel {
      flex: 1;
      padding: 0.75rem;
      background: #eee;
      color: #333;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
    }

    .btn-cancel:hover {
      background: #ddd;
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .tabs {
        flex-direction: column;
      }

      .friend-card, .request-card, .user-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .request-actions {
        width: 100%;
      }

      .btn-accept, .btn-reject {
        flex: 1;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
    getAvatarUrl = getAvatarUrl;
    AVATARS = AVATARS;

    activeTab = signal('friends');
    currentUser = signal<any>(null);
    friends = signal<any[]>([]);
    pendingRequests = signal<any[]>([]);
    searchResults = signal<any[]>([]);
    receivedPokes = signal<any[]>([]);
    sentRequests = signal<number[]>([]);
    unreadPokeIds = signal<number[]>([]);
    seenPokeIds = signal<number[]>([]);
    quickPokeLoadingIds = signal<number[]>([]);
    quickPokedIds = signal<number[]>([]);

    searchQuery = '';
    showPokeDialog = signal(false);
    showAvatarPicker = signal(false);
    selectedFriend = signal<any>(null);
    pokeMessage = '';
    avatarChanging = signal(false);

    constructor(
        private authService: AuthService,
        private userService: UserService,
        private friendService: FriendService,
        private pokeService: PokeService,
        private notificationService: NotificationService,
        private router: Router
    ) { }

    ngOnInit() {
        if (!this.authService.isLoggedIn()) {
            this.router.navigate(['/login']);
            return;
        }

        this.currentUser.set(this.authService.getUser());
        this.loadFriends();
        this.loadPendingRequests();
        this.loadSentRequests();
        this.loadReceivedPokes();
        this.notificationService.startConnection();
        this.subscribeToNotifications();
    }

    ngOnDestroy() {
        this.notificationService.stopConnection();
    }

    loadFriends() {
        this.friendService.getFriendsList().subscribe({
            next: (friends) => this.friends.set(friends),
            error: (error) => console.error('Error loading friends:', error)
        });
    }

    loadPendingRequests() {
        this.friendService.getPendingRequests().subscribe({
            next: (requests) => this.pendingRequests.set(requests),
            error: (error) => console.error('Error loading requests:', error)
        });
    }

    loadSentRequests() {
        this.friendService.getSentRequests().subscribe({
            next: (requests) => {
                const ids = (requests || []).map((r: any) => r.toUserId);
                this.sentRequests.set(ids);
            },
            error: (error) => console.error('Error loading sent requests:', error)
        });
    }

    loadReceivedPokes() {
        this.pokeService.getReceivedPokes().subscribe({
            next: (pokes) => {
                this.receivedPokes.set(pokes);
                const currentIds = (pokes || []).map((p: any) => p.id);

                // If we're viewing the Check Ins tab, mark all as read
                if (this.activeTab() === 'pokes') {
                    this.seenPokeIds.set(currentIds);
                    this.unreadPokeIds.set([]);
                } else {
                    const seen = new Set(this.seenPokeIds());
                    const unread = new Set(this.unreadPokeIds());
                    // Add new ids to unread
                    currentIds.forEach((id: number) => {
                        if (!seen.has(id)) unread.add(id);
                    });
                    // Remove ids that no longer exist
                    [...unread].forEach((id: number) => {
                        if (!currentIds.includes(id)) unread.delete(id);
                    });
                    this.unreadPokeIds.set([...unread]);
                }
            },
            error: (error) => console.error('Error loading pokes:', error)
        });
    }

    searchUsers(query: string) {
        if (!query.trim()) {
            this.searchResults.set([]);
            return;
        }

        this.userService.search(query).subscribe({
            next: (results) => {
                const filtered = results.filter((u: any) => u.id !== this.currentUser().id);
                this.searchResults.set(filtered);
            },
            error: (error) => console.error('Error searching users:', error)
        });
    }

    sendFriendRequest(userId: number) {
        this.friendService.sendFriendRequest(userId).subscribe({
            next: () => {
                // Optimistically mark as sent and refresh search results
                if (!this.sentRequests().includes(userId)) {
                    this.sentRequests.set([...this.sentRequests(), userId]);
                }
                this.searchUsers(this.searchQuery);
            },
            error: (error) => {
                const msg: string = error?.error?.message || '';
                // If already sent, reflect UI state
                if (msg.toLowerCase().includes('already sent')) {
                    if (!this.sentRequests().includes(userId)) {
                        this.sentRequests.set([...this.sentRequests(), userId]);
                    }
                }
                // If already friends, refresh friends list
                if (msg.toLowerCase().includes('already friends')) {
                    this.loadFriends();
                }
                // Optionally refresh search list to update buttons
                this.searchUsers(this.searchQuery);
                console.error('Error sending friend request:', msg || error);
            }
        });
    }

    acceptRequest(requestId: number) {
        this.friendService.acceptFriendRequest(requestId).subscribe({
            next: () => {
                this.loadFriends();
                this.loadPendingRequests();
            },
            error: (error) => console.error('Error accepting request:', error)
        });
    }

    rejectRequest(requestId: number) {
        this.friendService.rejectFriendRequest(requestId).subscribe({
            next: () => {
                this.loadPendingRequests();
            },
            error: (error) => console.error('Error rejecting request:', error)
        });
    }

    openPokeDialog(friend: any) {
        this.selectedFriend.set(friend);
        this.pokeMessage = '';
        this.showPokeDialog.set(true);
    }

    closePokeDialog() {
        this.showPokeDialog.set(false);
        this.selectedFriend.set(null);
        this.pokeMessage = '';
    }

    sendPoke() {
        if (!this.pokeMessage.trim() || !this.selectedFriend()) {
            return;
        }

        this.pokeService.sendPoke(this.selectedFriend().id, this.pokeMessage).subscribe({
            next: () => {
                this.closePokeDialog();
                this.loadReceivedPokes();
            },
            error: (error) => console.error('Error sending poke:', error)
        });
    }

    quickPoke(friend: any) {
        if (!friend) return;

        const from = this.currentUser()?.username || '';
        const to = friend.username || '';
        const template = POKE_MESSAGE_TEMPLATES[Math.floor(Math.random() * POKE_MESSAGE_TEMPLATES.length)] || '';
        const message = template
            .replaceAll('{{to}}', to)
            .replaceAll('{{from}}', from)
            .replaceAll('{user}', to)
            .replaceAll('{me}', from);

        if (!message.trim()) return;

        // mark as loading to prevent double clicks
        if (!this.quickPokeLoadingIds().includes(friend.id)) {
            this.quickPokeLoadingIds.set([...this.quickPokeLoadingIds(), friend.id]);
        }

        this.pokeService.sendPoke(friend.id, message).subscribe({
            next: () => {
                this.loadReceivedPokes();
                // update button to Sent and clear loading
                this.quickPokeLoadingIds.set(this.quickPokeLoadingIds().filter(id => id !== friend.id));
                if (!this.quickPokedIds().includes(friend.id)) {
                    this.quickPokedIds.set([...this.quickPokedIds(), friend.id]);
                }
                // reset to default after a short delay
                setTimeout(() => {
                    this.quickPokedIds.set(this.quickPokedIds().filter(id => id !== friend.id));
                }, 3000);
            },
            error: (error) => {
                // clear loading state on error
                this.quickPokeLoadingIds.set(this.quickPokeLoadingIds().filter(id => id !== friend.id));
                console.error('Error sending quick poke:', error);
            }
        });
    }

    isQuickPokeLoading(userId: number): boolean {
        return this.quickPokeLoadingIds().includes(userId);
    }

    isQuickPoked(userId: number): boolean {
        return this.quickPokedIds().includes(userId);
    }

    getQuickPokeLabel(userId: number): string {
        if (this.isQuickPokeLoading(userId)) return 'Sending…';
        if (this.isQuickPoked(userId)) return 'Sent ✓';
        return '⚡ Quick Check In';
    }

    openAvatarPicker() {
        this.showAvatarPicker.set(true);
    }

    closeAvatarPicker() {
        this.showAvatarPicker.set(false);
    }

    changeAvatar(avatarId: string) {
        if (this.avatarChanging()) return;

        const userId = this.currentUser().id;
        if (!userId) return;

        this.avatarChanging.set(true);
        this.userService.updateAvatar(userId, avatarId).subscribe({
            next: (updatedUser) => {
                this.currentUser.set(updatedUser);
                this.authService.setUser(updatedUser);
                this.avatarChanging.set(false);
                this.closeAvatarPicker();
            },
            error: (error) => {
                console.error('Error changing avatar:', error);
                this.avatarChanging.set(false);
            }
        });
    }

    isChangingAvatar(): boolean {
        return this.avatarChanging();
    }

    subscribeToNotifications() {
        this.notificationService.notificationReceived$.subscribe((notif) => {
            if (notif) {
                this.loadReceivedPokes();
            }
        });

        this.notificationService.friendRequestReceived$.subscribe((req) => {
            if (req) {
                this.loadPendingRequests();
            }
        });

        this.notificationService.friendRequestAccepted$.subscribe((data) => {
            if (data) {
                this.loadFriends();
            }
        });
    }

    setActiveTab(tab: string) {
        this.activeTab.set(tab);
        if (tab === 'pokes') {
            this.markAllPokesRead();
        }
    }

    markAllPokesRead() {
        const currentIds = (this.receivedPokes() || []).map((p: any) => p.id);
        this.seenPokeIds.set(currentIds);
        this.unreadPokeIds.set([]);
    }

    formatDate(date: string): string {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    isFriend(userId: number): boolean {
        return this.friends().some(f => f.id === userId);
    }

    isRequested(userId: number): boolean {
        return this.sentRequests().includes(userId);
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
