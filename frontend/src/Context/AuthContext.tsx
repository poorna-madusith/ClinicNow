'use client'

import { createContext, ReactNode, useContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { setupApiClient } from "@/Lib/api";

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

  const parseToken = useCallback((token: string) => {
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
  }, []);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    
    // Sync token with API client
    setupApiClient(token, setAccessTokenState);
    
    if (token) {
      parseToken(token);
    } else {
      setDecodedToken(null);
      setUserId(null);
      setUserRole(null);
      setIsAuthenticated(false);
    }
  }, [parseToken]);

  // Check authentication status with server using refresh token
  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(`${API}/auth/verify`, {
        withCredentials: true // This sends HTTP-only cookies
      });

      if (response.data.success && response.data.token) {
        setAccessTokenState(response.data.token);
        parseToken(response.data.token);
      } else {
        setAccessToken(null);
        // Redirect to login if token verification fails
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/Login', '/UserSignup', '/ForgotPassword', '/reset-password'];
          if (!publicPaths.some(path => currentPath.includes(path))) {
            window.location.href = '/Login';
          }
        }
      }
    } catch (error) {
      // Auth check failed - redirect to login
      console.log('Auth verification failed');
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const publicPaths = ['/Login', '/UserSignup', '/ForgotPassword', '/reset-password'];
        if (!publicPaths.some(path => currentPath.includes(path))) {
          window.location.href = '/Login';
        }
      }
    }
  }, [API, parseToken, setAccessToken]);

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, {
        withCredentials: true
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setAccessToken(null);
      // Clear any stored data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login
        window.location.href = '/Login';
      }
    }
  };

  // Initialize authentication check: skip for public pages (Login, UserSignup, ForgotPassword, reset-password)
  useEffect(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const publicPaths = ['/Login', '/UserSignup', '/ForgotPassword', '/reset-password'];

    if (publicPaths.includes(pathname)) {
      setIsInitialized(true);
    } else {
      checkAuth().finally(() => setIsInitialized(true));
    }
  }, [checkAuth]);

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