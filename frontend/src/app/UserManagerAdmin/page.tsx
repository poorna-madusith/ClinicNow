"use client";

import { useAuth } from "@/Context/AuthContext";
import { Patient, Gender } from "@/types/Patient";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import DeleteButton from "@/components/DeleteButton";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ManageUsers() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();

  const fetchPatients = useCallback(async () => {
    if (!accessToken) return;
    
    setIsLoading(true);
    try {
      const res = await axios.get(`${API}/admin/getallpatients`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setPatients(res.data);
      setFilteredPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients", err);
      toast.error("Failed to fetch patients");
    } finally {
      setIsLoading(false);
    }
  }, [API, accessToken]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
          patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
          patient.email.toLowerCase().includes(search.toLowerCase()) ||
          (patient.town && patient.town.toLowerCase().includes(search.toLowerCase()))
      );
      setFilteredPatients(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [search, patients]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (patientId: string) => {
    try {
      await axios.delete(`${API}/admin/deletepatient/${patientId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Patient deleted successfully");
      fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient", err);
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message 
        ? err.response.data.message 
        : "Failed to delete patient";
      toast.error(errorMessage);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 p-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-teal-800 mb-2">
              Manage Users - Patients
            </h1>
            <p className="text-gray-600">
              View and manage all registered patients in the system
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by name, email, or town..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-teal-600">
                  {patients.length}
                </p>
              </div>
              <div className="bg-teal-100 p-4 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-teal-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <>
              {/* Patients Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Age
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Gender
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Town
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Address
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Contact Number
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentPatients.length === 0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            {search.trim() === ""
                              ? "No patients found"
                              : "No patients match your search"}
                          </td>
                        </tr>
                      ) : (
                        currentPatients.map((patient, index) => (
                          <tr
                            key={patient.id}
                            className={`hover:bg-teal-50 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white font-semibold">
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {patient.firstName} {patient.lastName}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {patient.email}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {patient.age || "N/A"}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  patient.gender === Gender.Male
                                    ? "bg-blue-100 text-blue-700"
                                    : patient.gender === Gender.Female
                                    ? "bg-pink-100 text-pink-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {patient.gender || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {patient.town || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              <div className="max-w-xs truncate" title={patient.address || "N/A"}>
                                {patient.address || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              {patient.contactNumbers && patient.contactNumbers.length > 0 ? (
                                <div className="space-y-1">
                                  {patient.contactNumbers.map((number, idx) => (
                                    <div key={idx} className="text-sm">
                                      {number}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                "N/A"
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center space-x-2">
                                <DeleteButton
                                  onDelete={() => handleDeleteClick(patient.id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination and Results Info */}
              {filteredPatients.length > 0 && (
                <div className="mt-6 space-y-4">
                  {/* Results Info */}
                  <div className="text-center text-gray-600">
                    Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPatients.length)} of {filteredPatients.length} patients
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2">
                      {/* Previous Button */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-teal-500 text-white hover:bg-teal-600"
                        }`}
                      >
                        Previous
                      </button>

                      {/* Page Numbers */}
                      <div className="flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                          // Show first page, last page, current page, and pages around current
                          const showPage =
                            pageNumber === 1 ||
                            pageNumber === totalPages ||
                            (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);

                          // Show ellipsis
                          const showEllipsisBefore = pageNumber === currentPage - 2 && currentPage > 3;
                          const showEllipsisAfter = pageNumber === currentPage + 2 && currentPage < totalPages - 2;

                          if (showEllipsisBefore || showEllipsisAfter) {
                            return (
                              <span key={pageNumber} className="px-3 py-2 text-gray-400">
                                ...
                              </span>
                            );
                          }

                          if (!showPage) return null;

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                currentPage === pageNumber
                                  ? "bg-teal-600 text-white shadow-lg"
                                  : "bg-white text-teal-600 hover:bg-teal-50 border border-teal-200"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                      </div>

                      {/* Next Button */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === totalPages
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-teal-500 text-white hover:bg-teal-600"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
