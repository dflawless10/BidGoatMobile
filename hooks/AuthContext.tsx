import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  PropsWithChildren,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  login: (token: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>; // ✅ Add this
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const isAuthenticated = !!token;

  const refreshAuth = async () => {
    const [storedToken, storedUsername] = await Promise.all([
      AsyncStorage.getItem('jwtToken'),
      AsyncStorage.getItem('username'),
    ]);
    setToken(storedToken);
    setUsername(storedUsername);
  };

  const login = async (newToken: string, newUsername: string) => {
    await AsyncStorage.multiSet([
      ['jwtToken', newToken],
      ['username', newUsername],
    ]);
    setToken(newToken);
    setUsername(newUsername);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(['jwtToken', 'username']);
    setToken(null);
    setUsername(null);
  };

  useEffect(() => {
    void refreshAuth();
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    token,
    username,
    login,
    logout,
    refreshAuth, // ✅ Include it in context value
  }), [token, username]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
