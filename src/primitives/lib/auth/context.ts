import NoopAuth from './NoopAuth'
import { createContext } from '@lit/context'
import Account from './Account'

export interface AuthContext {
  account: Account | null;
  login(loginUrl?: string): Promise<void>;
  signup(): Promise<void>;
  logout(): Promise<void>;
  onSessionUpdated(callback: () => unknown): () => void;
}

export const DEFAULT_AUTH_CONTEXT = new NoopAuth()
export const authContext = createContext<AuthContext>(Symbol('auth'))
