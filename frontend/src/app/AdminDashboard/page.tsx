"use client";

import { useAuth } from "@/Context/AuthContext";
import { Doctor, DoctorRegister, Gender } from "@/types/Doctor";
import DoctorFullView from "@/components/DoctorFullView";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const [addeditmodalOpen, setAddeditmodalOpen] = useState(false);
  const [formData, setFromData] = useState<DoctorRegister>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    age: 0,
    gender: Gender.Other, // or your default Gender
    specialization: "",
    profileImageUrl: "",
    contactEmail: "",
    docDescription: "",
    contactNumbers: [],
    address: "",
  });

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/doctorregister`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success("Doctor added successfully");
      fetchDoctors();
    } catch (err) {
      console.log("Error adding doctor:", err);
      toast.error("Error adding doctor");
    } finally {
      setAddeditmodalOpen(false);
    }
  };

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/admin/getalldoctors`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDoctors(res.data || []);
      console.log("Doctors:", res.data);
    } catch (err) {
      console.log("Error fetching doctors:", err);
      setDoctors([]);
    }
  }, [API, accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchDoctors();
    }
  }, [accessToken, fetchDoctors]);

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Admin Dashboard
              </h1>
              <p className="text-teal-100 text-sm">
                Manage your medical professionals
              </p>
            </div>
            <button
              onClick={() => setAddeditmodalOpen(true)}
              className="group relative px-6 py-3 bg-white text-teal-700 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Doctor
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-6 -mt-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Doctors</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{doctors.length}</h3>
              </div>
              <div className="bg-teal-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-cyan-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Specializations</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">
                  {new Set(doctors.map(d => d.specialization)).size}
                </h3>
              </div>
              <div className="bg-cyan-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-teal-600 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Active</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-1">{doctors.length}</h3>
              </div>
              <div className="bg-teal-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {addeditmodalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-in zoom-in duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Add New Doctor</h3>
                    <p className="text-teal-100 text-sm">Fill in the details below</p>
                  </div>
                </div>
                <button
                  onClick={() => setAddeditmodalOpen(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddDoctor} className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-teal-600 rounded-full"></div>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input
                        type="number"
                        placeholder="Enter age"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, age: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white text-black"
                        onChange={(e) => setFromData({ ...formData, gender: e.target.value as Gender })}
                      >
                        <option value={Gender.Other}>Other</option>
                        <option value={Gender.Male}>Male</option>
                        <option value={Gender.Female}>Female</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Account Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-cyan-600 rounded-full"></div>
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        placeholder="doctor@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <input
                        type="password"
                        placeholder="Enter secure password"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-teal-700 rounded-full"></div>
                    Professional Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization *</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white text-black"
                        onChange={(e) => setFromData({ ...formData, specialization: e.target.value })}
                        required
                      >
                        <option value="">Select Specialization</option>
                        
                        {/* General & Internal Medicine */}
                        <optgroup label="🩺 General & Internal Medicine">
                          <option value="General Physician">General Physician</option>
                          <option value="Family Doctor">Family Doctor</option>
                          <option value="Internal Medicine">Internal Medicine</option>
                        </optgroup>
                        
                        {/* Surgical & Emergency Care */}
                        <optgroup label="❤️ Surgical & Emergency Care">
                          <option value="General Surgeon">General Surgeon</option>
                          <option value="Orthopedic">Orthopedic</option>
                          <option value="Neurosurgeon">Neurosurgeon</option>
                          <option value="Cardiothoracic Surgeon">Cardiothoracic Surgeon</option>
                        </optgroup>
                        
                        {/* Mental & Neurological Health */}
                        <optgroup label="🧠 Mental & Neurological Health">
                          <option value="Psychiatrist">Psychiatrist</option>
                          <option value="Neurologist">Neurologist</option>
                          <option value="Psychologist">Psychologist</option>
                        </optgroup>
                        
                        {/* Women's & Children's Health */}
                        <optgroup label="👶 Women's & Children's Health">
                          <option value="Gynecologist">Gynecologist</option>
                          <option value="Obstetrician">Obstetrician</option>
                          <option value="Pediatrician">Pediatrician</option>
                        </optgroup>
                        
                        {/* Specialized Care & Others */}
                        <optgroup label="🧴 Specialized Care & Others">
                          <option value="Dermatologist">Dermatologist</option>
                          <option value="Cardiologist">Cardiologist</option>
                          <option value="Urologist">Urologist</option>
                          <option value="Endocrinologist">Endocrinologist</option>
                          <option value="Oncologist">Oncologist</option>
                        </optgroup>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                      <textarea
                        placeholder="Brief description about the doctor's expertise and experience"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none text-black"
                        onChange={(e) => setFromData({ ...formData, docDescription: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL *</label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, profileImageUrl: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-cyan-700 rounded-full"></div>
                    Contact Information
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                      <input
                        type="email"
                        placeholder="contact@example.com"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, contactEmail: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Contact Numbers *</label>
                      <input
                        type="text"
                        placeholder="Enter phone numbers (comma separated)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black"
                        onChange={(e) => setFromData({ ...formData, contactNumbers: e.target.value.split(",").map(n => n.trim()) })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                      <textarea
                        placeholder="Enter full address"
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none text-black"
                        onChange={(e) => setFromData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setAddeditmodalOpen(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                >
                  Add Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isModalOpen && selectedDoctor && (
        <DoctorFullView
          doctor={selectedDoctor}
          onClose={handleCloseModal}
          isModalOpen={isModalOpen}
        />
      )}

      {/* Doctors Grid */}
      <div className="container mx-auto px-6 pb-12">
        {doctors.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Doctors Yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first doctor to the system</p>
              <button
                onClick={() => setAddeditmodalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Add Your First Doctor
              </button>
            </div>
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Profile</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Specialization</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Age</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Gender</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Contact</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.map((doctor, index) => (
                    <tr
                      key={doctor.id}
                      className={`hover:bg-teal-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
                          <Image
                            src={doctor.profileImageUrl || "/default-avatar.png"}
                            alt={`${doctor.firstName} ${doctor.lastName}`}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{doctor.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {doctor.age ? `${doctor.age} years` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">{doctor.gender || '-'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {doctor.contactEmail || doctor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
