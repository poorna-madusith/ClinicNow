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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {doctors.map((doctor: Doctor) => (
                  <div
                    key={doctor.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-transparent hover:border-teal-200 flex flex-col group"
                  >
                    {/* Profile Image Section */}
                    <div className="relative h-52">
                      {doctor.profileImageUrl ? (
                        <Image
                          src={doctor.profileImageUrl}
                          alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100">
                          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-5xl font-bold text-teal-500 shadow-inner">
                            {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow">
                        <span className="text-xs font-semibold text-teal-700">
                          {doctor.gender || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Doctor Information */}
                    <div className="p-6 flex-grow flex flex-col">
                      {/* Name and Specialization */}
                      <div className="mb-4 text-center">
                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        {doctor.specialization && (
                          <p className="text-teal-600 font-semibold text-sm uppercase tracking-wider">
                            {doctor.specialization}
                          </p>
                        )}
                      </div>

                      {/* Details Grid */}
                      <div className="space-y-3 mb-5 text-center">
                        {doctor.town && (
                          <div className="flex items-center justify-center text-sm">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                            <span className="text-gray-600 font-medium">
                              {doctor.town}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Spacer to push content to bottom */}
                      <div className="flex-grow"></div>

                      {/* Contact and Action */}
                      <div className="border-t border-gray-100 pt-4 mt-auto">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => handleViewMore(doctor)}
                            className="flex items-center text-sm text-teal-600 hover:text-teal-800 font-semibold group-hover:underline"
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
                            More Info
                          </button>
                          <button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm transform hover:scale-105">
                            Book Now
                          </button>
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
