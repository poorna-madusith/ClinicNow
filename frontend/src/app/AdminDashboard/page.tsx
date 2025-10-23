'use client';

import { useAuth } from "@/Context/AuthContext";
import { Doctor } from "@/types/Doctor";
import DoctorFullView from "@/components/DoctorFullView";
import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get(`${API}/admin/getalldoctors`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setDoctors(res.data || []);
        console.log("Doctors:", res.data);
      } catch (err) {
        console.log("Error fetching doctors:", err);
        setDoctors([]);
      }
    };

    if (accessToken) {
      fetchDoctors();
    }
  }, [accessToken, API]);

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage and view all registered doctors</p>
        </div>

        {/* Doctors Grid */}
        {doctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200 transform hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Doctor Avatar */}
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 flex-shrink-0">
                      {doctor.profileImageUrl ? (
                        <Image
                          src={doctor.profileImageUrl}
                          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-teal-600">
                          {doctor.firstName?.[0]}
                          {doctor.lastName?.[0]}
                        </div>
                      )}
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-sm text-teal-600 font-medium truncate">
                          {doctor.specialization}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Doctor Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <svg
                        className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-600">
                        Age: <span className="font-semibold text-gray-800">{doctor.age || "N/A"}</span>
                      </span>
                    </div>

                    <div className="flex items-start text-sm">
                      <svg
                        className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0 mt-0.5"
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
                      <span className="text-gray-600 break-all">
                        {doctor.contactEmail || "No email"}
                      </span>
                    </div>
                  </div>

                  {/* View Full Button */}
                  <button
                    onClick={() => handleViewDoctor(doctor)}
                    className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Doctors Found</h3>
            <p className="text-gray-500">There are no registered doctors at the moment.</p>
          </div>
        )}
      </div>

      {/* Doctor Full View Modal */}
      <DoctorFullView
        isModalOpen={isModalOpen}
        onClose={handleCloseModal}
        doctor={selectedDoctor}
      />
    </div>
  );
}
