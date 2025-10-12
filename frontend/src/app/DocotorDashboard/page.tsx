'use client';

import { useAuth } from "@/Context/AuthContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

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


  useEffect(()=>{
    console.log("token" + accessToken);
    console.log(userId);
  },[accessToken, decodedToken]);



  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if(!formData.Date) {
      newErrors.Date = "Date is required";
    }
    if(!formData.SessionFee) {
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


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;




  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if(!validateForm()) {
      setLoading(false);
      toast.error("Please fill in all required fields correctly");
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
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error("Error creating session");
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
      <h1 className="dashboard-title">Doctor Dashboard</h1>
      <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
        Create Session
      </button>
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
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #134e4a;
          margin-bottom: 32px;
          letter-spacing: 1px;
        }
        .open-modal-btn {
          background: #14b8a6;
          color: #fff;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(20, 184, 166, 0.08);
          transition: background 0.2s;
        }
        .open-modal-btn:hover {
          background: #0d9488;
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
