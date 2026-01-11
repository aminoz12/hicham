import { createContext, useContext, useEffect, useState } from 'react';

// Simple admin credentials
const ADMIN_CREDENTIALS = {
  username: 'hijabinour',
  password: 'wassim123@',
};

type User = {
  id: string;
  username: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(true);
      } catch (e) {
        localStorage.removeItem('admin_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<{ error: Error | null }> => {
    // Simple authentication check
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userData: User = {
        id: '1',
        username: username,
        email: 'admin@hijabiinoor.com',
      };
      setUser(userData);
      setIsAdmin(true);
      localStorage.setItem('admin_user', JSON.stringify(userData));
      return { error: null };
    } else {
      return { error: new Error('Nom d\'utilisateur ou mot de passe incorrect') };
    }
  };

  const signOut = async (): Promise<{ error: Error | null }> => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('admin_user');
    return { error: null };
  };

  const value = {
    user,
    loading,
    login,
    signOut,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
