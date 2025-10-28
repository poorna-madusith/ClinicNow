"use-client";

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";

interface SessionFullViewProps {
  isModalOpen: boolean;
  isClose: () => void;
  session: Session;
  currentUserId?: string;
}

export default function SessionFullView({
  isModalOpen,
  isClose,
  session,
  currentUserId,
}: SessionFullViewProps) {
  const { userRole } = useAuth();

  if (!isModalOpen) {
    return null;
  }

  // Debug logging
  console.log("Session data:", session);
  console.log("Session bookings:", session.bookings);

  // Get patients from bookings if available, otherwise use patients array for backward compatibility
  const patients =
    session.bookings
      ?.map((booking) => booking.patient)
      .filter((p) => p != null) ||
    session.patients ||
    [];
  const bookedCount = patients.length;
  const availableSlots = session.capacity - bookedCount;
  const fillPercentage = (bookedCount / session.capacity) * 100;

  console.log("Extracted patients:", patients);
  console.log("Booked count:", bookedCount);

  return (
    <>
      <div className="modal-overlay" onClick={isClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          {/* Header Section */}
          <div className="modal-header">
            <div className="header-content">
              <div className="header-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h2 className="modal-title">Session Details</h2>
                <p className="modal-subtitle">
                  Complete information about this session
                </p>
              </div>
            </div>
            <button className="close-btn" onClick={isClose}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content Section */}
          <div className="modal-body">
            {/* Doctor Info Card */}

            {userRole === "Admin" && (
              <>
                <div className="info-card doctor-card">
                  <div className="card-header">
                    <svg
                      className="card-icon"
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
                    <h3>Doctor Information</h3>
                  </div>
                  <div className="card-content">
                    <p className="doctor-name">
                      {session.doctor?.firstName} {session.doctor?.lastName}
                    </p>
                    <p className="doctor-email">{session.doctor?.email}</p>
                  </div>
                </div>
              </>
            )}

            {/* Session Details Grid */}
            <div className="details-grid">
              <div className="detail-item">
                <div className="detail-icon date-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="detail-content">
                  <p className="detail-label">Date</p>
                  <p className="detail-value">
                    {new Date(session.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon time-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="detail-content">
                  <p className="detail-label">Time</p>
                  <p className="detail-value">
                    {new Date(
                      `1970-01-01T${session.startTime}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}{" "}
                    -{" "}
                    {new Date(
                      `1970-01-01T${session.endTime}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    })}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon fee-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="detail-content">
                  <p className="detail-label">Session Fee</p>
                  <p className="detail-value fee-value">
                    ${session.sessionFee}
                  </p>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon status-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {session.canceled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                </div>
                <div className="detail-content">
                  <p className="detail-label">Status</p>
                  <span
                    className={`status-badge ${
                      session.canceled ? "canceled" : "active"
                    }`}
                  >
                    {session.canceled ? "Canceled" : "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="info-card description-card">
              <div className="card-header">
                <svg
                  className="card-icon"
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
                <h3>Description</h3>
              </div>
              <div className="card-content">
                <p className="description-text">{session.description}</p>
              </div>
            </div>

            {/* Capacity Section */}
            <div className="info-card capacity-card">
              <div className="card-header">
                <svg
                  className="card-icon"
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
                <h3>Capacity</h3>
              </div>
              <div className="card-content">
                <div className="capacity-stats">
                  <div className="stat-item">
                    <p className="stat-number">{bookedCount}</p>
                    <p className="stat-label">Booked</p>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <p className="stat-number">{session.capacity}</p>
                    <p className="stat-label">Total</p>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <p
                      className={`stat-number ${
                        availableSlots === 0 ? "full" : ""
                      }`}
                    >
                      {availableSlots}
                    </p>
                    <p className="stat-label">Available</p>
                  </div>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{ width: `${fillPercentage}%` }}
                  ></div>
                </div>
                <p className="capacity-percentage">
                  {fillPercentage.toFixed(0)}% Full
                </p>
              </div>
            </div>

            {/* Patients Section */}
            <div className="info-card patients-card">
              <div className="card-header">
                <svg
                  className="card-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h3>Registered Patients</h3>
                <span className="patient-count">{bookedCount}</span>
              </div>
              <div className="card-content patients-list">
                {patients && patients.length > 0 ? (
                  patients.map((patient, index) => {
                    const isCurrentUser = currentUserId && patient?.id === currentUserId;
                    // Find the booking for this patient to get queue position
                    const booking = session.bookings?.find(b => b.patient?.id === patient?.id);
                    const queuePosition = booking?.positionInQueue;
                    
                    return (
                      <div 
                        key={patient?.id || index} 
                        className={`patient-item ${isCurrentUser ? 'current-user' : ''}`}
                      >
                        <div className="patient-avatar">
                          {patient?.firstName?.charAt(0)}
                          {patient?.lastName?.charAt(0)}
                        </div>
                        <div className="patient-info">
                          <p className="patient-name">
                            {patient?.firstName} {patient?.lastName}
                            {isCurrentUser && (
                              <span className="you-badge">This is You</span>
                            )}
                            {isCurrentUser && queuePosition && (
                              <span className="queue-badge">Queue #{queuePosition}</span>
                            )}
                          </p>
                          <p className="patient-email">{patient?.email}</p>
                          {patient?.contactNumbers &&
                            patient.contactNumbers.length > 0 && (
                              <p className="patient-contact">
                                <svg
                                  className="contact-icon"
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
                                {patient.contactNumbers.join(", ")}
                              </p>
                            )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-patients">
                    <svg
                      className="empty-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p>No patients have registered for this session yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="modal-footer">
            <button className="close-footer-btn" onClick={isClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(19, 78, 74, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-container {
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(20, 184, 166, 0.3);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.4s ease-out;
        }

        /* Header */
        .modal-header {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          padding: 28px 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid rgba(255, 255, 255, 0.2);
        }

        .header-content {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .header-icon svg {
          width: 28px;
          height: 28px;
          color: #ffffff;
        }

        .modal-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .modal-subtitle {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.85);
          margin: 4px 0 0 0;
          font-weight: 500;
        }

        .close-btn {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .close-btn svg {
          width: 20px;
          height: 20px;
          color: #ffffff;
        }

        /* Body */
        .modal-body {
          padding: 32px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .modal-body::-webkit-scrollbar {
          width: 8px;
        }

        .modal-body::-webkit-scrollbar-track {
          background: #f0fdfa;
        }

        .modal-body::-webkit-scrollbar-thumb {
          background: #5eead4;
          border-radius: 4px;
        }

        .modal-body::-webkit-scrollbar-thumb:hover {
          background: #2dd4bf;
        }

        /* Info Cards */
        .info-card {
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          border-radius: 16px;
          padding: 24px;
          border: 2px solid #99f6e4;
          transition: all 0.3s;
        }

        .info-card:hover {
          border-color: #5eead4;
          box-shadow: 0 4px 20px rgba(20, 184, 166, 0.15);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .card-icon {
          width: 24px;
          height: 24px;
          color: #14b8a6;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #134e4a;
          margin: 0;
          flex: 1;
        }

        .patient-count {
          background: #14b8a6;
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .card-content {
          color: #0f766e;
        }

        /* Doctor Card */
        .doctor-card {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border-color: #93c5fd;
        }

        .doctor-card:hover {
          border-color: #60a5fa;
        }

        .doctor-name {
          font-size: 1.3rem;
          font-weight: 700;
          color: #1e3a8a;
          margin: 0 0 8px 0;
        }

        .doctor-email {
          font-size: 0.95rem;
          color: #1e40af;
          margin: 0;
          opacity: 0.8;
        }

        /* Details Grid */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .detail-item {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          gap: 16px;
          align-items: center;
          border: 2px solid #e0f2fe;
          transition: all 0.3s;
        }

        .detail-item:hover {
          border-color: #5eead4;
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.1);
          transform: translateY(-2px);
        }

        .detail-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .detail-icon svg {
          width: 24px;
          height: 24px;
          color: #ffffff;
        }

        .date-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .time-icon {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .fee-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .status-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .detail-content {
          flex: 1;
        }

        .detail-label {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 4px 0;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          font-size: 1.05rem;
          color: #0f172a;
          margin: 0;
          font-weight: 700;
        }

        .fee-value {
          color: #059669;
          font-size: 1.3rem;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 700;
        }

        .status-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .status-badge.canceled {
          background: #fee2e2;
          color: #991b1b;
        }

        /* Description Card */
        .description-text {
          font-size: 1rem;
          line-height: 1.7;
          color: #0f766e;
          margin: 0;
        }

        /* Capacity Card */
        .capacity-stats {
          display: flex;
          justify-content: space-around;
          align-items: center;
          margin-bottom: 20px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: #134e4a;
          margin: 0 0 4px 0;
        }

        .stat-number.full {
          color: #dc2626;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #0f766e;
          margin: 0;
          font-weight: 600;
        }

        .stat-divider {
          width: 2px;
          height: 40px;
          background: linear-gradient(
            180deg,
            transparent 0%,
            #99f6e4 50%,
            transparent 100%
          );
        }

        .progress-bar-container {
          width: 100%;
          height: 12px;
          background: #ccfbf1;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
          border-radius: 6px;
          transition: width 0.5s ease;
        }

        .capacity-percentage {
          text-align: center;
          font-size: 0.9rem;
          color: #0f766e;
          margin: 0;
          font-weight: 700;
        }

        /* Patients List */
        .patients-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
        }

        .patient-item {
          background: #ffffff;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          gap: 14px;
          align-items: center;
          border: 2px solid #e0f2fe;
          transition: all 0.2s;
        }

        .patient-item:hover {
          border-color: #5eead4;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.1);
        }

        .patient-item.current-user {
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          border: 2px solid #14b8a6;
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.2);
          position: relative;
        }

        .patient-item.current-user::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(135deg, #14b8a6, #0d9488);
          border-radius: 12px;
          z-index: -1;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.3;
          }
        }

        .patient-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
          border: 3px solid #99f6e4;
        }

        .patient-item.current-user .patient-avatar {
          border: 3px solid #14b8a6;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.3);
        }

        .patient-info {
          flex: 1;
        }

        .patient-name {
          font-size: 1rem;
          font-weight: 700;
          color: #134e4a;
          margin: 0 0 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .you-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 6px rgba(20, 184, 166, 0.3);
          animation: slideInRight 0.5s ease-out;
        }

        .queue-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 6px rgba(245, 158, 11, 0.3);
          animation: slideInRight 0.6s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .patient-email {
          font-size: 0.85rem;
          color: #0f766e;
          margin: 0;
          opacity: 0.8;
        }

        .patient-contact {
          font-size: 0.85rem;
          color: #0d9488;
          margin: 4px 0 0 0;
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 500;
        }

        .contact-icon {
          width: 14px;
          height: 14px;
          color: #14b8a6;
        }

        .empty-patients {
          text-align: center;
          padding: 40px 20px;
          color: #0f766e;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: #5eead4;
          margin: 0 auto 16px;
        }

        .empty-patients p {
          font-size: 1rem;
          margin: 0;
        }

        /* Footer */
        .modal-footer {
          padding: 24px 32px;
          border-top: 2px solid #f0fdfa;
          display: flex;
          justify-content: flex-end;
          background: #ffffff;
        }

        .close-footer-btn {
          padding: 12px 32px;
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 16px rgba(20, 184, 166, 0.25);
        }

        .close-footer-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(20, 184, 166, 0.35);
        }

        .close-footer-btn:active {
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .modal-container {
            max-width: 95vw;
            border-radius: 16px;
          }

          .modal-header {
            padding: 20px;
          }

          .header-icon {
            width: 40px;
            height: 40px;
          }

          .header-icon svg {
            width: 22px;
            height: 22px;
          }

          .modal-title {
            font-size: 1.4rem;
          }

          .modal-subtitle {
            font-size: 0.8rem;
          }

          .modal-body {
            padding: 20px;
            gap: 16px;
          }

          .details-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .info-card {
            padding: 16px;
          }

          .modal-footer {
            padding: 16px 20px;
          }

          .close-footer-btn {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
