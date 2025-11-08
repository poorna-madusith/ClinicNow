"use client";

import { useAuth } from "@/Context/AuthContext";
import { Doctor } from "@/types/Doctor";
import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import DoctorFullView from "@/components/DoctorFullView";
import FeedbackForm from "@/components/FeedbackForm";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function UserDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackDoctor, setFeedbackDoctor] = useState<{ id: string; name: string } | null>(null);
  const { accessToken } = useAuth();
  const router = useRouter();
  const [selectSpecialization, setSelectSpecialization] = useState("All");
  const [search, setSearch] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);

  const specializations = [
    "All",
    ...new Set(doctors.map((doc) => doc.specialization)),
  ];

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
      setFilteredDoctors(res.data || []);
    } catch (err) {
      console.log("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [API, accessToken]);

  useEffect(() => {
    let result = doctors;

    if (selectSpecialization !== "All") {
      result = result.filter(
        (doc) => doc.specialization === selectSpecialization
      );
    }

    if (search.trim() !== "") {
      result = result.filter(
        (doc) =>
          doc.firstName
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          doc.lastName.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      );
    }
    setFilteredDoctors(result);
  }, [doctors, search, selectSpecialization]);

  useEffect(() => {
    if (accessToken) {
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


  const handleBookingClick = (id: string) => {
    router.push(`/subpages/SessionsForADoc/${id}`); 
  }

  const handleFeedbackClick = (doctor: Doctor) => {
    setFeedbackDoctor({
      id: doctor.id,
      name: `${doctor.firstName} ${doctor.lastName}`
    });
    setIsFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setFeedbackDoctor(null);
  };

  return (
    <ProtectedRoute allowedRoles={["Patient"]}>
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

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search doctors by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="h-5 w-5"
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
                )}
              </div>

              {/* Specialization Dropdown */}
              <div className="md:w-64">
                <select
                  value={selectSpecialization}
                  onChange={(e) => setSelectSpecialization(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 outline-none bg-white cursor-pointer"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec === "All" ? "All Specializations" : spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Summary */}
            {(search || selectSpecialization !== "All") && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <p className="text-gray-600">
                  Showing {filteredDoctors.length} of {doctors.length} doctors
                  {search && ` matching "${search}"`}
                  {selectSpecialization !== "All" && ` in ${selectSpecialization}`}
                </p>
                {(search || selectSpecialization !== "All") && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setSelectSpecialization("All");
                    }}
                    className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    <svg
                      className="h-4 w-4"
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
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Doctors Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-teal-500 w-1.5 h-8 rounded-full mr-3"></span>
              Available Doctors
              <span className="ml-3 text-sm font-normal text-gray-500">
                ({filteredDoctors.length} {filteredDoctors.length === 1 ? 'doctor' : 'doctors'} {search || selectSpecialization !== "All" ? 'found' : 'available'})
              </span>
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg">
                  {doctors.length === 0 
                    ? "No doctors available at the moment." 
                    : "No doctors found matching your search criteria."}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {doctors.length === 0 
                    ? "Please check back later." 
                    : "Try adjusting your filters or search terms."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {filteredDoctors.map((doctor: Doctor) => (
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
                          <div className="flex gap-3 mb-3">
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
                            <button onClick={()=> handleBookingClick(doctor.id)} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm transform hover:scale-105">
                              Book Now
                            </button>
                          </div>
                          <button
                            onClick={() => handleFeedbackClick(doctor)}
                            className="w-full flex items-center justify-center text-sm text-amber-600 hover:text-white border-2 border-amber-500 hover:bg-amber-500 font-semibold py-2.5 px-4 rounded-lg transition-all duration-300"
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
                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                              />
                            </svg>
                            Give Feedback
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
      {feedbackDoctor && (
        <FeedbackForm
          isOpen={isFeedbackOpen}
          onClose={handleCloseFeedback}
          doctorId={feedbackDoctor.id}
          doctorName={feedbackDoctor.name}
        />
      )}
      </>
    </ProtectedRoute>
  );
}
