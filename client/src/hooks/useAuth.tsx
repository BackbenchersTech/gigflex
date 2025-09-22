import { onAuthStateChange } from '@/lib/firebase';
import { useMutation } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

export type User = {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const { mutate: syncUser } = useMutation({
    mutationFn: async (firebaseIdToken: string) => {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseIdToken }),
      });

      if (!response.ok) {
        throw new Error('Error logging in');
      }

      return response.json();
    },
    onError: (error) => {
      console.error('Error logging in', error.message);
    },
    onSuccess: (data: User) => {
      setUser(data);
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange((firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }

      const syncFirebaseUserToDB = async () => {
        const idToken = await firebaseUser.getIdToken();
        syncUser(idToken);
      };

      syncFirebaseUserToDB();
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    setUser,
    isAdmin: user?.role.toLowerCase() === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
