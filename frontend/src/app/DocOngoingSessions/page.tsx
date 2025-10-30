'use client';

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";



export default function DocOngoingSessions(){


    const {accessToken, userId} = useAuth();
    const [ongoingSession, setOnGoingSession] = useState<Session|null>(null);
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchOnGoingSession = useCallback(async () => {
        try{
            const res = await axios.get(`${API}/session/getcurrentOngoingSession/${userId}`,{
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setOnGoingSession(res.data);
        }catch(err){
            console.log({err});
            toast.error("Failed to fetch ongoing session");
        }
    }, [API, userId, accessToken]);

    const handletoggleCompleteBooking = async (bookingId: number) => {
        try {
            await axios.patch(`${API}/session/markbookingcompleted/${bookingId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            toast.success("Booking marked as completed");
            fetchOnGoingSession(); // refresh the data
        } catch (error: unknown) {
            // Log full axios error for debugging (includes response body from backend)
            console.log('Complete booking error', { error });
            // Narrow the unknown to a shape we can inspect safely
            const axiosErr = error as { response?: { data?: Record<string, unknown> }; message?: string };
            console.log('Complete booking error response', axiosErr.response);
            // Prefer backend message when available
            const data = axiosErr.response?.data as Record<string, unknown> | undefined;
            let serverMessage = "Failed to complete booking";
            if (data) {
                const m = data['message'] ?? data['Message'];
                if (typeof m === 'string') serverMessage = m;
            } else if (axiosErr?.message && typeof axiosErr.message === 'string') {
                serverMessage = axiosErr.message;
            }
            toast.error(serverMessage);
        }
    }

    const handleOngoingBooking = async (bookingId: number) => {
        try {
            await axios.patch(`${API}/session/ongoingbooking/${bookingId}`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            toast.success("Booking marked as ongoing");
            fetchOnGoingSession(); // refresh the data
        } catch (err) {
            console.log({err});
            toast.error("Failed to make booking ongoing");
        }
    }

    useEffect(()=>{
        fetchOnGoingSession();
        // console.log(ongoingSession);
    },[fetchOnGoingSession]);

    const totalBookings = ongoingSession?.bookings?.length ?? 0;
    const completedBookings = ongoingSession?.bookings?.filter(b => b.completed).length ?? 0;
    const pendingBookings = totalBookings - completedBookings;

    return (
        <div className="ongoing-session-container-teal-glass">
            <h2 className="teal-title-glass">
                {ongoingSession ? `Session #${ongoingSession.id}` : "Current Ongoing Session"}
            </h2>
            {ongoingSession && (
                <div className="session-meta-chips">
                    <div className="chip chip-primary">
                        <span className="chip-dot"></span>
                        <span>Total Bookings</span>
                        <strong>{totalBookings}</strong>
                    </div>
                    <div className="chip chip-success">
                        <span className="chip-dot"></span>
                        <span>Completed</span>
                        <strong>{completedBookings}</strong>
                    </div>
                    <div className="chip chip-warning">
                        <span className="chip-dot"></span>
                        <span>Pending</span>
                        <strong>{pendingBookings}</strong>
                    </div>
                </div>
            )}
            {ongoingSession ? (
                <div className="session-card-teal-glass">
                    <div className="session-main-info-glass">
                        <div className="session-grid-4x4">
                            <div className="session-grid-item">
                                <span className="session-label-glass">Date</span>
                                <span className="session-value-glass">{new Date(ongoingSession.date).toLocaleDateString()}</span>
                            </div>
                            <div className="session-grid-item">
                                <span className="session-label-glass">Start Time</span>
                                <span className="session-value-glass">{ongoingSession.startTime}</span>
                            </div>
                            <div className="session-grid-item">
                                <span className="session-label-glass">End Time</span>
                                <span className="session-value-glass">{ongoingSession.endTime}</span>
                            </div>
                            <div className="session-grid-item">
                                <span className="session-label-glass">Fee</span>
                                <span className="session-value-glass">${ongoingSession.sessionFee}</span>
                            </div>
                            <div className="session-grid-item">
                                <span className="session-label-glass">Ongoing</span>
                                <span className="session-value-glass">{ongoingSession.ongoing ? "Yes" : "No"}</span>
                            </div>
                            <div className="session-grid-item">
                                <span className="session-label-glass">Capacity</span>
                                <span className="session-value-glass">{ongoingSession.capacity}</span>
                            </div>
                            <div className="session-grid-item full-width">
                                <span className="session-label-glass">Description</span>
                                <span className="session-value-glass">{ongoingSession.description}</span>
                            </div>
                        </div>
                    </div>
                    <div className="session-bookings-section-glass">
                        <h3 className="teal-subtitle-glass">Bookings</h3>
                        {ongoingSession.bookings && ongoingSession.bookings.length > 0 ? (
                            <ul className="bookings-grid-5">
                                {ongoingSession.bookings.map((booking) => (
                                    <li key={booking.id} className={`booking-card-square ${booking.completed ? 'is-completed' : 'is-pending'}`}>
                                        <div className="card-queue-badge">{booking.positionInQueue ?? '-'}</div>
                                        <div className="card-content">
                                            <div className="card-name">{booking.patientName ?? (booking.patient ? `${booking.patient.firstName ?? ''} ${booking.patient.lastName ?? ''}` : booking.patientId)}</div>
                                            <div className="card-email">{booking.patient?.email ?? '-'}</div>
                                            <div className="card-phone">{booking.patient?.phoneNumber ?? (booking.patient?.contactNumbers && booking.patient.contactNumbers.length > 0 ? booking.patient.contactNumbers.join(', ') : '-')}</div>
                                        </div>
                                        {!booking.completed && (
                                            <>
                                                <button className="complete-button" onClick={() => handletoggleCompleteBooking(booking.id)} aria-label={`Mark booking ${booking.id} as completed`} title="Mark as completed">
                                                    ✓
                                                </button>
                                                <button
                                                    className="ongoing-button"
                                                    onClick={() => handleOngoingBooking(booking.id)}
                                                    aria-label={`Mark booking ${booking.id} as ongoing`}
                                                    title="Mark as ongoing"
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                        <path d="M8 5v14l11-7L8 5z" fill="currentColor" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                        <div className={`status-pill ${booking.completed ? 'pill-completed' : 'pill-pending'}`}>
                                            {booking.completed ? 'Completed' : 'Pending'}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-bookings-teal-glass">No bookings yet.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="no-session-teal-glass">No ongoing session found.</p>
            )}
            <style jsx>{`
                .session-grid-4x4 {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    grid-auto-rows: minmax(60px, auto);
                    gap: 28px 24px;
                    margin-bottom: 36px;
                }
                .session-grid-item {
                    background: linear-gradient(120deg, #e0f7fa 0%, #b2dfdb 100%);
                    border-radius: 14px;
                    box-shadow: 0 2px 12px rgba(0,128,128,0.10);
                    padding: 20px 18px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    min-width: 0;
                    transition: box-shadow 0.2s;
                }
                .session-grid-item:hover {
                    box-shadow: 0 6px 24px rgba(0,128,128,0.18);
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .session-label-glass {
                    color: #008080;
                    font-weight: 700;
                    font-size: 1.15rem;
                    margin-bottom: 6px;
                    letter-spacing: 0.5px;
                }
                .session-value-glass {
                    color: #004d40;
                    font-size: 1.16rem;
                    font-weight: 500;
                    word-break: break-word;
                }
                .ongoing-session-container-teal-glass {
                    max-width: 1200px;
                    margin: 48px auto;
                    padding: 64px 52px;
                    background: radial-gradient(1200px 600px at 20% 0%, rgba(224,247,250,0.85) 0%, rgba(178,223,219,0.75) 50%, rgba(255,255,255,0.7) 100%);
                    border-radius: 36px;
                    box-shadow: 0 16px 56px rgba(0, 128, 128, 0.16);
                    backdrop-filter: blur(10px);
                    border: 1.5px solid rgba(0,128,128,0.10);
                    position: relative;
                    overflow: hidden;
                }
                .ongoing-session-container-teal-glass:before {
                    content: "";
                    position: absolute;
                    inset: -2px;
                    border-radius: 40px;
                    padding: 1.5px;
                    background: linear-gradient(135deg, rgba(0,128,128,0.18), rgba(0,150,136,0.08), rgba(0,128,128,0.18));
                    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                            mask-composite: exclude;
                    pointer-events: none;
                }
                .teal-title-glass {
                    color: #008080;
                    font-size: 2.7rem;
                    font-weight: 900;
                    margin-bottom: 20px;
                    text-align: center;
                    letter-spacing: 1px;
                    text-shadow: 0 2px 10px rgba(0,128,128,0.10);
                }
                .session-meta-chips {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 28px;
                    flex-wrap: wrap;
                }
                .chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.75);
                    border: 1px solid rgba(0,128,128,0.12);
                    color: #004d40;
                    padding: 8px 12px;
                    border-radius: 999px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.06);
                    font-weight: 700;
                }
                .chip strong { color: #003d36; font-weight: 900; }
                .chip-primary { background: rgba(224,247,250,0.8); }
                .chip-success { background: rgba(230, 255, 240, 0.85); }
                .chip-warning { background: rgba(255, 245, 230, 0.9); }
                .chip-dot {
                    width: 8px; height: 8px; border-radius: 50%; background: #008080; display: inline-block;
                }
                .chip-success .chip-dot { background: #2e7d32; }
                .chip-warning .chip-dot { background: #f9a825; }
                .session-card-teal-glass {
                    background: rgba(255,255,255,0.9);
                    border-radius: 24px;
                    box-shadow: 0 10px 28px rgba(0,128,128,0.12);
                    padding: 40px 34px;
                    border: 1px solid rgba(0,128,128,0.10);
                }
                .session-main-info-glass {
                    margin-bottom: 28px;
                }
                .session-row-glass {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1.5px solid #e0f2f1;
                }
                .session-label-glass {
                    color: #009688;
                    font-weight: 700;
                    font-size: 1.08rem;
                }
                .session-value-glass {
                    color: #004d40;
                    font-size: 1.08rem;
                }
                .session-bookings-section-glass {
                    margin-top: 24px;
                }
                .teal-subtitle-glass {
                    color: #008080;
                    font-size: 1.35rem;
                    font-weight: 700;
                    margin-bottom: 16px;
                    text-shadow: 0 1px 4px rgba(0,128,128,0.07);
                }
                .bookings-grid-5 {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 18px;
                }
                .booking-card-square {
                    position: relative;
                    background: linear-gradient(145deg, #e0f7f5 0%, #ccefeb 100%);
                    border: 1px solid rgba(0,128,128,0.08);
                    border-radius: 16px;
                    box-shadow: 0 6px 16px rgba(0, 128, 128, 0.12);
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    aspect-ratio: 1 / 1.1;
                    transition: transform 0.12s ease, box-shadow 0.18s ease;
                    overflow: hidden;
                }
                .booking-card-square:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 24px rgba(0, 128, 128, 0.18);
                }
                .booking-card-square.is-completed {
                    background: linear-gradient(145deg, #e6fff0 0%, #d4f7e3 100%);
                    border-color: rgba(56, 142, 60, 0.25);
                }
                .booking-card-square.is-pending {
                    background: linear-gradient(145deg, #e8f6f5 0%, #d9f1ee 100%);
                }
                .card-queue-badge {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: linear-gradient(180deg, #00796b, #008080);
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                    font-size: 1rem;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.10);
                }
                .card-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px;
                }
                .card-name {
                    color: #005b55;
                    font-weight: 800;
                    font-size: 1.02rem;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-email {
                    color: #00695c;
                    font-size: 0.9rem;
                    opacity: 0.9;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .card-phone {
                    color: #00695c;
                    font-size: 0.8rem;
                    opacity: 0.8;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .complete-button {
                    position: absolute;
                    bottom: 10px;
                    left: 10px;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: linear-gradient(180deg, #4caf50, #388e3c);
                    color: #ffffff;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.10);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .complete-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.15);
                }
                .ongoing-button {
                    position: absolute;
                    bottom: 10px;
                    right: 10px;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(180deg, #ffd8a6 0%, #ffb74d 60%);
                    color: #1f2937; /* dark icon color for contrast */
                    border: 1px solid rgba(0,0,0,0.06);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.12), inset 0 -2px 6px rgba(255,255,255,0.25);
                    transition: transform 0.14s ease, box-shadow 0.14s ease, opacity 0.14s ease;
                    backdrop-filter: blur(2px);
                }
                .ongoing-button svg { display: block; color: #1f2937; }
                .ongoing-button:hover {
                    transform: translateY(-2px) scale(1.03);
                    box-shadow: 0 10px 22px rgba(0,0,0,0.14);
                }
                .ongoing-button:focus {
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(255, 183, 77, 0.18);
                }
                .status-pill {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 6px 10px;
                    border-radius: 999px;
                    font-size: 0.78rem;
                    font-weight: 700;
                    letter-spacing: 0.2px;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.07);
                }
                .pill-completed {
                    background: rgba(56, 142, 60, 0.15);
                    color: #2e7d32;
                    border: 1px solid rgba(56, 142, 60, 0.35);
                }
                .pill-pending {
                    background: rgba(0, 121, 107, 0.12);
                    color: #00695c;
                    border: 1px solid rgba(0, 121, 107, 0.28);
                }
                @media (max-width: 1200px) {
                    .bookings-grid-5 { grid-template-columns: repeat(4, 1fr); }
                }
                @media (max-width: 992px) {
                    .bookings-grid-5 { grid-template-columns: repeat(3, 1fr); }
                }
                @media (max-width: 768px) {
                    .bookings-grid-5 { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 480px) {
                    .bookings-grid-5 { grid-template-columns: 1fr; }
                }
                .no-session-teal-glass {
                    color: #008080;
                    text-align: center;
                    font-size: 1.18rem;
                }
            `}</style>
        </div>
    );
}

