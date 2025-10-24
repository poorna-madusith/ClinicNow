"use client";

import { useAuth } from "@/Context/AuthContext";
import { Doctor } from "@/types/Doctor";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import DoctorFullView from "@/components/DoctorFullView";

export default function UserDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { accessToken } = useAuth();

  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/usersession/getalldoctors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDoctors(res.data || []);
    } catch (err) {
      console.log("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [API, accessToken]);

  useEffect(() => {
    if (accessToken) {
      console.log("Fetching doctors with access token:", accessToken);
      fetchDoctors();
    }
  }, [accessToken, fetchDoctors]);

  const handleViewMore = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Welcome to ClinicNow
            </h1>
            <p className="text-gray-600 text-lg">
              Find and connect with our experienced healthcare professionals
            </p>
          </div>

          {/* Doctors Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-teal-500 w-1.5 h-8 rounded-full mr-3"></span>
              Available Doctors
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} available)
              </span>
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              </div>
            ) : doctors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🏥</div>
                <p className="text-gray-500 text-lg">
                  No doctors available at the moment.
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Please check back later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {doctors.map((doctor: Doctor) => (
                  <div
                    key={doctor.id}
                    className="relative pt-24 group"
                  >
                    {/* Circular Profile Image - Outside Card */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="relative">
                        {/* Decorative ring */}
                        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full transform scale-110 opacity-20 group-hover:scale-115 transition-transform duration-300"></div>
                        
                        {/* Main image container */}
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-300">
                          {doctor.profileImageUrl ? (
                            <Image
                              src={doctor.profileImageUrl}
                              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-cyan-500">
                              <span className="text-5xl font-bold text-white">
                                {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Gender badge */}
                        <div className="absolute bottom-2 right-2 bg-white px-3 py-1.5 rounded-full shadow-lg border-2 border-teal-100">
                          <span className="text-xs font-bold text-teal-700">
                            {doctor.gender || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-teal-200 flex flex-col overflow-hidden">
                      {/* Doctor Information */}
                      <div className="pt-20 pb-6 px-6 flex-grow flex flex-col">
                        {/* Name and Specialization */}
                        <div className="mb-6 text-center">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          {doctor.specialization && (
                            <div className="inline-block bg-gradient-to-r from-teal-50 to-cyan-50 px-4 py-2 rounded-full border border-teal-200">
                              <p className="text-teal-700 font-semibold text-sm uppercase tracking-wider">
                                {doctor.specialization}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-3 mb-6 text-center">
                          {doctor.town && (
                            <div className="flex items-center justify-center text-sm bg-gray-50 py-2 px-4 rounded-lg">
                              <svg className="w-5 h-5 mr-2 text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700 font-medium">
                                {doctor.town}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Spacer */}
                        <div className="flex-grow"></div>

                        {/* Actions */}
                        <div className="border-t border-gray-100 pt-5 mt-auto">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleViewMore(doctor)}
                              className="flex-1 flex items-center justify-center text-sm text-teal-600 hover:text-white border-2 border-teal-500 hover:bg-teal-500 font-semibold py-2.5 px-4 rounded-lg transition-all duration-300"
                            >
                              <svg
                                className="w-5 h-5 mr-1.5"
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
                              View Details
                            </button>
                            <button className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm transform hover:scale-105">
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <DoctorFullView
        isModalOpen={isModalOpen}
        onClose={handleCloseModal}
        doctor={selectedDoctor}
      />
    </>
  );
}
