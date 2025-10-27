'use client';

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";


interface UserSessionBookingProps {
    isOpen: boolean;
    onClose: () => void;
    session: Session | null;
    onBookingSuccess?: () => void;
}


export default function UserSessionBooking({isOpen, onClose, session, onBookingSuccess}: UserSessionBookingProps) {
    const {accessToken, userId} = useAuth();
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    // Debug: Log userId and bookings
    console.log('Current userId:', userId);
    console.log('Session bookings:', session?.bookings);

    const handleBookingClick = async () => {

        try{
            const res  = await axios.post(`${API}/userSession/booksession/${session?.id}`,{},{
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
        console.log("Booking successful:", res.data);
        toast.success("Session booked successfully!");
        onClose();
        // Call the callback to refetch sessions
        if (onBookingSuccess) {
            onBookingSuccess();
        }
        }catch(err){
            const error = err as AxiosError<{ message: string }>;
            const errorMessage = error.response?.data?.message || "An unknown error occurred";
            console.error("Error booking session:", errorMessage);
            toast.error(errorMessage);
        }
    }

    if(!isOpen || !session) return null;

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
        if (!timeString) return "N/A";
        
        const timeParts = timeString.split(":");
        if (timeParts.length < 2) return timeString;
        
        const [hours, minutes] = timeParts;
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const getAvailableSlots = () => {
        const bookedCount = session.bookings?.length || 0;
        return session.capacity - bookedCount;
    };

    const availableSlots = getAvailableSlots();
    const bookedSlots = session.bookings?.length || 0;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
            style={{ 
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-5 rounded-t-2xl sticky top-0 z-10 shadow-lg">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white flex items-center">
                            <svg
                                className="w-7 h-7 mr-3 animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                            Session Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90 hover:scale-110"
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

                {/* Content */}
                <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                    {/* Session ID Badge */}
                    <div className="mb-6 flex items-center justify-between">
                        <span className="bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm border border-teal-200 flex items-center">
                            <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                                />
                            </svg>
                            Session #{session.id}
                        </span>
                        {session.canceled && (
                            <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-700 px-5 py-2.5 rounded-full font-semibold text-sm shadow-sm border border-red-300 flex items-center animate-pulse">
                                <svg
                                    className="w-4 h-4 mr-2"
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
                                Canceled
                            </span>
                        )}
                    </div>

                    {/* Doctor Information */}
                    {session.doctor && (
                        <div className="mb-6 p-5 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-2xl border-2 border-teal-100 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                                    <svg
                                        className="w-5 h-5 text-teal-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                </div>
                                Doctor Information
                            </h3>
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                                Dr. {session.doctor.firstName} {session.doctor.lastName}
                            </p>
                            {session.doctor.email && (
                                <p className="text-sm text-gray-600 flex items-center">
                                    <svg
                                        className="w-4 h-4 mr-2"
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
                                    {session.doctor.email}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Session Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Date */}
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-200 hover:border-teal-300 hover:shadow-md transition-all duration-200">
                            <div className="bg-gradient-to-br from-teal-100 to-teal-200 p-3 rounded-xl shadow-sm">
                                <svg
                                    className="w-6 h-6 text-teal-700"
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
                            <div className="flex-grow">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Date</p>
                                <p className="text-gray-900 font-semibold leading-tight">{formatDate(session.date)}</p>
                            </div>
                        </div>

                        {/* Time */}
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:shadow-md transition-all duration-200">
                            <div className="bg-gradient-to-br from-cyan-100 to-cyan-200 p-3 rounded-xl shadow-sm">
                                <svg
                                    className="w-6 h-6 text-cyan-700"
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
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Time</p>
                                <p className="text-gray-900 font-semibold">
                                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </p>
                            </div>
                        </div>

                        {/* Fee */}
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200">
                            <div className="bg-gradient-to-br from-green-100 to-green-200 p-3 rounded-xl shadow-sm">
                                <svg
                                    className="w-6 h-6 text-green-700"
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
                            </div>
                            <div className="flex-grow">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Session Fee</p>
                                <p className="text-gray-900 font-bold text-2xl">
                                    ${session.sessionFee.toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {/* Capacity */}
                        <div className="flex items-start space-x-3 bg-white p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200">
                            <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-3 rounded-xl shadow-sm">
                                <svg
                                    className="w-6 h-6 text-purple-700"
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
                            <div className="flex-grow">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Capacity</p>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-900 font-semibold">
                                        {availableSlots} / {session.capacity} Available
                                    </span>
                                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                        {bookedSlots} Booked
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                            availableSlots === 0
                                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                                : availableSlots <= session.capacity * 0.3
                                                ? "bg-gradient-to-r from-yellow-400 to-yellow-500"
                                                : "bg-gradient-to-r from-green-400 to-green-500"
                                        }`}
                                        style={{
                                            width: `${(availableSlots / session.capacity) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {session.description && (
                        <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-2 rounded-lg mr-3 shadow-sm">
                                    <svg
                                        className="w-5 h-5 text-gray-700"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h7"
                                        />
                                    </svg>
                                </div>
                                Description
                            </h3>
                            <p className="text-gray-700 leading-relaxed pl-12">{session.description}</p>
                        </div>
                    )}

                    {/* Booked Patients Queue */}
                    {session.bookings && session.bookings.length > 0 && (
                        <div className="mb-6 p-5 bg-white rounded-2xl border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-2 rounded-lg mr-3 shadow-sm">
                                    <svg
                                        className="w-5 h-5 text-blue-700"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                        />
                                    </svg>
                                </div>
                                Booked Patients Queue
                            </h3>
                            <div className="space-y-2 pl-12">
                                {session.bookings
                                    .sort((a, b) => (a.positionInQueue || 0) - (b.positionInQueue || 0))
                                    .map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-md">
                                                    {booking.positionInQueue || 0}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {booking.patient
                                                            ? `${booking.patient.firstName || ''} ${booking.patient.lastName || ''}`.trim()
                                                            : booking.patientName || 'Unknown Patient'}
                                                        {(booking.patient?.id === userId || booking.patientId === userId) && (
                                                            <span className="ml-2 text-teal-600 font-bold">(You)</span>
                                                        )}
                                                    </p>
                                                    {booking.patient?.email && (
                                                        <p className="text-xs text-gray-600">{booking.patient.email}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {booking.onGoing && (
                                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-300">
                                                        Ongoing
                                                    </span>
                                                )}
                                                {booking.completed && (
                                                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full border border-green-300">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 bg-white text-gray-700 rounded-xl font-semibold border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            Close
                        </button>
                        <button
                            disabled={session.canceled || availableSlots === 0}
                            className={`flex-1 px-6 py-3.5 rounded-xl font-semibold transition-all duration-200 shadow-md transform ${
                                session.canceled || availableSlots === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                            }`}

                            onClick={()=> handleBookingClick()}
                        >
                            {session.canceled
                                ? "Session Canceled"
                                : availableSlots === 0
                                ? "Session Full"
                                : "Book Session"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}