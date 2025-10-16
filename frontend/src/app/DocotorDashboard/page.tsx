'use client';

import { useAuth } from "@/Context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { Session } from "@/types/Session";

export default function DoctorDashboard() {
  const [formData, setFormData] = useState({
    DoctorId: "",
    Capacity: 0,
    StartTime: "",
    EndTime: "",
    Date: "",
    SessionFee: 0,
    Description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { accessToken,decodedToken,userId} = useAuth();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [sessions, setSessions] = useState<Session[]>([]);


  const fetchSessions = async () => {
    try{
      const res = await axios.get(
        `${API}/session/getallsessions`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`, 
          },
        }
      )
      console.log("Sessions fetched:", res.data);
      setSessions(res.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  }


  useEffect(()=>{
    console.log("token" + accessToken);
    console.log(userId);
    fetchSessions();
  },[accessToken, decodedToken]);



  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if(!formData.Date) {
      newErrors.Date = "Date is required";
    }
    if(!formData.SessionFee && formData.SessionFee !== 0) {
      newErrors.SessionFee = "Session fee is required";
    }
    if(!formData.StartTime) {
      newErrors.StartTime = "Start time is required";
    }
    if(!formData.EndTime) {
      newErrors.EndTime = "End time is required";
    }
    if(!formData.Capacity){
      newErrors.Capacity = "Capacity is required";
    }
    if(!formData.Capacity || formData.Capacity <= 0) {
      newErrors.Capacity = "Capacity must be greater than 0";
    }
    if(!formData.Description) {
      newErrors.Description = "Description is required";
    }

    // Time range validation: End time must be after Start time
    if (formData.StartTime && formData.EndTime) {
      const [sh, sm = "0"] = formData.StartTime.split(":");
      const [eh, em = "0"] = formData.EndTime.split(":");
      const startMinutes = parseInt(sh) * 60 + parseInt(sm);
      const endMinutes = parseInt(eh) * 60 + parseInt(em);
      if (!isNaN(startMinutes) && !isNaN(endMinutes) && endMinutes <= startMinutes) {
        newErrors.EndTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { isValid, errors: vErrors } = validateForm();
    if(!isValid) {
      setLoading(false);
      if (vErrors.EndTime === "End time must be after start time") {
        toast.error(vErrors.EndTime);
      } else {
        toast.error("Please fill in all required fields correctly");
      }
      return;
    }

    try {
      const res = await axios.post(
        `${API}/session/addsession`,
        {
          ...formData,
          DoctorId: userId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Session created:", res.data);
      toast.success("Session created successfully");
      fetchSessions();
    } catch (err: any) {
      console.error("Error creating session:", err);
      const backendMessage = err?.response?.data?.Message || err?.response?.data?.message;
      if (backendMessage) {
        toast.error(String(backendMessage));
      } else {
        toast.error("Error creating session");
      }
    } finally {
      setLoading(false);
      setIsModalOpen(false);
      setFormData({
        DoctorId: "",
        Capacity: 0,
        StartTime: "",
        EndTime: "",
        Date: "",
        SessionFee: 0,
        Description: "",
      });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      DoctorId: "",
      Capacity: 0,
      StartTime: "",
      EndTime: "",
      Date: "",
      SessionFee: 0,
      Description: "",
    })
  }

  return (
    <div className="doctor-dashboard-container">
      <div className="dashboard-header">
        <div className="title-section">
          <h1 className="dashboard-title">Doctor Dashboard</h1>
          <p className="dashboard-subtitle">Manage your appointments and sessions</p>
        </div>
        <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Session
        </button>
      </div>
      <div className="sessions-container">
        {sessions.length > 0 ? (
          <div className="sessions-grid">
            {sessions.map((session, index) => {
              const bookedCount = session.patients ? session.patients.length : 0;
              const availableSlots = session.capacity - bookedCount;
              const fillPercentage = (bookedCount / session.capacity) * 100;
              
              return (
                <div key={session.id || index} className="session-card">
                  <div className="session-header">
                    <div className="session-date-badge">
                      <svg className="calendar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{new Date(session.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}</span>
                    </div>
                    <div className="session-fee">
                      ${session.sessionFee}
                    </div>
                  </div>

                  <div className="session-body">
                    <div className="session-time">
                      <svg className="clock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{session.startTime} - {session.endTime}</span>
                    </div>

                    <div className="session-description">
                      <p>{session.description.length > 90 ? session.description.substring(0, 90) + "..." : session.description}</p>
                    </div>

                    <div className="session-capacity-section">
                      <div className="capacity-header">
                        <div className="capacity-info">
                          <svg className="users-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="capacity-text">
                            <strong>{bookedCount}</strong> / {session.capacity} Patients
                          </span>
                        </div>
                        <span className={`availability-badge ${availableSlots === 0 ? 'full' : availableSlots <= 3 ? 'low' : 'available'}`}>
                          {availableSlots === 0 ? 'Full' : `${availableSlots} slots left`}
                        </span>
                      </div>
                      
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="session-footer">
                    <button className="view-details-btn">
                      View More
                    </button>
                    <button className="manage-btn">
                      Edit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3>No Sessions Yet</h3>
            <p>Create your first session to start scheduling appointments</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={() => handleCloseModal()}>&times;</button>
            <h2 className="modal-title">Create Session</h2>
            <form className="session-form" onSubmit={handleSubmit}>
              {/* Row 1: Date and Session Fee */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="Date">Date:</label>
                  <input
                    type="date"
                    id="Date"
                    name="Date"
                    value={formData?.Date || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, Date: e.target.value })
                    }
                    
                  />
                  {errors.Date && (<p className="text-red-500 text-sm mt-1">{errors.Date}</p>)}
                </div>
                <div className="form-field">
                  <label htmlFor="SessionFee">Session Fee:</label>
                  <input
                    type="number"
                    id="SessionFee"
                    name="SessionFee"
                    value={formData?.SessionFee || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, SessionFee: parseInt(e.target.value) })
                    }
                    min={0}
                    
                  />
                  {errors.SessionFee && (<p className="text-red-500 text-sm mt-1">{errors.SessionFee}</p>)}
                </div>
              </div>

              {/* Row 2: Start Time and End Time */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="StartTime">Start Time:</label>
                  <input
                    type="time"
                    id="StartTime"
                    name="StartTime"
                    value={formData?.StartTime || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        StartTime: e.target.value,
                      })
                    }
                  />
                  {errors.StartTime && (<p className="text-red-500 text-sm mt-1">{errors.StartTime}</p>)}
                  
                </div>
                <div className="form-field">
                  <label htmlFor="EndTime">End Time:</label>
                  <input
                    type="time"
                    id="EndTime"
                    name="EndTime"
                    value={formData?.EndTime || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        EndTime: e.target.value,
                      })
                    }
                    
                  />
                  {errors.EndTime && (<p className="text-red-500 text-sm mt-1">{errors.EndTime}</p>)}
                </div>
              </div>

              {/* Row 3: Capacity */}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="Capacity">Capacity:</label>
                  <input
                    type="number"
                    id="Capacity"
                    name="Capacity"
                    value={formData?.Capacity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        Capacity: parseInt(e.target.value),
                      })
                    }
                    min={1}
                    
                  />
                  {errors.Capacity && (<p className="text-red-500 text-sm mt-1">{errors.Capacity}</p>)}
                </div>
              </div>

              {/* Full Width: Description */}
              <div className="form-field full-width">
                <label htmlFor="Description">Description:</label>
                <textarea
                  id="Description"
                  name="Description"
                  value={formData?.Description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, Description: e.target.value })
                  }
                  rows={3}
                  
                />
                {errors.Description && (<p className="text-red-500 text-sm mt-1">{errors.Description}</p>)}
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Session"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Elegant CSS styles for the dashboard and modal */}
      <style jsx>{`
        .doctor-dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6fffa 0%, #f0fdfa 100%);
          padding: 40px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        /* Dashboard Header */
        .dashboard-header {
          width: 100%;
          max-width: 1400px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 48px;
          padding: 0 20px;
        }
        
        .title-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .dashboard-title {
          font-size: 3rem;
          font-weight: 800;
          background: linear-gradient(135deg, #134e4a 0%, #14b8a6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
          letter-spacing: -0.5px;
          line-height: 1.2;
        }
        
        .dashboard-subtitle {
          font-size: 1.1rem;
          color: #0f766e;
          font-weight: 500;
          margin: 0;
          opacity: 0.85;
        }
        
        .open-modal-btn {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 1.05rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(20, 184, 166, 0.25);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          overflow: hidden;
        }
        
        .open-modal-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        .open-modal-btn:hover::before {
          left: 100%;
        }
        
        .open-modal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(20, 184, 166, 0.35);
        }
        
        .open-modal-btn:active {
          transform: translateY(0);
        }
        
        .btn-icon {
          width: 20px;
          height: 20px;
          stroke-width: 2.5;
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 24px;
            align-items: flex-start;
          }
          
          .dashboard-title {
            font-size: 2.2rem;
          }
          
          .dashboard-subtitle {
            font-size: 1rem;
          }
          
          .open-modal-btn {
            width: 100%;
            justify-content: center;
          }
        }
        
        /* Sessions Container */
        .sessions-container {
          width: 100%;
          max-width: 1400px;
          padding: 0 20px;
        }
        
        .sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
          width: 100%;
        }
        
        /* Session Card */
        .session-card {
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(20, 184, 166, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #ccfbf1;
        }
        
        .session-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(20, 184, 166, 0.15);
        }
        
        /* Session Header */
        .session-header {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .session-date-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .calendar-icon {
          width: 20px;
          height: 20px;
        }
        
        .session-fee {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          padding: 8px 16px;
          border-radius: 20px;
          color: #ffffff;
          font-weight: 700;
          font-size: 1.1rem;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        /* Session Body */
        .session-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .session-time {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #0f766e;
          font-weight: 600;
          font-size: 1rem;
        }
        
        .clock-icon {
          width: 20px;
          height: 20px;
          color: #14b8a6;
        }
        
        .session-description {
          color: #134e4a;
          line-height: 1.6;
          font-size: 0.95rem;
          min-height: 60px;
        }
        
        .session-description p {
          margin: 0;
        }
        
        /* Capacity Section */
        .session-capacity-section {
          background: #f0fdfa;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #99f6e4;
        }
        
        .capacity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .capacity-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0f766e;
        }
        
        .users-icon {
          width: 20px;
          height: 20px;
          color: #14b8a6;
        }
        
        .capacity-text {
          font-size: 0.95rem;
        }
        
        .capacity-text strong {
          font-size: 1.1rem;
          color: #134e4a;
        }
        
        .availability-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        .availability-badge.available {
          background: #d1fae5;
          color: #065f46;
        }
        
        .availability-badge.low {
          background: #fed7aa;
          color: #92400e;
        }
        
        .availability-badge.full {
          background: #fecaca;
          color: #991b1b;
        }
        
        /* Progress Bar */
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #ccfbf1;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
          transition: width 0.3s ease;
          border-radius: 4px;
        }
        
        /* Session Footer */
        .session-footer {
          padding: 0 24px 24px 24px;
          display: flex;
          gap: 12px;
        }
        
        .view-details-btn,
        .manage-btn {
          flex: 1;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }
        
        .view-details-btn {
          background: #ffffff;
          color: #14b8a6;
          border: 2px solid #14b8a6;
        }
        
        .view-details-btn:hover {
          background: #f0fdfa;
        }
        
        .manage-btn {
          background: #14b8a6;
          color: #ffffff;
        }
        
        .manage-btn:hover {
          background: #0d9488;
        }
        
        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(20, 184, 166, 0.08);
          border: 2px dashed #99f6e4;
        }
        
        .empty-icon {
          width: 64px;
          height: 64px;
          color: #5eead4;
          margin-bottom: 20px;
        }
        
        .empty-state h3 {
          font-size: 1.5rem;
          color: #134e4a;
          margin: 0 0 12px 0;
          font-weight: 700;
        }
        
        .empty-state p {
          color: #0f766e;
          font-size: 1rem;
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .sessions-grid {
            grid-template-columns: 1fr;
          }
          
          .session-footer {
            flex-direction: column;
          }
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(19, 78, 74, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 8px 32px rgba(20, 184, 166, 0.18);
          padding: 38px 34px 30px 34px;
          min-width: 500px;
          max-width: 95vw;
          position: relative;
          animation: fadeIn 0.3s;
        }
        .close-modal-btn {
          position: absolute;
          top: 18px;
          right: 18px;
          background: none;
          border: none;
          font-size: 1.7rem;
          color: #0d9488;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-modal-btn:hover {
          color: #f43f5e;
        }
        .modal-title {
          font-size: 1.7rem;
          font-weight: 700;
          color: #134e4a;
          margin-bottom: 20px;
          text-align: center;
        }
        .session-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .form-field.full-width {
          grid-column: 1 / -1;
        }
        .session-form label {
          font-size: 0.95rem;
          color: #0f766e;
          font-weight: 500;
          margin-bottom: 2px;
        }
        .session-form input,
        .session-form textarea {
          padding: 10px 14px;
          border: 1px solid #5eead4;
          border-radius: 8px;
          font-size: 1rem;
          background: #f0fdfa;
          color: #134e4a;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .session-form input:focus,
        .session-form textarea:focus {
          border: 2px solid #14b8a6;
          box-shadow: 0 0 0 2px #5eead4;
        }
        @media (max-width: 640px) {
          .form-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .modal-content {
            min-width: 300px;
            padding: 28px 20px 24px 20px;
          }
        }
        .submit-btn {
          margin-top: 12px;
          background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
          color: #fff;
          border: none;
          padding: 12px 0;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.08);
          transition: background 0.2s;
        }
        .submit-btn:disabled {
          background: #99f6e4;
          cursor: not-allowed;
        }
        .submit-btn:hover:not(:disabled) {
          background: #0d9488;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
