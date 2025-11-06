"use client";
import { useAuth } from "@/Context/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {

    const router = useRouter(); 
    const pathname = usePathname();
    const { userRole, logout } = useAuth();

    const adminLinks = [
    { label: "Dashboard", href: "/AdminDashboard" },
    { label: "Manage Users", href: "/admin/users" },
    { label: "Reports", href: "/admin/reports" },
  ];

  const doctorLinks = [
    { label: "Dashboard", href: "/DocotorDashboard" },
    { label: "OnGoing Session", href: "/DocOngoingSessions" },
    { label: "Patients", href: "/doctor/patients" },
  ];

  const patientLinks = [
    { label: "Dashboard", href: "/UserDashboard" },
    { label: "My Appointments", href: "/MyAppoinments" },
    { label: "Profile", href: "/UserProfile" },
  ];

  let navlinks: { label: string; href: string }[] = [];

  if(userRole === "Admin") navlinks = adminLinks;
  else if(userRole === "Doctor") navlinks = doctorLinks;
  else if(userRole === "Patient") navlinks = patientLinks;

  const handleLogout = () => {
    logout();
    router.push("/Login");
  };

  if(pathname === "/Login" || pathname === "/UserSignup"){
    return null;
  }

  return (
    <nav className="bg-gradient-to-r from-white via-teal-50 to-white backdrop-blur-lg shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section - Left Corner */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2.5 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <span className="text-2xl" role="img" aria-label="hospital">🏥</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent tracking-tight">
                  ClinicNow
                </span>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  Healthcare Management
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex md:items-center md:space-x-2 absolute left-1/2 transform -translate-x-1/2">
            {navlinks.map((link) => (
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

          {/* Logout Button - Right Corner */}
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="relative overflow-hidden bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              <span className="relative z-10">Logout</span>
              <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}