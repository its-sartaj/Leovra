import { AuthUser } from '../types';

const STORAGE_KEY = 'lc_auth_user_v1';

declare global {
  interface Window {
    google?: any;
  }
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  constructor() {
    this.loadInitialUser();
    this.setupStorageSync();
  }

  private loadInitialUser() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private setupStorageSync() {
    if (typeof window === 'undefined') return;
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          this.currentUser = e.newValue ? JSON.parse(e.newValue) : null;
          this.notify();
        } catch {}
      }
    });
  }

  private notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.currentUser);
      } catch (err) {
        console.error('[AuthService] Listener error:', err);
      }
    });

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('leovra_auth_change', { detail: this.currentUser }));
      } catch {}
    }
  }

  public subscribe(listener: (user: AuthUser | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentUser && this.currentUser.email);
  }

  /**
   * Save user session locally and synchronize with backend
   */
  private saveSession(user: AuthUser) {
    this.currentUser = user;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {}
    this.notify();

    // Async sync with backend
    try {
      fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      }).catch(() => {});
    } catch {}
  }

  /**
   * Auto Sign-Up / Login via Gmail address
   */
  public async loginWithGmailAuto(email: string, name?: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid Gmail or email address');
    }

    const displayName = name?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    const picture = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=121212&textColor=ffffff`;

    // Try server sync first to load previous address/phone if exists
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, name: displayName, picture })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.saveSession(data.user);
          return data.user;
        }
      }
    } catch {}

    const user: AuthUser = {
      id: 'USER-' + Date.now().toString(36).toUpperCase(),
      name: displayName,
      email: cleanEmail,
      picture,
      provider: 'google',
      createdAt: new Date().toISOString()
    };

    this.saveSession(user);
    return user;
  }

  /**
   * Login using Google Identity Services (GIS) JWT Token
   */
  public async loginWithGoogleCredential(credential: string): Promise<AuthUser> {
    try {
      // Decode JWT locally
      const parts = credential.split('.');
      if (parts.length < 2) throw new Error('Invalid Google credential token');
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

      const email = payload.email;
      const name = payload.name || payload.given_name || email.split('@')[0];
      const picture = payload.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

      // Post to server for full record storage
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, email, name, picture })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.saveSession(data.user);
          return data.user;
        }
      }

      const fallbackUser: AuthUser = {
        id: 'USER-' + Date.now().toString(36).toUpperCase(),
        name,
        email: email.toLowerCase(),
        picture,
        provider: 'google',
        createdAt: new Date().toISOString()
      };
      this.saveSession(fallbackUser);
      return fallbackUser;
    } catch (err: any) {
      console.error('[AuthService] Google login failed:', err);
      throw new Error(err.message || 'Google Sign-in failed. Please try again.');
    }
  }

  /**
   * Update saved profile details (shipping address, phone, etc.)
   */
  public updateProfile(updates: Partial<AuthUser>): AuthUser {
    if (!this.currentUser) throw new Error('No user logged in');
    const updated: AuthUser = {
      ...this.currentUser,
      ...updates
    };
    this.saveSession(updated);
    return updated;
  }

  /**
   * Sign out current user
   */
  public logout() {
    this.currentUser = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.notify();
  }
}

export const authService = new AuthService();
