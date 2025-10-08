'use client';

import { useAuth } from "@/Context/AuthContext";
import axios from "axios";
import { Session } from "@/types/Session";
import toast from "react-hot-toast";
import { useState } from "react";

export default function DoctorDashboard() {
  const [formData, setFormData] = useState({
    Capacity: 0,
    StartTime: "",
    EndTime: "",
    Date: "",
    SessionFee: 0,
    Description: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { accessToken, decodedToken } = useAuth();
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
          console.log("token" + accessToken);

    try {
      const res = await axios.post(`${API}/session/addsession`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      console.log("Session created:", res.data);
      toast.success("Session created successfully");
    } catch (err) {
      console.error("Error creating session:", err);
      toast.error("Error creating session");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="doctor-dashboard-container">
      <h1 className="dashboard-title">Doctor Dashboard</h1>
      <button className="open-modal-btn" onClick={() => setIsModalOpen(true)}>
        Create Session
      </button>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
            <h2 className="modal-title">Create Session</h2>
            <form className="session-form" onSubmit={handleSubmit}>
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
                required
              />
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
                required
              />
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
                required
              />
              <label htmlFor="Date">Date:</label>
              <input
                type="date"
                id="Date"
                name="Date"
                value={formData?.Date || ""}
                onChange={(e) =>
                  setFormData({ ...formData, Date: e.target.value })
                }
                required
              />
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
                required
              />
              <label htmlFor="Description">Description:</label>
              <textarea
                id="Description"
                name="Description"
                value={formData?.Description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, Description: e.target.value })
                }
                rows={3}
                required
              />
              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? "Loading..." : "Create Session"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Elegant CSS styles for the dashboard and modal */}
      <style jsx>{`
        .doctor-dashboard-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%);
          padding: 40px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 32px;
          letter-spacing: 1px;
        }
        .open-modal-btn {
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
          transition: background 0.2s;
        }
        .open-modal-btn:hover {
          background: #4f46e5;
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(30, 41, 59, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(30, 41, 59, 0.18);
          padding: 36px 32px 28px 32px;
          min-width: 340px;
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
          color: #64748b;
          cursor: pointer;
          transition: color 0.2s;
        }
        .close-modal-btn:hover {
          color: #ef4444;
        }
        .modal-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #334155;
          margin-bottom: 18px;
          text-align: center;
        }
        .session-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .session-form label {
          font-size: 1rem;
          color: #475569;
          font-weight: 500;
        }
        .session-form input,
        .session-form textarea {
          padding: 8px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 1rem;
          background: #f1f5f9;
          color: #1e293b;
          outline: none;
          transition: border 0.2s;
        }
        .session-form input:focus,
        .session-form textarea:focus {
          border: 1.5px solid #6366f1;
        }
        .submit-btn {
          margin-top: 10px;
          background: #6366f1;
          color: #fff;
          border: none;
          padding: 10px 0;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
          transition: background 0.2s;
        }
        .submit-btn:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }
        .submit-btn:hover:not(:disabled) {
          background: #4f46e5;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
