"use client";

import { useAuth } from "@/Context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, userRole, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (accessToken == null && !isAuthenticated) {
      return;
    }

    if (!isAuthenticated || !accessToken) {
      router.push("/Login");
    }

    if (allowedRoles && allowedRoles.length > 0 && userRole) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect based on user role
        switch (userRole) {
          case "Admin":
            router.push("/AdminDashboard");
            break;
          case "Doctor":
            router.push("/DocotorDashboard");
            break;
          case "Patient":
            router.push("/UserDashboard");
            break;
          default:
            router.push("/Login");
        }
      }
    }
  }, [isAuthenticated, userRole, router, allowedRoles, pathname, accessToken]);

  if (accessToken === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // If roles are specified and user doesn't have required role, don't render
  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    userRole &&
    !allowedRoles.includes(userRole)
  ) {
    return null;
  }

  return <>{children}</>;
}
