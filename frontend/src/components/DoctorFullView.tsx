"use client";

import { useAuth } from "@/Context/AuthContext";
import { Doctor } from "@/types/Doctor";
import Image from "next/image";
import { useRouter } from "next/navigation";


interface DoctorFullViewProps {
  isModalOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}



export default function DoctorFullView({
  isModalOpen,
  onClose,
  doctor,
}: DoctorFullViewProps) {
  const router = useRouter();
  const {userRole} = useAuth();
  const role = userRole;

  if (!isModalOpen || !doctor) {
    return null;
  }

  const handleBookingClick = (id: string) => {
    router.push(`/subpages/SessionsForADoc/${id}`); 
  }
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-2 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Gradient Background */}
        <div className="relative p-4 sm:p-6 lg:p-8 pb-16 sm:pb-20 lg:pb-24 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 overflow-visible">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
          
          <div className="relative flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 w-full sm:w-auto">
              {/* Profile Image */}
              <div className="relative -mb-12 sm:-mb-16 lg:-mb-20">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-xl"></div>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl ring-4 ring-white/20">
                  {doctor.profileImageUrl ? (
                    <Image
                      src={doctor.profileImageUrl}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-100 to-cyan-100 text-3xl sm:text-4xl lg:text-5xl font-bold text-teal-700">
                      {doctor.firstName?.[0]}
                      {doctor.lastName?.[0]}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Doctor Info */}
              <div className="text-white text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 drop-shadow-lg">
                  Dr. {doctor.firstName} {doctor.lastName}
                </h2>
                {doctor.specialization && (
                  <div className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                    </svg>
                    <span className="text-xs sm:text-sm font-semibold uppercase tracking-wider">
                      {doctor.specialization}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:relative sm:top-0 sm:right-0 z-10 p-2 sm:p-2.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200 hover:rotate-90 hover:scale-110"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 lg:p-8 pt-16 sm:pt-20 lg:pt-24 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
          {/* About Section */}
          {doctor.docDescription && (
            <div className="mb-6 sm:mb-8 group">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 shadow-md">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 ml-2 sm:ml-3">About</h3>
              </div>
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                  {doctor.docDescription}
                </p>
              </div>
            </div>
          )}

          {/* Details Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center mb-3 sm:mb-4">
              <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 ml-2 sm:ml-3">Details</h3>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex items-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 hover:shadow-sm transition-shadow">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Age</p>
                    <p className="text-lg text-gray-800 font-semibold">
                      {doctor.age ? `${doctor.age} years` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 hover:shadow-sm transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Gender</p>
                    <p className="text-lg text-gray-800 font-semibold">
                      {doctor.gender || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50 hover:shadow-sm transition-shadow md:col-span-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">Address</p>
                    <p className="text-base text-gray-800 font-medium">
                      {doctor.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div>
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 ml-3">Contact Information</h3>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center p-4 rounded-lg bg-gradient-to-r from-teal-50 to-cyan-50 hover:shadow-sm transition-all duration-200 group">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-teal-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-0.5">Contact Email</p>
                  <a
                    href={`mailto:${doctor.contactEmail || doctor.email}`}
                    className="text-teal-600 hover:text-teal-700 font-medium hover:underline text-base"
                  >
                    {doctor.contactEmail || doctor.email}
                  </a>
                </div>
              </div>
              {doctor.contactNumbers && doctor.contactNumbers.length > 0 && (
                <div className="flex items-start p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:shadow-sm transition-all duration-200 group">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Phone</p>
                    <div className="flex flex-col space-y-1">
                      {doctor.contactNumbers.map((number, index) => (
                        <a
                          key={index}
                          href={`tel:${number}`}
                          className="text-green-600 hover:text-green-700 font-medium hover:underline text-base"
                        >
                          {number}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 font-medium bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
          >
            Close
          </button>
          {role !== "Admin" && (<button className="px-6 py-3 text-white font-medium bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
            onClick={() => handleBookingClick(doctor.id)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Appointment
          </button>)}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}