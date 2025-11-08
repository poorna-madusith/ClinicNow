'use client';

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";



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
            console.log('Fetch ongoing session error', { err, userId, url: `${API}/session/getcurrentOngoingSession/${userId}` });
            // If axios error has response with message, prefer that
            const axiosErr = err as { response?: { data?: Record<string, unknown> }; message?: string };
            const data = axiosErr.response?.data as Record<string, unknown> | undefined;
            let serverMessage = "Failed to fetch ongoing session";
            if (data) {
                const m = data['message'] ?? data['Message'];
                if (typeof m === 'string') serverMessage = m;
            } else if (axiosErr?.message && typeof axiosErr.message === 'string') {
                serverMessage = axiosErr.message;
            }
            console.log(serverMessage);
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

    const handleMarkSessionCompleted = async (sessionId: number) => {
        try{
            await axios.patch(`${API}/session/marksessioncompleted/${sessionId}`,{},{
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            toast.success("Session marked as completed");
            fetchOnGoingSession(); // refresh the data
            setOnGoingSession(null);
        }catch(err){
            console.log({err});
            toast.error("Failed to mark session as completed");
        }
    }

    const handleOngoingBooking = async (bookingId: number) => {
        try {
            await axios.patch(`${API}/session/markbookingongoing/${bookingId}`, {}, {
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
        <ProtectedRoute allowedRoles={["Doctor"]}>
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
            {/* Button to mark the whole session as completed (only when ongoing and not already completed) */}
            {ongoingSession && ongoingSession.ongoing && (
                <div className="session-complete-button-container">
                    <button
                        className="mark-session-button"
                        onClick={() => handleMarkSessionCompleted(ongoingSession.id)}
                        title="Mark entire session as completed"
                        aria-label="Mark session completed"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '8px' }}>
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                        </svg>
                        Complete Session
                    </button>
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
                                    <li key={booking.id} className={`booking-card-square ${booking.completed ? 'is-completed' : booking.onGoing ? 'is-ongoing' : 'is-pending'}`}>
                                        <div className="card-queue-badge">{booking.positionInQueue ?? '-'}</div>
                                        <div className="card-content">
                                            <div className="card-name">{booking.patient?.firstName ?? booking.patientName?.split(' ')[0] ?? booking.patientId}</div>
                                            <div className="card-email">{booking.patient?.email ?? '-'}</div>
                                            <div className="card-phone">{booking.patient?.phoneNumber ?? (booking.patient?.contactNumbers && booking.patient.contactNumbers.length > 0 ? booking.patient.contactNumbers[0] : '-')}</div>
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
                                        <div className={`status-pill ${booking.completed ? 'pill-completed' : booking.onGoing ? 'pill-ongoing' : 'pill-pending'}`}>
                                            {booking.completed ? 'Completed' : booking.onGoing ? 'Ongoing' : 'Pending'}
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
                    gap: 20px;
                    margin-bottom: 40px;
                }
                .session-grid-item {
                    background: linear-gradient(135deg, rgba(224,242,241,0.9) 0%, rgba(178,223,219,0.7) 100%);
                    border-radius: 16px;
                    box-shadow: 0 4px 16px rgba(0,150,136,0.15),
                                0 2px 4px rgba(0,150,136,0.08);
                    padding: 24px 22px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    min-width: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 2px solid rgba(0,150,136,0.2);
                    position: relative;
                    overflow: hidden;
                }
                .session-grid-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: linear-gradient(90deg, #00897b, #00acc1, #26c6da);
                    opacity: 0.6;
                    transition: opacity 0.3s ease;
                }
                .session-grid-item:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 28px rgba(0,150,136,0.25),
                                0 4px 8px rgba(0,150,136,0.15);
                    border-color: rgba(0,150,136,0.35);
                    background: linear-gradient(135deg, rgba(224,242,241,1) 0%, rgba(178,223,219,0.85) 100%);
                }
                .session-grid-item:hover::before {
                    opacity: 1;
                }
                .full-width {
                    grid-column: 1 / -1;
                }
                .session-label-glass {
                    color: #00695c;
                    font-weight: 600;
                    font-size: 0.85rem;
                    margin-bottom: 8px;
                    letter-spacing: 0.8px;
                    text-transform: uppercase;
                    opacity: 0.9;
                }
                .session-value-glass {
                    color: #004d40;
                    font-size: 1.25rem;
                    font-weight: 700;
                    word-break: break-word;
                    line-height: 1.4;
                }
                .ongoing-session-container-teal-glass {
                    max-width: 1280px;
                    margin: 48px auto;
                    padding: 56px 48px;
                    background: linear-gradient(135deg, rgba(224,242,241,0.95) 0%, rgba(178,223,219,0.9) 50%, rgba(128,203,196,0.85) 100%);
                    border-radius: 32px;
                    box-shadow: 0 20px 60px rgba(0, 128, 128, 0.18),
                                0 8px 24px rgba(0, 128, 128, 0.12);
                    backdrop-filter: blur(16px);
                    border: 2px solid rgba(0,150,136,0.25);
                    position: relative;
                    overflow: hidden;
                }
                .ongoing-session-container-teal-glass::after {
                    content: "";
                    position: absolute;
                    top: -50%;
                    right: -10%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(0,188,212,0.15) 0%, transparent 70%);
                    pointer-events: none;
                }
                .ongoing-session-container-teal-glass:before {
                    content: "";
                    position: absolute;
                    inset: -2px;
                    border-radius: 34px;
                    padding: 2px;
                    background: linear-gradient(135deg, rgba(0,150,136,0.4), rgba(0,188,212,0.3), rgba(38,198,218,0.35));
                    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
                    -webkit-mask-composite: xor;
                            mask-composite: exclude;
                    pointer-events: none;
                    z-index: 0;
                }
                .teal-title-glass {
                    color: #00695c;
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin-bottom: 24px;
                    text-align: center;
                    letter-spacing: -0.5px;
                    text-shadow: 0 2px 12px rgba(0,150,136,0.25), 0 4px 24px rgba(0,188,212,0.15);
                    position: relative;
                    z-index: 1;
                    background: linear-gradient(135deg, #00796b 0%, #00897b 50%, #26a69a 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .session-meta-chips {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 32px;
                    flex-wrap: wrap;
                    position: relative;
                    z-index: 1;
                }
                .chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255,255,255,0.95);
                    border: 2px solid rgba(0,150,136,0.3);
                    color: #00695c;
                    padding: 12px 20px;
                    border-radius: 24px;
                    box-shadow: 0 4px 16px rgba(0,150,136,0.15),
                                0 2px 4px rgba(0,150,136,0.1);
                    font-weight: 600;
                    font-size: 0.95rem;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(8px);
                }
                .chip:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,150,136,0.25),
                                0 4px 8px rgba(0,150,136,0.15);
                    border-color: rgba(0,150,136,0.45);
                    background: rgba(224,242,241,0.95);
                }
                .chip strong { 
                    color: #00695c; 
                    font-weight: 800;
                    font-size: 1.1rem;
                }
                .chip-primary { 
                    background: linear-gradient(135deg, rgba(178,223,219,0.6) 0%, rgba(224,247,250,0.8) 100%);
                    border-color: rgba(0,188,212,0.4);
                }
                .chip-primary:hover {
                    background: linear-gradient(135deg, rgba(178,223,219,0.8) 0%, rgba(224,247,250,0.95) 100%);
                }
                .chip-success { 
                    background: linear-gradient(135deg, rgba(165,214,167,0.5) 0%, rgba(200,230,201,0.75) 100%);
                    border-color: rgba(76,175,80,0.4);
                }
                .chip-success:hover {
                    background: linear-gradient(135deg, rgba(165,214,167,0.7) 0%, rgba(200,230,201,0.9) 100%);
                }
                .chip-warning { 
                    background: linear-gradient(135deg, rgba(255,204,128,0.5) 0%, rgba(255,224,178,0.75) 100%);
                    border-color: rgba(255,152,0,0.4);
                }
                .chip-warning:hover {
                    background: linear-gradient(135deg, rgba(255,204,128,0.7) 0%, rgba(255,224,178,0.9) 100%);
                }
                .chip-dot {
                    width: 10px; 
                    height: 10px; 
                    border-radius: 50%; 
                    background: #00acc1; 
                    display: inline-block;
                    box-shadow: 0 2px 8px rgba(0,172,193,0.5), 0 0 12px rgba(0,188,212,0.3);
                    animation: pulse-dot 2s ease-in-out infinite;
                }
                @keyframes pulse-dot {
                    0%, 100% { box-shadow: 0 2px 8px rgba(0,172,193,0.5), 0 0 12px rgba(0,188,212,0.3); }
                    50% { box-shadow: 0 2px 12px rgba(0,172,193,0.7), 0 0 20px rgba(0,188,212,0.5); }
                }
                .chip-success .chip-dot { 
                    background: #4caf50;
                    box-shadow: 0 2px 8px rgba(76,175,80,0.5), 0 0 12px rgba(76,175,80,0.3);
                }
                .chip-warning .chip-dot { 
                    background: #ff9800;
                    box-shadow: 0 2px 8px rgba(255,152,0,0.5), 0 0 12px rgba(255,152,0,0.3);
                }
                .session-card-teal-glass {
                    background: linear-gradient(135deg, rgba(240,249,249,0.98) 0%, rgba(224,242,241,0.95) 100%);
                    border-radius: 24px;
                    box-shadow: 0 8px 32px rgba(0,150,136,0.15),
                                0 4px 12px rgba(0,150,136,0.1);
                    padding: 40px 36px;
                    border: 2px solid rgba(0,150,136,0.25);
                    position: relative;
                    z-index: 1;
                    backdrop-filter: blur(12px);
                }
                .session-complete-button-container {
                    position: absolute;
                    top: 24px;
                    right: 24px;
                    z-index: 10;
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
                    margin-top: 32px;
                }
                .teal-subtitle-glass {
                    color: #00695c;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 20px;
                    text-shadow: 0 2px 8px rgba(0,150,136,0.15);
                    letter-spacing: -0.3px;
                }
                .bookings-grid-5 {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 24px;
                }
                .booking-card-square {
                    position: relative;
                    background: linear-gradient(145deg, rgba(240,249,249,0.95) 0%, rgba(224,242,241,0.9) 100%);
                    border: 2px solid rgba(0,150,136,0.25);
                    border-radius: 20px;
                    box-shadow: 0 8px 24px rgba(0, 150, 136, 0.15), 
                                0 2px 8px rgba(0, 150, 136, 0.08);
                    padding: 24px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    aspect-ratio: 1 / 1.15;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    backdrop-filter: blur(10px);
                }
                .booking-card-square::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background: linear-gradient(90deg, #00796b, #00acc1);
                    opacity: 0.7;
                    transition: opacity 0.3s ease;
                }
                .booking-card-square:hover::before {
                    opacity: 1;
                }
                .booking-card-square:hover {
                    transform: translateY(-6px) scale(1.02);
                    box-shadow: 0 16px 40px rgba(0, 150, 136, 0.25), 
                                0 8px 16px rgba(0, 150, 136, 0.15);
                    border-color: rgba(0,150,136,0.4);
                    background: linear-gradient(145deg, rgba(224,242,241,1) 0%, rgba(178,223,219,0.95) 100%);
                }
                .booking-card-square.is-completed {
                    background: linear-gradient(145deg, #f1fdf6 0%, #e8f5e9 100%);
                    border-color: rgba(76, 175, 80, 0.3);
                }
                .booking-card-square.is-completed::before {
                    background: linear-gradient(90deg, #4caf50, #66bb6a);
                }
                .booking-card-square.is-pending {
                    background: linear-gradient(145deg, #fafffe 0%, #f0fffe 100%);
                    border-color: rgba(0, 188, 212, 0.2);
                }
                .booking-card-square.is-pending::before {
                    background: linear-gradient(90deg, #00bcd4, #26c6da);
                }
                .booking-card-square.is-ongoing {
                    background: linear-gradient(145deg, #fffbf5 0%, #fff8e1 100%);
                    border-color: rgba(255, 152, 0, 0.3);
                    box-shadow: 0 8px 24px rgba(255, 152, 0, 0.12), 
                                0 2px 8px rgba(255, 152, 0, 0.06);
                }
                .booking-card-square.is-ongoing::before {
                    background: linear-gradient(90deg, #ff9800, #ffb74d);
                }
                .card-queue-badge {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    width: 42px;
                    height: 42px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #00897b 0%, #00695c 100%);
                    color: #ffffff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    font-size: 1.1rem;
                    box-shadow: 0 4px 12px rgba(0,105,92,0.25),
                                inset 0 1px 0 rgba(255,255,255,0.2);
                    transition: transform 0.2s ease;
                }
                .booking-card-square:hover .card-queue-badge {
                    transform: scale(1.1) rotate(-5deg);
                }
                .card-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 8px;
                    width: 100%;
                }
                .card-name {
                    color: #00695c;
                    font-weight: 800;
                    font-size: 1.08rem;
                    line-height: 1.3;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    letter-spacing: 0.2px;
                }
                .card-email {
                    color: #00897b;
                    font-size: 0.88rem;
                    opacity: 0.85;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: 500;
                }
                .card-phone {
                    color: #26a69a;
                    font-size: 0.82rem;
                    opacity: 0.8;
                    max-width: 100%;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-weight: 500;
                    background: rgba(0,150,136,0.08);
                    padding: 4px 10px;
                    border-radius: 12px;
                }
                .complete-button {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #66bb6a 0%, #4caf50 50%, #43a047 100%);
                    color: #ffffff;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.4rem;
                    font-weight: bold;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(76, 175, 80, 0.3),
                                inset 0 1px 0 rgba(255,255,255,0.25);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .complete-button:hover {
                    transform: scale(1.15) rotate(5deg);
                    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.45),
                                inset 0 1px 0 rgba(255,255,255,0.3);
                    background: linear-gradient(135deg, #81c784 0%, #66bb6a 50%, #4caf50 100%);
                }
                .complete-button:active {
                    transform: scale(1.05);
                }
                .ongoing-button {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    width: 42px;
                    height: 42px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ffb74d 0%, #ffa726 50%, #ff9800 100%);
                    color: #ffffff;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1rem;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow: 0 4px 14px rgba(255, 152, 0, 0.35),
                                inset 0 1px 0 rgba(255,255,255,0.25);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    backdrop-filter: blur(4px);
                }
                .ongoing-button svg { 
                    display: block; 
                    color: #ffffff;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
                }
                .ongoing-button:hover {
                    transform: scale(1.15) rotate(-5deg);
                    box-shadow: 0 6px 20px rgba(255, 152, 0, 0.5),
                                inset 0 1px 0 rgba(255,255,255,0.3);
                    background: linear-gradient(135deg, #ffcc80 0%, #ffb74d 50%, #ffa726 100%);
                }
                .ongoing-button:active {
                    transform: scale(1.05);
                }
                .ongoing-button:focus {
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(255, 152, 0, 0.25),
                                0 4px 14px rgba(255, 152, 0, 0.35);
                }
                .mark-session-button {
                    background: linear-gradient(135deg, #26c6da 0%, #00acc1 50%, #00897b 100%);
                    color: #fff;
                    border: none;
                    padding: 14px 28px;
                    border-radius: 28px;
                    font-weight: 700;
                    font-size: 1rem;
                    letter-spacing: 0.3px;
                    cursor: pointer;
                    box-shadow: 0 6px 24px rgba(0,137,123,0.3),
                                0 2px 8px rgba(0,137,123,0.2);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                    border: 2px solid rgba(255,255,255,0.3);
                    position: relative;
                    overflow: hidden;
                }
                .mark-session-button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.2);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }
                .mark-session-button:hover::before {
                    width: 300px;
                    height: 300px;
                }
                .mark-session-button:hover {
                    transform: translateY(-3px) scale(1.03);
                    box-shadow: 0 12px 36px rgba(0,137,123,0.4),
                                0 6px 16px rgba(0,137,123,0.25);
                    background: linear-gradient(135deg, #4dd0e1 0%, #26c6da 50%, #00acc1 100%);
                }
                .mark-session-button:active {
                    transform: translateY(-1px) scale(0.98);
                }
                .mark-session-button svg {
                    position: relative;
                    z-index: 1;
                }
                .status-pill {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                    text-transform: uppercase;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                    backdrop-filter: blur(8px);
                    transition: all 0.2s ease;
                }
                .booking-card-square:hover .status-pill {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.12);
                }
                .pill-completed {
                    background: rgba(76, 175, 80, 0.15);
                    color: #2e7d32;
                    border: 1.5px solid rgba(76, 175, 80, 0.4);
                }
                .pill-pending {
                    background: rgba(0, 188, 212, 0.12);
                    color: #0097a7;
                    border: 1.5px solid rgba(0, 188, 212, 0.3);
                }
                .pill-ongoing {
                    background: rgba(255, 152, 0, 0.15);
                    color: #ef6c00;
                    border: 1.5px solid rgba(255, 152, 0, 0.4);
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
                    color: #00695c;
                    text-align: center;
                    font-size: 1.25rem;
                    font-weight: 600;
                    padding: 48px 24px;
                    background: linear-gradient(135deg, rgba(224,242,241,0.8) 0%, rgba(178,223,219,0.6) 100%);
                    border-radius: 20px;
                    border: 2px dashed rgba(0,150,136,0.4);
                    margin: 24px 0;
                    box-shadow: 0 4px 16px rgba(0,150,136,0.1);
                }
                .no-bookings-teal-glass {
                    color: #00695c;
                    text-align: center;
                    font-size: 1.1rem;
                    font-weight: 500;
                    padding: 40px 24px;
                    background: linear-gradient(135deg, rgba(178,223,219,0.3) 0%, rgba(224,242,241,0.4) 100%);
                    border-radius: 16px;
                    border: 2px dashed rgba(0,150,136,0.3);
                }
            `}</style>
            </div>
        </ProtectedRoute>
    );
}

