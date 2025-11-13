"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import Image from "next/image";

const userLinks = [
    { label: "Dashboard", href: "/UserDashboard" },
    { label: "My Appointments", href: "/MyAppoinments" },
    { label: "Chat", href: "/UserChat" },
];

const UserNavbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const pathname = usePathname();
    const { logout } = useAuth();

    // Close profile menu when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
          setProfileMenuOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                            <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                                <Image 
                                    src="/logo.png" 
                                    alt="ClinicNow Logo" 
                                    fill
                                    className="object-contain p-1.5 sm:p-2"
                                    priority
                                />
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
                        {/* Profile Menu */}
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md hover:shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                aria-label="Profile menu"
                            >
                                <User className="h-5 w-5" />
                            </button>

                            {/* Dropdown Menu */}
                            {profileMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Link
                                        href="/UserProfile"
                                        onClick={() => setProfileMenuOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors duration-200"
                                    >
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">Profile</span>
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span className="font-medium">Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>

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
