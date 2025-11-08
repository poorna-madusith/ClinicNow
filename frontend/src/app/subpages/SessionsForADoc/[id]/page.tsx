"use client";

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";
import axios from "axios";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import UserSessionBooking from "@/components/UserSessionBooking";
import ProtectedRoute from "@/components/ProtectedRoute";

interface sessionPageProps {
  params: Promise<{ id: string }>;
}

export default function SessionsForADoc({ params }: sessionPageProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("");
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const { id } = use(params);
  const router = useRouter();
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [date, setDate] = useState<string>("");
  const [canceledButton, setCanceledButton] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [bookingSession, setBookingSession] = useState<Session | null>(null);
  const [BookingSessionModalIsOpen, setBookingSessionModalIsOpen] =
    useState<boolean>(false);
  const sessionsPerPage = 6;

  const handleSessionBookingOnClose = () => {
    setBookingSession(null);
    setBookingSessionModalIsOpen(false);
  };

  const handleBookingSuccess = () => {
    // Refetch sessions after successful booking
    fetchSessions();
  };

  useEffect(() => {
    let result = sessions;

    // Filter by canceled status
    if (canceledButton) {
      result = result.filter((session) => session.canceled);
    } else {
      result = result.filter(
        (sessions: Session) => !sessions.canceled && !sessions.completed && !sessions.ongoing
      );
    }

    // Filter by date
    if (date) {
      result = result.filter((session) => session.date.includes(date));
    }

    setFilteredSessions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [date, sessions, canceledButton]);

  const handleCanceledButton = () => {
    setCanceledButton(!canceledButton);
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/usersession/getsessionsfordoctor/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSessions(res.data);
      setFilteredSessions(res.data);

      // Extract doctor name from first session if available
      if (res.data && res.data.length > 0 && res.data[0].doctor) {
        const doctor = res.data[0].doctor;
        setDoctorName(
          `Dr. ${doctor.firstName || ""} ${doctor.lastName || ""}`.trim()
        );
      }

      console.log("Fetched sessions for doctor:", res.data);
    } catch (err) {
      console.log("Error fetching sessions for doctor:", err);
      toast.error("Failed to fetch sessions for the doctor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && id) {
      fetchSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    // Handle TimeSpan format (HH:MM:SS)
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailableSlots = (session: Session) => {
    const bookedCount = session.bookings?.length || 0;
    return session.capacity - bookedCount;
  };

  const getSessionStatus = (session: Session) => {
    if (session.canceled) return "canceled";
    const availableSlots = getAvailableSlots(session);
    if (availableSlots === 0) return "full";
    if (availableSlots <= session.capacity * 0.3) return "filling";
    return "available";
  };

  const handleBookSession = (session: Session) => {
    setBookingSession(session);
    setBookingSessionModalIsOpen(true);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(
    indexOfFirstSession,
    indexOfLastSession
  );

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ProtectedRoute allowedRoles={["Patient"]}>
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center text-gray-600 hover:text-teal-700 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Doctors
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {doctorName ? `${doctorName}'s Sessions` : "Doctor's Sessions"}
          </h1>
          <p className="text-gray-600 text-lg">
            Browse and book available consultation sessions
          </p>
        </div>

        {/* Date Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-teal-500 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
                <label className="text-gray-700 font-semibold">
                  Filter by Date:
                </label>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
                {date && (
                  <button
                    onClick={() => setDate("")}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
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
                    Clear Filter
                  </button>
                )}
                <div className="text-sm text-gray-500">
                  {date ? (
                    <span>
                      Showing sessions for{" "}
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  ) : (
                    <span>Showing all sessions</span>
                  )}
                </div>
              </div>
            </div>

            {/* Cancelled Sessions Button - Right Side */}
            <button
              onClick={() => handleCanceledButton()}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-sm ${
                canceledButton
                  ? "bg-teal-500 text-white hover:bg-teal-600 shadow-teal-200"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-teal-300 hover:text-teal-600"
              }`}
            >
              {canceledButton ? "Show All Sessions" : "Show Cancelled Sessions"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-500 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading sessions...</p>
            </div>
          </div>
        ) : filteredSessions.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-8xl mb-4">📅</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {date
                ? "No Sessions Found for Selected Date"
                : "No Sessions Available"}
            </h3>
            <p className="text-gray-500 text-lg mb-6">
              {date
                ? "There are no sessions scheduled for the selected date. Try choosing a different date."
                : "This doctor doesn't have any sessions scheduled at the moment."}
            </p>
            {date ? (
              <button
                onClick={() => setDate("")}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Clear Date Filter
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Browse Other Doctors
              </button>
            )}
          </div>
        ) : (
          /* Sessions Grid */
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="bg-teal-500 w-1.5 h-8 rounded-full mr-3"></span>
                Available Sessions
                <span className="ml-3 text-sm font-normal text-gray-500">
                  ({filteredSessions.filter((s) => !s.canceled).length} active{" "}
                  {filteredSessions.filter((s) => !s.canceled).length === 1
                    ? "session"
                    : "sessions"}
                  )
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSessions.map((session) => {
                const status = getSessionStatus(session);
                const availableSlots = getAvailableSlots(session);

                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-teal-200"
                  >
                    {/* Status Badge */}
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-semibold text-lg">
                          Session #{session.id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === "canceled"
                              ? "bg-red-100 text-red-700"
                              : status === "full"
                              ? "bg-gray-100 text-gray-700"
                              : status === "filling"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {status === "canceled"
                            ? "Canceled"
                            : status === "full"
                            ? "Full"
                            : status === "filling"
                            ? "Filling Fast"
                            : "Available"}
                        </span>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="p-6">
                      {/* Date */}
                      <div className="flex items-start mb-4">
                        <svg
                          className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0"
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
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="text-gray-800 font-semibold">
                            {formatDate(session.date)}
                          </p>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="flex items-start mb-4">
                        <svg
                          className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="text-gray-800 font-semibold">
                            {formatTime(session.startTime)} -{" "}
                            {formatTime(session.endTime)}
                          </p>
                        </div>
                      </div>

                      {/* Fee */}
                      <div className="flex items-start mb-4">
                        <svg
                          className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500">Session Fee</p>
                          <p className="text-gray-800 font-semibold text-xl">
                            ${session.sessionFee.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-start mb-4">
                        <svg
                          className="w-5 h-5 text-teal-500 mr-3 mt-1 flex-shrink-0"
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
                        <div className="flex-grow">
                          <p className="text-sm text-gray-500 mb-2">
                            Available Slots
                          </p>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-800 font-semibold">
                              {availableSlots} / {session.capacity}
                            </span>
                            <span className="text-sm text-gray-500">
                              {(
                                (availableSlots / session.capacity) *
                                100
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                status === "canceled"
                                  ? "bg-red-500"
                                  : status === "full"
                                  ? "bg-gray-500"
                                  : status === "filling"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{
                                width: `${
                                  (availableSlots / session.capacity) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {session.description && (
                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <p className="text-sm text-gray-500 mb-1">
                            Description
                          </p>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {session.description.length > 50
                              ? session.description.slice(0, 50) + "..."
                              : session.description}
                          </p>
                        </div>
                      )}

                      {/* Action Button */}
                      <button
                        onClick={() => handleBookSession(session)}
                        disabled={status === "canceled" || status === "full"}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                          status === "canceled" || status === "full"
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg transform hover:-translate-y-0.5"
                        }`}
                      >
                        {status === "canceled"
                          ? "Session Canceled"
                          : status === "full"
                          ? "Session Full"
                          : "Book This Session"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-600"
                  }`}
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-teal-50 hover:border-teal-500 hover:text-teal-600"
                  }`}
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Pagination Info */}
            {totalPages > 0 && (
              <div className="mt-4 text-center text-sm text-gray-600">
                Showing {indexOfFirstSession + 1} to{" "}
                {Math.min(indexOfLastSession, filteredSessions.length)} of{" "}
                {filteredSessions.length} sessions
              </div>
            )}
          </div>
        )}
      </div>
      <UserSessionBooking
        isOpen={BookingSessionModalIsOpen}
        onClose={handleSessionBookingOnClose}
        session={bookingSession}
        onBookingSuccess={handleBookingSuccess}
      />
      </div>
    </ProtectedRoute>
  );
}
