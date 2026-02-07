import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VieweoAuthContextType {
  email: string | null;
  isAuthenticated: boolean;
  grantAccess: (email: string) => void;
  signOut: () => void;
}

const VieweoAuthContext = createContext<VieweoAuthContextType | undefined>(undefined);

const STORAGE_KEY = 'vieweo_user_email';

export function VieweoAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);

  // Load email from localStorage on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem(STORAGE_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const grantAccess = (userEmail: string) => {
    localStorage.setItem(STORAGE_KEY, userEmail);
    setEmail(userEmail);
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
  };

  return (
    <VieweoAuthContext.Provider value={{
      email,
      isAuthenticated: !!email,
      grantAccess,
      signOut
    }}>
      {children}
    </VieweoAuthContext.Provider>
  );
}

export function useVieweoAuth() {
  const context = useContext(VieweoAuthContext);
  if (context === undefined) {
    throw new Error('useVieweoAuth must be used within a VieweoAuthProvider');
  }
  return context;
}
