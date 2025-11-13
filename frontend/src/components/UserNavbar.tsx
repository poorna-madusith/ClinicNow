"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";

const userLinks = [
    { label: "Dashboard", href: "/UserDashboard" },
    { label: "My Appointments", href: "/MyAppoinments" },
    { label: "Chat", href: "/UserChat" },
    { label: "Profile", href: "/UserProfile" },
];

const UserNavbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    if (pathname === "/Login" || pathname === "/UserSignup") {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push("/Login");
    };

    return (
        <nav className="bg-gradient-to-r from-white via-teal-50 to-white backdrop-blur-lg shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
            <div className="w-full px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between items-center h-16 sm:h-20">
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                            <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                <span className="text-xl sm:text-2xl" role="img" aria-label="hospital">🏥</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg sm:text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent tracking-tight">
                                    ClinicNow
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-wide hidden sm:block">
                                    Healthcare Management
                                </span>
                            </div>
                        </Link>
                    </div>

                    <div className="hidden lg:flex lg:items-center lg:space-x-2 absolute left-1/2 transform -translate-x-1/2">
                        {userLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                                    pathname === link.href
                                        ? "text-teal-600 bg-teal-50 shadow-sm"
                                        : "text-gray-600 hover:text-teal-600 hover:bg-teal-50/50"
                                }`}
                            >
                                {link.label}
                                {pathname === link.href && (
                                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-teal-600 to-transparent rounded-full"></span>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handleLogout}
                            className="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10">Logout</span>
                            <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                        </button>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-all duration-300"
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {mobileMenuOpen && (
                    <div className="lg:hidden pb-4 pt-2 space-y-1 animate-in slide-in-from-top">
                        {userLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${
                                    pathname === link.href
                                        ? "text-teal-600 bg-teal-50 shadow-sm"
                                        : "text-gray-600 hover:text-teal-600 hover:bg-teal-50/50"
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default UserNavbar;
