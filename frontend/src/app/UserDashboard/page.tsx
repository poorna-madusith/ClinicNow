"use client";

import { useAuth } from "@/Context/AuthContext";
import { Doctor } from "@/types/Doctor";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Image from "next/image";

export default function UserDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
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
            <span className="bg-blue-500 w-1.5 h-8 rounded-full mr-3"></span>
            Available Doctors
            <span className="ml-3 text-sm font-normal text-gray-500">
              ({doctors.length} {doctors.length === 1 ? 'doctor' : 'doctors'} available)
            </span>
          </h2>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor: Doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                >
                  {/* Profile Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500">
                    {doctor.profileImageUrl ? (
                      <Image
                        src={doctor.profileImageUrl}
                        alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-blue-500">
                          {doctor.firstName?.[0]}{doctor.lastName?.[0]}
                        </div>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
                      <span className="text-xs font-semibold text-blue-600">
                        {doctor.gender || 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Doctor Information */}
                  <div className="p-6">
                    {/* Name and Specialization */}
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      {doctor.specialization && (
                        <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">
                          {doctor.specialization}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {doctor.docDescription && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {doctor.docDescription}
                      </p>
                    )}

                    {/* Details Grid */}
                    <div className="space-y-3 mb-4">
                      {doctor.age && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">Age:</span>
                          <span className="text-gray-700 font-medium">
                            {doctor.age} years
                          </span>
                        </div>
                      )}

                      {doctor.town && (
                        <div className="flex items-center text-sm">
                          <span className="text-gray-500 w-20">Location:</span>
                          <span className="text-gray-700 font-medium">
                            {doctor.town}
                          </span>
                        </div>
                      )}

                      {doctor.address && (
                        <div className="flex items-start text-sm">
                          <span className="text-gray-500 w-20 flex-shrink-0">
                            Address:
                          </span>
                          <span className="text-gray-700 font-medium">
                            {doctor.address}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contact Information */}
                    <div className="border-t pt-4 space-y-2">
                      {doctor.contactEmail && (
                        <div className="flex items-center text-sm">
                          <svg
                            className="w-4 h-4 mr-2 text-blue-500"
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
                            className="text-blue-600 hover:text-blue-800 hover:underline truncate"
                          >
                            {doctor.contactEmail}
                          </a>
                        </div>
                      )}

                      {doctor.contactNumbers &&
                        doctor.contactNumbers.length > 0 && (
                          <div className="flex items-start text-sm">
                            <svg
                              className="w-4 h-4 mr-2 text-green-500 mt-0.5"
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
                            <div className="flex flex-col">
                              {doctor.contactNumbers.map((number, index) => (
                                <a
                                  key={index}
                                  href={`tel:${number}`}
                                  className="text-green-600 hover:text-green-800 hover:underline"
                                >
                                  {number}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Action Button */}
                    <button className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg">
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
