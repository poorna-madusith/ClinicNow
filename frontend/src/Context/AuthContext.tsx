'use client'

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface DecodedToken {
  sub: string;
  role?: string;
  exp?: number;
  id?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  accessToken: string | null;
  isAuthenticated: boolean;
  decodedToken: DecodedToken | null;
  userId: string | null;
  userRole: string | null;
  setAccessToken: (token: string | null) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const parseToken = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const decodedObj = decoded as Record<string, unknown>;
      
      const roleClaim =
        decodedObj["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string ||
        decodedObj.role as string ||
        null;

      const idClaim = decodedObj.id as string || decodedObj.sub as string || null;

      setDecodedToken(decoded);
      setUserId(idClaim);
      setUserRole(roleClaim);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Invalid token:", error);
      setDecodedToken(null);
      setUserId(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  };

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);
    
    if (token) {
      parseToken(token);
    } else {
      setDecodedToken(null);
      setUserId(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  };

  // Check authentication status with server using refresh token
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/verify`, {
        withCredentials: true // This sends HTTP-only cookies
      });

      if (response.data.success && response.data.token) {
        setAccessTokenState(response.data.token);
        parseToken(response.data.token);
      } else {
        setAccessToken(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAccessToken(null);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
    }
  };

  // Initialize authentication check
  useEffect(() => {
    checkAuth().finally(() => setIsInitialized(true));
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      accessToken,
      isAuthenticated, 
      decodedToken, 
      userId, 
      userRole, 
      setAccessToken,
      logout, 
      checkAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};