"use client";

import { Doctor } from "@/types/Doctor";
import Image from "next/image";

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
  if (!isModalOpen || !doctor) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
              {doctor.profileImageUrl ? (
                <Image
                  src={doctor.profileImageUrl}
                  alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-4xl font-bold text-blue-500">
                  {doctor.firstName?.[0]}
                  {doctor.lastName?.[0]}
                </div>
              )}
            </div>
            <div className="ml-5">
              <h2 className="text-3xl font-bold text-gray-800">
                Dr. {doctor.firstName} {doctor.lastName}
              </h2>
              {doctor.specialization && (
                <p className="text-blue-600 font-semibold text-md uppercase tracking-wider mt-1">
                  {doctor.specialization}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
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
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto">
          {doctor.docDescription && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-2 border-l-4 border-blue-500 pl-3">
                About
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {doctor.docDescription}
              </p>
            </div>
          )}

          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
            Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex items-center">
              <span className="text-gray-500 w-28">Age:</span>
              <span className="text-gray-800 font-medium">
                {doctor.age ? `${doctor.age} years` : "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 w-28">Gender:</span>
              <span className="text-gray-800 font-medium">
                {doctor.gender || "N/A"}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-500 w-28">Location:</span>
              <span className="text-gray-800 font-medium">
                {doctor.town || "N/A"}
              </span>
            </div>
            <div className="flex items-start col-span-1 md:col-span-2">
              <span className="text-gray-500 w-28 flex-shrink-0">
                Address:
              </span>
              <span className="text-gray-800 font-medium">
                {doctor.address || "N/A"}
              </span>
            </div>
          </div>

          <div className="border-t my-8"></div>

          <h3 className="text-lg font-semibold text-gray-700 mb-4 border-l-4 border-blue-500 pl-3">
            Contact Information
          </h3>
          <div className="space-y-4">
            {doctor.contactEmail && (
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-3 text-blue-500"
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
                <a
                  href={`mailto:${doctor.contactEmail}`}
                  className="text-blue-600 hover:underline"
                >
                  {doctor.contactEmail}
                </a>
              </div>
            )}
            {doctor.contactNumbers && doctor.contactNumbers.length > 0 && (
              <div className="flex items-start">
                <svg
                  className="w-5 h-5 mr-3 text-green-500 mt-0.5"
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
                <div className="flex flex-col space-y-1">
                  {doctor.contactNumbers.map((number, index) => (
                    <a
                      key={index}
                      href={`tel:${number}`}
                      className="text-green-600 hover:underline"
                    >
                      {number}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t rounded-b-2xl flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button className="px-6 py-2.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Book Appointment
          </button>
        </div>
      </div>
      <style jsx>{`
        @keyframes fade-in-scale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}