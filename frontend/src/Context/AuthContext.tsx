'use client'

import { createContext, ReactNode, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  sub: string;   // usually userId
  role?: string;
  exp?: number;  // expiration timestamp
  id?: string;   // extracted user id
  [key: string]: unknown;
}

interface AuthContextType {
  accessToken: string | null;
  decodedToken: DecodedToken | null;
  userId: string | null;
  setAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const setAccessToken = (token: string | null) => {
    setAccessTokenState(token);

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);

        // Support both `role` and Microsoft claim format
        const decodedObj = decoded as Record<string, unknown>;
        const roleClaim =
          decodedObj["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] as string ||
          decodedObj.role as string ||
          null;

        // Extract user id from 'sub' or 'id' claim
        const idClaim = decodedObj.id as string || decodedObj.sub as string || null;

        const properDecoded: DecodedToken = {
          ...decoded,
          ...(typeof roleClaim === "string" ? { role: roleClaim } : {}),
          ...(typeof idClaim === "string" ? { id: idClaim } : {}),
        };

        setDecodedToken(properDecoded);
        setUserId(idClaim);
      } catch (e) {
        console.error("Invalid token", e);
        setDecodedToken(null);
        setUserId(null);
      }
    } else {
      setDecodedToken(null);
      setUserId(null);
    }
  };

  return (
    <AuthContext.Provider value={{ accessToken, decodedToken, userId, setAccessToken }}>
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
