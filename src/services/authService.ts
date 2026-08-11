import { apiService, type AuthRole, type AuthSession, type AuthUser } from './apiService';

const SESSION_KEY = 'mateo_camila_wedding_session_v1';

class AuthService {
  private listeners: Array<(session: AuthSession | null) => void> = [];
  private session: AuthSession | null = this.readSession();

  private readSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  private persistSession(session: AuthSession | null): void {
    if (typeof window === 'undefined') return;
    if (!session) {
      sessionStorage.removeItem(SESSION_KEY);
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.session));
  }

  public subscribe(callback: (session: AuthSession | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.session);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public getSession(): AuthSession | null {
    return this.session;
  }

  public getToken(): string | null {
    return this.session?.token ?? null;
  }

  public getUser(): AuthUser | null {
    return this.session?.user ?? null;
  }

  public hasRole(role: AuthRole): boolean {
    return this.session?.user.role === role;
  }

  public async login(username: string, password: string): Promise<AuthSession> {
    const session = await apiService.login(username, password);
    this.session = session;
    this.persistSession(session);
    this.notify();
    return session;
  }

  public logout(): void {
    this.session = null;
    this.persistSession(null);
    this.notify();
  }
}

export const authService = new AuthService();