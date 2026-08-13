import { apiService, type AuthRole, type AuthSession, type AuthUser } from './apiService';

const SESSION_KEY = 'mateo_camila_wedding_session_v1';

class AuthService {
  private listeners: Array<(session: AuthSession | null) => void> = [];
  private session: AuthSession | null = this.readSession();

  private isValidSession(value: unknown): value is AuthSession {
    if (!value || typeof value !== 'object') return false;
    const entry = value as Partial<AuthSession>;
    return typeof entry.token === 'string' && !!entry.token && !!entry.user && typeof entry.user.id === 'string' && typeof entry.user.username === 'string' && typeof entry.user.fullName === 'string' && ['superadmin', 'admin', 'user'].includes(entry.user.role ?? '');
  }

  private readSession(): AuthSession | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as unknown;
      if (!this.isValidSession(parsed)) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
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
    if (!this.isValidSession(session)) {
      throw new Error('Sesión inválida recibida desde el servidor');
    }
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