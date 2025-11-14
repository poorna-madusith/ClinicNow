"use client";

import { Booking } from "@/types/Booking";
import axios from "axios";
import { useEffect, useState } from "react";
import { Patient } from "@/types/Patient";
import toast from "react-hot-toast";

interface PatientSessionsModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  accessToken: string;
}

type BookingStatus = "All" | "Scheduled" | "Ongoing" | "Completed";

export default function PatientSessionsModal({
  patient,
  isOpen,
  onClose,
  accessToken,
}: PatientSessionsModalProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BookingStatus>("Scheduled");
  const [dateFilter, setDateFilter] = useState("");
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/admin/getbookingsforpatient/${patient.id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setBookings(response.data || []);
    } catch {
      toast.error("Failed to fetch bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && patient.id) {
      fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, patient.id]);

  const applyFilters = () => {
    let result = [...bookings];

    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter((booking) => {
        const session = booking.session;
        if (!session) return false;

        switch (statusFilter) {
          case "Scheduled":
            return !session.canceled && !session.completed && !booking.onGoing && !booking.completed;
          case "Ongoing":
            return booking.onGoing && !booking.completed;
          case "Completed":
            return booking.completed;
          default:
            return true;
        }
      });
    }

    // Apply date filter
    if (dateFilter) {
      result = result.filter((booking) => {
        if (!booking.session) return false;
        const sessionDate = new Date(booking.session.date)
          .toISOString()
          .split("T")[0];
        return sessionDate === dateFilter;
      });
    }

    setFilteredBookings(result);
  };

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, statusFilter, dateFilter]);

  const getStatusBadge = (booking: Booking) => {
    const session = booking.session;
    if (!session) return null;

    if (session.canceled) {
      return (
        <span className="inline-flex px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          Cancelled
        </span>
      );
    }
    if (booking.completed) {
      return (
        <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          Completed
        </span>
      );
    }
    if (booking.onGoing) {
      return (
        <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          Ongoing
        </span>
      );
    }
    return (
      <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        Scheduled
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto h-full w-full flex items-start justify-center p-4 animate-in fade-in duration-300">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl my-4 overflow-hidden animate-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Bookings for {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-teal-100 text-sm">{patient.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
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
        </div>

        {/* Filters */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as BookingStatus)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white text-gray-700"
              >
                <option value="All">All Bookings</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-white text-gray-700"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-teal-600">
                {filteredBookings.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-teal-600">
                {bookings.length}
              </span>{" "}
              booking{bookings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Bookings Found
              </h3>
              <p className="text-gray-600">
                {dateFilter || statusFilter !== "All"
                  ? "Try adjusting your filters"
                  : "This patient has no bookings yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-40">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-36">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-64">
                      Doctor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-48">
                      Description
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-32">
                      Fee
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-24">
                      Queue
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 w-32">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking.id}
                      className={`hover:bg-teal-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {booking.session && formatDate(booking.session.date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {booking.session &&
                            `${formatTime(booking.session.startTime)} - ${formatTime(
                              booking.session.endTime
                            )}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-800">
                          <div className="font-medium">
                            {booking.session?.doctorName || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 truncate" title={booking.session?.description}>
                          {booking.session?.description || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-800">
                          {booking.session && `LKR ${booking.session.sessionFee.toFixed(2)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          #{booking.positionInQueue}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(booking)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
