"use client";

import { useAuth } from "@/Context/AuthContext";
import { Booking } from "@/types/Booking";
import { Session } from "@/types/Session";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SessionFullView from "@/components/SessionFullView";
import { useRouter } from "next/navigation";

export default function MyAppointmentsPage() {
  const [myBookings, setMyBookings] = useState<Booking[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);
  const { accessToken, userId } = useAuth();
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Date filter state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Cancelled filter state
  const [showCancelledOnly, setShowCancelledOnly] = useState(false);
  const [showOngoingOnly, setShowOngoingOnly] = useState(false);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API}/userSession/getallbookingsforpatient`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMyBookings(res.data);
      console.log("Fetched bookings:", res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to fetch bookings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOngoingView = async (id : number) => {
    router.push(`/subpages/UserSessionOngoing/${id}`);
  }

  const fetchFullSessionDetails = async (booking: Booking) => {
    if (!booking.session) {
      toast.error("Session details not available");
      return;
    }

    setLoadingSessionId(booking.sessionId);
    try {
      // Fetch full session details with all bookings
      const res = await axios.get(
        `${API}/userSession/getsessionsfordoctor/${booking.session.doctorId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Find the specific session from the response
      const sessions = res.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fullSession = sessions.find((s: any) => s.id === booking.sessionId);

      if (!fullSession) {
        toast.error("Session not found");
        return;
      }

      // Convert to Session type with all bookings
      const sessionData: Session = {
        id: fullSession.id,
        doctorId: fullSession.doctorId,
        doctor: fullSession.doctor
          ? {
              id: fullSession.doctor.id,
              firstName: fullSession.doctor.firstName,
              lastName: fullSession.doctor.lastName,
              email: fullSession.doctor.email,
              contactNumbers: fullSession.doctor.contactNumbers,
            }
          : {
              firstName: fullSession.doctorName?.split(" ")[0],
              lastName: fullSession.doctorName?.split(" ").slice(1).join(" "),
            },
        canceled: fullSession.canceled,
        ongoing: fullSession.ongoing || false,
        date: fullSession.date,
        startTime: fullSession.startTime,
        endTime: fullSession.endTime,
        sessionFee: fullSession.sessionFee,
        description: fullSession.description,
        capacity: fullSession.capacity,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bookings: fullSession.bookings?.map((b: any) => ({
          id: b.id,
          sessionId: b.sessionId,
          patientId: b.patientId,
          patientName: b.patientName,
          patient: b.patient,
          bookedDateandTime: b.bookedDateandTime,
          positionInQueue: b.positionInQueue,
          onGoing: b.onGoing,
          completed: b.completed,
        })),
      };

      console.log("Full session data:", sessionData);
      setSelectedSession(sessionData);
      setIsSessionModalOpen(true);
    } catch (error) {
      console.error("Error fetching full session details:", error);
      toast.error("Failed to load session details. Please try again.");
    } finally {
      setLoadingSessionId(null);
    }
  };

  const closeSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedSession(null);
  };

  // Filter bookings by date range
  const getFilteredBookings = () => {
    if (!myBookings) return [];

    let filtered = [...myBookings];

    // Filter by status first
    if (showCancelledOnly) {
      // Show ONLY cancelled sessions
      filtered = filtered.filter((booking) => booking.session?.canceled === true);
    } else if (showOngoingOnly) {
      // Show ONLY ongoing sessions
      filtered = filtered.filter((booking) => booking.session?.ongoing === true);
    } else if (showCompletedOnly) {
      // Show ONLY completed sessions
      filtered = filtered.filter((booking) => booking.completed === true);
    } else {
      // Show ONLY scheduled sessions (not cancelled, not ongoing, not completed)
      filtered = filtered.filter(
        (booking) => booking.session?.canceled !== true && 
                     booking.session?.ongoing !== true && 
                     booking.completed !== true
      );
    }

    // Apply date filter to all tabs
    if (selectedDate) {
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.bookedDateandTime);
        const filterDate = new Date(selectedDate);

        // Compare only the date part (ignore time)
        return bookingDate.toDateString() === filterDate.toDateString();
      });
    }

    return filtered;
  };

  // Pagination logic
  const filteredBookings = getFilteredBookings();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearDateFilter = () => {
  setSelectedDate(null);
  setShowCancelledOnly(false);
  setShowOngoingOnly(false);
  setShowCompletedOnly(false);
  setCurrentPage(1);
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (booking: Booking) => {
    // Don't show status badge for cancelled sessions
    if (booking.session?.canceled) {
      return null;
    }

    if (booking.completed) {
      return (
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 shadow-sm border border-emerald-200 dark:border-emerald-800 transition-all duration-300">
          ✓ Completed
        </span>
      );
    } else if (booking.onGoing || booking.session?.ongoing) {
      return (
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 animate-pulse shadow-sm border border-cyan-200 dark:border-cyan-800 transition-all duration-300">
          ● Ongoing
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 shadow-sm border border-amber-200 dark:border-amber-800 transition-all duration-300">
          ⏱ Scheduled
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your medical appointments
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {/* Active Sessions Tab */}
              <button
                onClick={() => {
                  setShowCancelledOnly(false);
                  setShowOngoingOnly(false);
                  setShowCompletedOnly(false);
                  setCurrentPage(1);
                  setSelectedDate(null);
                  setShowDatePicker(false);
                }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 flex items-center gap-2 ${
                  !showCancelledOnly && !showOngoingOnly && !showCompletedOnly
                    ? "border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Active Appointments
                {myBookings && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      !showCancelledOnly && !showOngoingOnly && !showCompletedOnly
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {myBookings.filter((b) => !b.session?.canceled && !b.session?.ongoing && !b.completed).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  setShowCancelledOnly(false);
                  setShowOngoingOnly(true);
                  setShowCompletedOnly(false);
                  setCurrentPage(1);
                  setSelectedDate(null);
                  setShowDatePicker(false);
                }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 flex items-center gap-2 ${
                  showOngoingOnly
                    ? "border-teal-500 text-teal-600 dark:text-teal-400 bg-teal-50/50 dark:bg-teal-900/20"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Ongoing Sessions
                {myBookings && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      showOngoingOnly
                        ? "bg-teal-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {myBookings.filter((b) => b.session?.ongoing).length}
                  </span>
                )}
              </button>

              {/* Completed Sessions Tab */}
              <button
                onClick={() => {
                  setShowCancelledOnly(false);
                  setShowOngoingOnly(false);
                  setShowCompletedOnly(true);
                  setCurrentPage(1);
                  setSelectedDate(null);
                  setShowDatePicker(false);
                }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 flex items-center gap-2 ${
                  showCompletedOnly
                    ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Completed Sessions
                {myBookings && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      showCompletedOnly
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {myBookings.filter((b) => b.completed).length}
                  </span>
                )}
              </button>

              {/* Cancelled Sessions Tab */}
              <button
                onClick={() => {
                  setShowCancelledOnly(true);
                  setShowOngoingOnly(false);
                  setShowCompletedOnly(false);
                  setCurrentPage(1);
                  setSelectedDate(null);
                  setShowDatePicker(false);
                }}
                className={`px-6 py-3 font-semibold transition-all duration-300 border-b-4 flex items-center gap-2 ${
                  showCancelledOnly
                    ? "border-red-500 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Cancelled Sessions
                {myBookings && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      showCancelledOnly
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {myBookings.filter((b) => b.session?.canceled).length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Date Filter Section - Show for all tabs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="px-6 py-3 bg-white dark:bg-slate-800 border-2 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300 rounded-xl hover:bg-teal-50 dark:hover:bg-slate-700 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {selectedDate
                  ? `Filtered: ${selectedDate.toLocaleDateString()}`
                  : "Filter by Date"}
              </button>
              {selectedDate && (
                <button
                  onClick={clearDateFilter}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
            </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div className="mt-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border-2 border-teal-200 dark:border-teal-700">
              <div className="max-w-md mx-auto">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Select a Date
                </label>
                <input
                  type="date"
                  value={
                    selectedDate ? selectedDate.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    setSelectedDate(
                      e.target.value ? new Date(e.target.value) : null
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border-2 border-teal-200 dark:border-teal-700 rounded-xl focus:outline-none focus:ring-4 focus:ring-teal-300 dark:focus:ring-teal-600 dark:text-white transition-all duration-300 text-lg cursor-pointer hover:border-teal-400 dark:hover:border-teal-500"
                />
              </div>
              {selectedDate && (
                <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                  <p className="text-sm text-teal-700 dark:text-teal-300 font-medium text-center">
                    Showing appointments for{" "}
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    <span className="ml-2 px-2 py-1 bg-teal-200 dark:bg-teal-800 rounded-full text-xs">
                      {filteredBookings.length}{" "}
                      {filteredBookings.length === 1 ? "result" : "results"}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!myBookings || myBookings.length === 0) && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-12 text-center border-2 border-teal-100 dark:border-teal-900">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900 dark:to-cyan-900 rounded-full flex items-center justify-center">
              <svg
                className="h-16 w-16 text-teal-500 dark:text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No appointments yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              You haven&apos;t booked any appointments. Start your healthcare
              journey by booking your first consultation.
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
              Book Your First Appointment
            </button>
          </div>
        )}

        {/* No Results After Filter */}
        {!isLoading &&
          myBookings &&
          myBookings.length > 0 &&
          filteredBookings.length === 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-12 text-center border-2 border-teal-100 dark:border-teal-900">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900 dark:to-orange-900 rounded-full flex items-center justify-center">
                <svg
                  className="h-16 w-16 text-amber-500 dark:text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No appointments found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                No appointments match your selected date range. Try adjusting
                your filters.
              </p>
              <button
                onClick={clearDateFilter}
                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* Appointments Grid */}
        {!isLoading && currentBookings && currentBookings.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out overflow-hidden group border-2 transform hover:-translate-y-2 hover:scale-[1.02] ${
                    booking.session?.canceled
                      ? "border-red-300 dark:border-red-700 opacity-75"
                      : "border-transparent hover:border-teal-300 dark:hover:border-teal-700"
                  }`}
                >
                  {/* Card Header with Status */}
                  <div
                    className={`p-6 ${
                      booking.session?.canceled
                        ? "bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600"
                        : "bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white/90">
                          Booking #{booking.id}
                        </span>
                        {booking.session?.canceled && (
                          <span className="px-2 py-1 text-xs font-bold rounded-full bg-white/20 text-white border border-white/30">
                            CANCELLED
                          </span>
                        )}
                      </div>
                      {getStatusBadge(booking)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4 bg-gradient-to-b from-transparent to-teal-50/30 dark:to-teal-950/30">
                    {/* Date and Time */}
                    <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
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
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatDate(booking.bookedDateandTime)}
                        </p>
                        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                          {formatTime(booking.bookedDateandTime)}
                        </p>
                      </div>
                    </div>

                    {/* Queue Position */}
                    {booking.positionInQueue && (
                      <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            Queue Position
                          </p>
                          <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                            #{booking.positionInQueue}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Session ID */}
                    <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Session ID
                        </p>
                        <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                          {booking.sessionId}
                        </p>
                      </div>
                    </div>

                    {/* Contact Numbers */}
                    {booking.patient?.contactNumbers &&
                      booking.patient.contactNumbers.length > 0 && (
                        <div className="flex items-start space-x-3 p-3 bg-white dark:bg-slate-700/50 rounded-xl">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              Contact
                            </p>
                            <p className="text-sm text-teal-600 dark:text-teal-400 font-medium">
                              {booking.patient.contactNumbers[0]}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => booking.session?.ongoing ? handleOngoingView(booking.session.id) : fetchFullSessionDetails(booking)}
                      disabled={
                        !booking.session ||
                        loadingSessionId === booking.sessionId
                      }
                      className="w-full px-4 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:scale-95"
                    >
                      {loadingSessionId === booking.sessionId ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          Loading...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
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
                          View Full Session
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-teal-100 dark:border-teal-900">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing{" "}
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    {Math.min(indexOfLastItem, filteredBookings.length)}
                  </span>{" "}
                  of{" "}
                  <span className="text-teal-600 dark:text-teal-400 font-bold">
                    {filteredBookings.length}
                  </span>{" "}
                  appointments
                </div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        // Show first page, last page, current page, and pages around current
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`min-w-[40px] h-10 px-3 rounded-lg font-semibold transition-all duration-300 ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/50 transform scale-110"
                                  : "border-2 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:scale-105 active:scale-95"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <span key={page} className="px-2 text-gray-400">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-110 active:scale-95"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Session Full View Modal */}
      {selectedSession && (
        <SessionFullView
          isModalOpen={isSessionModalOpen}
          isClose={closeSessionModal}
          session={selectedSession}
          currentUserId={userId || undefined}
        />
      )}
    </div>
  );
}
