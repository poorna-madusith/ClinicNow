'use client';

import { useAuth } from "@/Context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState, useCallback } from "react";
import { Session } from "@/types/Session";
import SessionFullView from "@/components/SessionFullView";

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
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { accessToken,decodedToken,userId} = useAuth();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [openFullSessionView, setOpenFullSessionView] = useState<boolean>(false);
  const [fullViewSession, setFullViewSession] = useState<Session | null>(null);
  const [tabState, setTabState] = useState<'active' | 'canceled' | 'completed'>('active');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);


   useEffect(() => {
    let result = sessions;

    // Filter by tab state
    if (tabState === 'canceled') {
      result = result.filter((session) => session.canceled);
    } else if (tabState === 'completed') {
      result = result.filter((session) => session.completed);
    } else {
      // Active sessions: not canceled and not completed
      result = result.filter((session) => !session.canceled && !session.completed && !session.ongoing);
    }

    // Filter by date
    if (date) {
      result = result.filter((session) => session.date.includes(date));
    }

    setFilteredSessions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [date, sessions, tabState]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleOpenFullView = (session: Session) => {
    setFullViewSession(session);
    setOpenFullSessionView(true);
  };

  const handleCloseFullView = () => {
    setFullViewSession(null);
    setOpenFullSessionView(false);
  };

  const handleOngoingSession  = async (sessionId: string) => {
    try{
      await axios.patch(`${API}/session/setsessionongoing/${sessionId}`,{},{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Session set to ongoing successfully");
      fetchSessions();
    } catch (error) {
      console.log("Error setting session to ongoing:", error);
      const backendMessage = (error as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.Message || (error as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.message;
      if (backendMessage) {
        toast.error(String(backendMessage));
      } else {
        toast.error("Failed to set session to ongoing");
      }
    }
  }



  const cancelSession = async (sessionId: string) => {
    try{
      await axios.patch(`${API}/session/cancelsession/${sessionId}`,{},{
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Session canceled successfully");
      fetchSessions();
    } catch (error) {
      console.error("Error canceling session:", error);
      const backendMessage = (error as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.Message || (error as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.message;
      if (backendMessage) {
        toast.error(String(backendMessage));
      } else {
        toast.error("Failed to cancel session");
      }
    }
  }



  const fetchSessions = useCallback(async () => {
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
      // Get all sessions - filtering is now done by the toggle button
      setSessions(res.data);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      const backendMessage = (error as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.Message || (error as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.message;
      if (backendMessage) {
        toast.error(String(backendMessage));
      } else {
        toast.error("Failed to fetch sessions");
      }
    }
  }, [API, accessToken]);

  const handleEditClick = (session :Session) => {
    setEditSession(session);
    setEditModalOpen(true);

    const date = new Date(session.date);
    const formattedDate = date.toISOString().split('T')[0]; // Format to YYYY-MM-DD

    setFormData({
      DoctorId: session.doctorId || "",
      Capacity: session.capacity || 0,
      StartTime: session.startTime || "",
      EndTime: session.endTime || "",
      Date: formattedDate,
      SessionFee: session.sessionFee || 0,
      Description: session.description || "",
    });    
  }

  const handleEditSubmit = async (e:React.FormEvent) => {
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

    try{
      const res = await axios.put(`${API}/session/editsession/${editSession?.id}`, {
        ...formData,
        DoctorId: userId,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Session edited:", res.data);
      toast.success("Session updated successfully");
      fetchSessions();
    } catch (err) {
      console.error("Error editing session:", err);
      const backendMessage = (err as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.Message || (err as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.message;
      if (backendMessage) {
        toast.error(String(backendMessage));
      } else {
        toast.error("Error editing session");
      }
    } finally {
      setLoading(false);
      setEditModalOpen(false);
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
  }


  useEffect(()=>{
    console.log("token" + accessToken);
    console.log(userId);
    fetchSessions();
  },[accessToken, decodedToken, userId, fetchSessions]);



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
    } catch (err) {
      console.error("Error creating session:", err);
      const backendMessage = (err as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.Message || (err as { response?: { data?: { Message?: string; message?: string } } })?.response?.data?.message;
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
    setEditModalOpen(false);
    setEditSession(null);
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

      {/* Filter Section */}
      <div className="filter-section">
        <div className="filter-controls">
          <div className="date-filter">
            <label htmlFor="date-filter">Filter by Date:</label>
            <input
              type="date"
              id="date-filter"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="date-input"
            />
            {date && (
              <button
                className="clear-date-btn"
                onClick={() => setDate("")}
                title="Clear date filter"
              >
                ✕
              </button>
            )}
          </div>

          <div className="status-toggle">
            <button
              className={`toggle-btn ${tabState === 'active' ? 'active' : ''}`}
              onClick={() => setTabState('active')}
            >
              Active Sessions
            </button>
            <button
              className={`toggle-btn ${tabState === 'canceled' ? 'active' : ''}`}
              onClick={() => setTabState('canceled')}
            >
              Canceled Sessions
            </button>
            <button
              className={`toggle-btn ${tabState === 'completed' ? 'active' : ''}`}
              onClick={() => setTabState('completed')}
            >
              Completed Sessions
            </button>
          </div>
        </div>

        <div className="filter-info">
          <span className="results-count">
            Showing {currentSessions.length} of {filteredSessions.length} sessions
          </span>
        </div>
      </div>

      <div className="sessions-container">
        {filteredSessions.length > 0 ? (
          <div className="sessions-grid">
            {currentSessions.map((session, index) => {
              // Get patients from bookings if available, otherwise use patients array for backward compatibility
              const bookedCount = session.bookings?.length || session.patients?.length || 0;
              const availableSlots = session.capacity - bookedCount;
              const fillPercentage = (bookedCount / session.capacity) * 100;
              
              return (
                <div key={session.id || index} className={`session-card ${session.canceled ? 'canceled-session' : ''}`}>
                  <div className="session-header">
                    <div className="header-content">
                      <div className="session-date-time">
                        <div className="date-section">
                          <svg className="calendar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="date-text">{new Date(session.date).toLocaleDateString('en-US', { 
                            weekday: 'short', 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                        <div className="time-section">
                          <svg className="clock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="time-text">{new Date(`1970-01-01T${session.startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })} - {new Date(`1970-01-01T${session.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })}</span>
                        </div>
                      </div>
                      {session.canceled && (
                        <div className="canceled-badge">
                          <svg className="canceled-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Canceled
                        </div>
                      )}
                      {session.completed && !session.canceled && (
                        <div className="completed-badge">
                          <svg className="completed-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Completed
                        </div>
                      )}
                      {!session.canceled && !session.completed && (
                        <div className="scheduled-badge">
                          <svg className="scheduled-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Scheduled
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="session-body">
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
                    <button className="action-btn view-btn" onClick={() => handleOpenFullView(session)}>
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    {!session.canceled && !session.completed && (
                      <>
                        <button className="action-btn edit-btn" onClick={() => handleEditClick(session)}>
                          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button className="action-btn ongoing-btn" onClick={() => handleOngoingSession(session.id.toString())}>
                          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Start
                        </button>
                        <button className="action-btn cancel-btn" onClick={() => cancelSession(session.id.toString())}>
                          <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Cancel
                        </button>
                      </>
                    )}
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

        {/* Pagination */}
        {filteredSessions.length > 0 && totalPages > 1 && (
          <div className="pagination-container">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>

            <div className="pagination-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}
            </div>

            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
              <svg className="pagination-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {(isModalOpen || editModalOpen) && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={handleCloseModal}>&times;</button>
            <h2 className="modal-title">{editModalOpen ? "Edit Session" : "Create Session"}</h2>
            <form className="session-form" onSubmit={editModalOpen? handleEditSubmit : handleSubmit}>
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
                {loading ? (editModalOpen ? "Updating..." : "Creating...") : (editModalOpen ? "Update Session" : "Create Session")}
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
        
        /* Filter Section */
        .filter-section {
          width: 100%;
          max-width: 1400px;
          padding: 0 20px;
          margin-bottom: 32px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(20, 184, 166, 0.08);
          border: 1px solid #ccfbf1;
        }
        
        .filter-controls {
          display: flex;
          gap: 24px;
          align-items: flex-end;
          padding: 24px;
          flex-wrap: wrap;
        }
        
        .date-filter {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
          min-width: 250px;
          position: relative;
        }
        
        .date-filter label {
          font-size: 0.95rem;
          color: #0f766e;
          font-weight: 600;
        }
        
        .date-input {
          padding: 10px 14px;
          border: 2px solid #99f6e4;
          border-radius: 10px;
          font-size: 1rem;
          background: #f0fdfa;
          color: #134e4a;
          outline: none;
          transition: all 0.2s;
          cursor: pointer;
        }
        
        .date-input:focus {
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
        }
        
        .clear-date-btn {
          position: absolute;
          right: 12px;
          bottom: 12px;
          background: #14b8a6;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .clear-date-btn:hover {
          background: #0d9488;
          transform: scale(1.1);
        }
        
        .status-toggle {
          display: flex;
          gap: 8px;
          background: #f0fdfa;
          padding: 4px;
          border-radius: 10px;
          border: 2px solid #99f6e4;
        }
        
        .toggle-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #0f766e;
        }
        
        .toggle-btn.active {
          background: #14b8a6;
          color: white;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.25);
        }
        
        .toggle-btn:hover:not(.active) {
          background: #ccfbf1;
        }
        
        .filter-info {
          padding: 0 24px 20px 24px;
          border-top: 1px solid #e0f2fe;
        }
        
        .results-count {
          color: #0f766e;
          font-size: 0.95rem;
          font-weight: 600;
        }
        
        @media (max-width: 768px) {
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .date-filter {
            min-width: 100%;
          }
          
          .status-toggle {
            width: 100%;
          }
          
          .toggle-btn {
            flex: 1;
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
        
        .session-card.canceled-session {
          opacity: 0.85;
          border: 1px solid #fecaca;
          background: #fef2f2;
        }
        
        .session-card.canceled-session:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(239, 68, 68, 0.12);
        }
        
        .session-card.canceled-session .session-header {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        /* Session Header */
        .session-header {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          padding: 24px;
        }
        
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }
        
        .session-date-time {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        
        .date-section,
        .time-section {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ffffff;
        }
        
        .date-section {
          font-weight: 700;
          font-size: 1.1rem;
        }
        
        .time-section {
          font-weight: 600;
          font-size: 0.95rem;
          opacity: 0.95;
        }
        
        .calendar-icon,
        .clock-icon {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
        }
        
        .date-text,
        .time-text {
          line-height: 1.2;
        }
        
        .canceled-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.95);
          color: #dc2626;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          height: fit-content;
        }
        
        .canceled-icon {
          width: 16px;
          height: 16px;
        }
        
        .completed-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.95);
          color: #16a34a;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          height: fit-content;
        }
        
        .completed-icon {
          width: 16px;
          height: 16px;
        }
        
        .scheduled-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.95);
          color: #2563eb;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          height: fit-content;
        }
        
        .scheduled-icon {
          width: 16px;
          height: 16px;
        }
        
        /* Session Body */
        .session-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
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
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .action-btn {
          flex: 1;
          min-width: 100px;
          padding: 12px 16px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }
        
        .action-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.5s, height 0.5s;
        }
        
        .action-btn:hover::before {
          width: 300px;
          height: 300px;
        }
        
        .btn-icon {
          width: 18px;
          height: 18px;
          position: relative;
          z-index: 1;
        }
        
        .action-btn span {
          position: relative;
          z-index: 1;
        }
        
        .view-btn {
          background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
          color: #14b8a6;
          border: 2px solid #14b8a6;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.15);
        }
        
        .view-btn:hover {
          background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
        }
        
        .edit-btn {
          background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.2);
        }
        
        .edit-btn:hover {
          background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.35);
        }
        
        .ongoing-btn {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
        }

        .ongoing-btn:hover {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35);
        }
        
        .cancel-btn {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
        }
        
        .cancel-btn:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
        }
        
        .action-btn:active {
          transform: translateY(0);
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
        
        /* Pagination */
        .pagination-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-top: 40px;
          padding: 24px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(20, 184, 166, 0.08);
          border: 1px solid #ccfbf1;
        }
        
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #14b8a6;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #0d9488;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(20, 184, 166, 0.25);
        }
        
        .pagination-btn:disabled {
          background: #99f6e4;
          cursor: not-allowed;
          opacity: 0.6;
        }
        
        .pagination-icon {
          width: 18px;
          height: 18px;
        }
        
        .pagination-numbers {
          display: flex;
          gap: 8px;
        }
        
        .pagination-number {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #99f6e4;
          background: white;
          color: #0f766e;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .pagination-number:hover {
          border-color: #14b8a6;
          background: #f0fdfa;
        }
        
        .pagination-number.active {
          background: #14b8a6;
          border-color: #14b8a6;
          color: white;
        }
        
        @media (max-width: 768px) {
          .pagination-container {
            flex-wrap: wrap;
            gap: 12px;
          }
          
          .pagination-numbers {
            flex-wrap: wrap;
            justify-content: center;
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

      {fullViewSession && (
        <SessionFullView
          isModalOpen={openFullSessionView}
          isClose={() => handleCloseFullView()}
          session={fullViewSession}
          currentUserId={userId || undefined}
        />
      )}
    </div>
  );
}
