'use client';

import { useAuth } from "@/Context/AuthContext";
import { Booking } from "@/types/Booking";
import { Session } from "@/types/Session";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import SessionFullView from "@/components/SessionFullView";


export default function MyAppointmentsPage(){
    const [myBookings, setMyBookings] = useState<Booking[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
    const [loadingSessionId, setLoadingSessionId] = useState<number | null>(null);
    const {accessToken, userId} = useAuth();
    const API  = process.env.NEXT_PUBLIC_BACKEND_URL;


    const fetchBookings = async () => {
        setIsLoading(true);
        try{
            const res = await axios.get(`${API}/userSession/getallbookingsforpatient`,{
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setMyBookings(res.data);
            console.log("Fetched bookings:", res.data);
        
        }catch (error) {
            console.error("Error fetching bookings:", error);
            toast.error("Failed to fetch bookings. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    } 

    const fetchFullSessionDetails = async (booking: Booking) => {
        if (!booking.session) {
            toast.error("Session details not available");
            return;
        }

        setLoadingSessionId(booking.sessionId);
        try {
            // Fetch full session details with all bookings
            const res = await axios.get(`${API}/userSession/getsessionsfordoctor/${booking.session.doctorId}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

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
                doctor: {
                    firstName: fullSession.doctorName?.split(' ')[0],
                    lastName: fullSession.doctorName?.split(' ').slice(1).join(' '),
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
                    completed: b.completed
                }))
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

    useEffect(()=> {
        fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const getStatusBadge = (booking: Booking) => {
        if (booking.completed) {
            return (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Completed
                </span>
            );
        } else if (booking.onGoing) {
            return (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse">
                    Ongoing
                </span>
            );
        } else {
            return (
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    Scheduled
                </span>
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        My Appointments
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        View and manage all your medical appointments
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && (!myBookings || myBookings.length === 0) && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
                        <svg className="mx-auto h-24 w-24 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No appointments yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            You haven&apos;t booked any appointments. Start by booking your first consultation.
                        </p>
                        <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                            Book Appointment
                        </button>
                    </div>
                )}

                {/* Appointments Grid */}
                {!isLoading && myBookings && myBookings.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myBookings.map((booking) => (
                            <div 
                                key={booking.id}
                                className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                            >
                                {/* Card Header with Status */}
                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Booking #{booking.id}
                                        </span>
                                        {getStatusBadge(booking)}
                                    </div>
                                    
                                    {/* Patient Name */}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {booking.patient?.firstName && booking.patient?.lastName 
                                            ? `${booking.patient.firstName} ${booking.patient.lastName}`
                                            : booking.patientName || 'Patient'}
                                    </h3>
                                    {booking.patient?.email && (
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {booking.patient.email}
                                        </p>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="p-6 space-y-4">
                                    {/* Date and Time */}
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatDate(booking.bookedDateandTime)}
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {formatTime(booking.bookedDateandTime)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Queue Position */}
                                    {booking.positionInQueue && (
                                        <div className="flex items-start space-x-3">
                                            <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Queue Position
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    #{booking.positionInQueue}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Session ID */}
                                    <div className="flex items-start space-x-3">
                                        <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Session ID
                                            </p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {booking.sessionId}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Contact Numbers */}
                                    {booking.patient?.contactNumbers && booking.patient.contactNumbers.length > 0 && (
                                        <div className="flex items-start space-x-3">
                                            <svg className="w-5 h-5 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    Contact
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {booking.patient.contactNumbers[0]}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Card Footer */}
                                <div className="px-6 pb-6">
                                    <button 
                                        onClick={() => fetchFullSessionDetails(booking)}
                                        disabled={!booking.session || loadingSessionId === booking.sessionId}
                                        className="w-full px-4 py-2.5 bg-primary/10 hover:bg-primary hover:text-white text-primary rounded-lg transition-colors font-medium group-hover:bg-primary group-hover:text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loadingSessionId === booking.sessionId ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Session Full View
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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