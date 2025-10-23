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
          {doctors.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Total Doctors: <span className="font-semibold text-teal-600">{doctors.length}</span>
            </p>
          )}
        </div>

        {/* Doctors Table */}
        {doctors.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Doctor</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Specialization</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Age</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Contact Email</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {doctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="hover:bg-teal-50 transition-colors duration-150"
                    >
                      {/* Doctor Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100 flex-shrink-0">
                            {doctor.profileImageUrl ? (
                              <Image
                                src={doctor.profileImageUrl}
                                alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg font-bold text-teal-600">
                                {doctor.firstName?.[0]}
                                {doctor.lastName?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="font-semibold text-gray-800">
                              Dr. {doctor.firstName} {doctor.lastName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Specialization */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
                          {doctor.specialization || "N/A"}
                        </span>
                      </td>

                      {/* Age */}
                      <td className="px-6 py-4 text-gray-700">
                        {doctor.age || "N/A"}
                      </td>

                      {/* Contact Email */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {doctor.contactEmail || "No email"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        >
                          <svg
                            className="w-4 h-4"
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
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
