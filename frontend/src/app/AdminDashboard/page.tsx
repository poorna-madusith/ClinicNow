"use client";

import { useAuth } from "@/Context/AuthContext";
import { Doctor, DoctorRegister, Gender } from "@/types/Doctor";
import DoctorFullView from "@/components/DoctorFullView";
import DoctorSessionsModal from "@/components/DoctorSessionsModal";
import axios from "axios";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import DeleteButton from "@/components/DeleteButton";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [selectedDoctorForSessions, setSelectedDoctorForSessions] = useState<Doctor | null>(null);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const [addeditmodalOpen, setAddeditmodalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
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
  const [errors, setErrors] = useState<{ key: string; message: string }[]>([]);
  const [editDoc, setEditDoc] = useState<Doctor | null>(null);
  const [selectSpecialization, setSelectSpecialization] = useState("All");

  const specializations = [
    "All",
    ...new Set(doctors.map((doc) => doc.specialization)),
  ];

  const handleEditClick = (doctor: Doctor) => {
    setEditDoc(doctor);
    setAddeditmodalOpen(true);
    setFromData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      email: doctor.email,
      password: "", // Passwords are usually not pre-filled for security reasons
      age: doctor.age,
      gender: doctor.gender,
      specialization: doctor.specialization,
      profileImageUrl: doctor.profileImageUrl,
      contactEmail: doctor.contactEmail,
      docDescription: doctor.docDescription,
      contactNumbers: doctor.contactNumbers,
      address: doctor.address,
    });
  };

  const handleDeleteClick = async (doctorId: string) => {
    try {
      await axios.delete(`${API}/admin/deletedoctor/${doctorId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Doctor deleted successfully");
      fetchDoctors();
    } catch (err: any) {
      console.error("Failed to delete doctor", err);
      toast.error("Failed to delete doctor");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFrom()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      await axios.put(`${API}/admin/updatedoctor/${editDoc?.id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success("Doctor updated successfully");
      fetchDoctors();
      setAddeditmodalOpen(false);
      setFromData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        age: 0,
        gender: Gender.Other,
        specialization: "",
        profileImageUrl: "",
        contactEmail: "",
        docDescription: "",
        contactNumbers: [],
        address: "",
      });
    } catch (err) {
      console.error("Failed to update doctor", err);
      toast.error("Failed to update doctor");
    }
  };

  const validateFrom = () => {
    const newErrors: { key: string; message: string }[] = [];

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.push({ key: "firstName", message: "First name is required" });
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.push({ key: "lastName", message: "Last name is required" });
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.push({ key: "email", message: "Email is required" });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push({ key: "email", message: "Email is invalid" });
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.push({ key: "password", message: "Password is required" });
    } else if (formData.password.length < 6) {
      newErrors.push({
        key: "password",
        message: "Password must be at least 6 characters long",
      });
    }

    // Age validation
    if (!formData.age || formData.age <= 0) {
      newErrors.push({ key: "age", message: "Age must be greater than 0" });
    } else if (formData.age < 18) {
      newErrors.push({
        key: "age",
        message: "Doctor must be at least 18 years old",
      });
    } else if (formData.age > 100) {
      newErrors.push({ key: "age", message: "Please enter a valid age" });
    }

    // Specialization validation
    if (!formData.specialization.trim()) {
      newErrors.push({
        key: "specialization",
        message: "Specialization is required",
      });
    }

    // Description validation
    if (!formData.docDescription.trim()) {
      newErrors.push({
        key: "docDescription",
        message: "Doctor description is required",
      });
    } else if (formData.docDescription.trim().length < 10) {
      newErrors.push({
        key: "docDescription",
        message: "Description must be at least 10 characters",
      });
    }

    // Profile Image URL validation
    if (!formData.profileImageUrl.trim()) {
      newErrors.push({
        key: "profileImageUrl",
        message: "Profile image URL is required",
      });
    } else if (!/^https?:\/\/.+/.test(formData.profileImageUrl)) {
      newErrors.push({
        key: "profileImageUrl",
        message: "Please enter a valid URL (http:// or https://)",
      });
    }

    // Contact Email validation
    if (!formData.contactEmail.trim()) {
      newErrors.push({
        key: "contactEmail",
        message: "Contact email is required",
      });
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.push({
        key: "contactEmail",
        message: "Contact email is invalid",
      });
    }

    // Contact Numbers validation
    if (
      formData.contactNumbers.length === 0 ||
      formData.contactNumbers.some((num) => num.trim() === "")
    ) {
      newErrors.push({
        key: "contactNumbers",
        message: "At least one contact number is required",
      });
    } else {
      // Validate phone number format
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      const invalidNumbers = formData.contactNumbers.filter(
        (num) => num.trim() && !phoneRegex.test(num.trim())
      );
      if (invalidNumbers.length > 0) {
        newErrors.push({
          key: "contactNumbers",
          message: "Invalid phone number format",
        });
      }
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.push({ key: "address", message: "Address is required" });
    } else if (formData.address.trim().length < 10) {
      newErrors.push({
        key: "address",
        message: "Address must be at least 10 characters",
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleAddDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFrom()) {
      toast.error("Please fix the errors in the form");
      return;
    }
    try {
      await axios.post(`${API}/admin/doctorregister`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      toast.success("Doctor added successfully");
      fetchDoctors();
      resetForm();
    } catch (err: any) {
      console.log("Error adding doctor:", err);
      if (err.response && err.response.data) {
        // If the server sends back validation errors, they will be logged here.
        console.error("Server validation errors:", err.response.data);
      }
      toast.error("Error adding doctor");
    } finally {
      setAddeditmodalOpen(false);
    }
  };

  const resetForm = () => {
    setFromData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      age: 0,
      gender: Gender.Other,
      specialization: "",
      profileImageUrl: "",
      contactEmail: "",
      docDescription: "",
      contactNumbers: [],
      address: "",
    });
    setErrors([]);
  };

  const handleCloseAddEditModal = () => {
    setAddeditmodalOpen(false);
    setEditDoc(null);
    resetForm();
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
      setFilteredDoctors(res.data || []);
    } catch (err) {
      console.log("Error fetching doctors:", err);
      setDoctors([]);
    }
  }, [API, accessToken]);

  useEffect(() => {
    let result = doctors;

    if (selectSpecialization !== "All") {
      result = result.filter(
        (doc) => doc.specialization === selectSpecialization
      );
    }

    if (search.trim() !== "") {
      result = result.filter(
        (doc) =>
          doc.firstName
            .toLocaleLowerCase()
            .includes(search.toLocaleLowerCase()) ||
          doc.lastName.toLocaleLowerCase().includes(search.toLocaleLowerCase())
      );
    }
    setFilteredDoctors(result);
  }, [doctors, search, selectSpecialization]);

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

  const handleViewSessions = (doctor: Doctor) => {
    setSelectedDoctorForSessions(doctor);
    setIsSessionsModalOpen(true);
  };

  const handleCloseSessionsModal = () => {
    setIsSessionsModalOpen(false);
    setSelectedDoctorForSessions(null);
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
        {/* Header Section with Gradient */}
        <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 shadow-xl">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Admin Dashboard
              </h1>
              <p className="text-teal-100 text-xs sm:text-sm">
                Manage your medical professionals
              </p>
            </div>
            <button
              onClick={() => setAddeditmodalOpen(true)}
              className="group relative w-full sm:w-auto px-6 py-3 bg-white text-teal-700 rounded-xl font-semibold shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
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
      <div className="container mx-auto px-4 sm:px-6 -mt-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-teal-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  Total Doctors
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                  {doctors.length}
                </h3>
              </div>
              <div className="bg-teal-100 p-3 sm:p-4 rounded-xl">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600"
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
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-cyan-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">
                  Specializations
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                  {new Set(doctors.map((d) => d.specialization)).size}
                </h3>
              </div>
              <div className="bg-cyan-100 p-3 sm:p-4 rounded-xl">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border-l-4 border-teal-600 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm font-medium">Active</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-1">
                  {doctors.length}
                </h3>
              </div>
              <div className="bg-teal-100 p-3 sm:p-4 rounded-xl">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Doctor Modal */}
      {addeditmodalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto h-full w-full flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in zoom-in duration-300 mx-2">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-4 sm:px-8 py-4 sm:py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {editDoc ? "Edit Doctor" : "Add New Doctor"}
                    </h3>
                    <p className="text-teal-100 text-sm">
                      {editDoc
                        ? "Edit Details Here"
                        : "Fill the form below to add a new doctor"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseAddEditModal}
                  className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
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

            {/* Modal Body */}
            <form
              onSubmit={editDoc ? handleEditSubmit : handleAddDoctor}
              className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]"
            >
              <div className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-teal-600 rounded-full"></div>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        value={formData.firstName}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "firstName")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            firstName: e.target.value,
                          })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "firstName")
                            ?.message
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        value={formData.lastName}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "lastName")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({ ...formData, lastName: e.target.value })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "lastName")
                            ?.message
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Age
                      </label>
                      <input
                        type="number"
                        placeholder="Enter age"
                        value={formData.age}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "age")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            age: Number(e.target.value),
                          })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.find((error) => error.key === "age")?.message}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <select
                        value={formData.gender}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white text-black"
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            gender: e.target.value as Gender,
                          })
                        }
                      >
                        <option value={Gender.Other}>Other</option>
                        <option value={Gender.Male}>Male</option>
                        <option value={Gender.Female}>Female</option>
                      </select>
                      <p className="text-red-500 text-sm">
                        {
                          errors.find((error) => error.key === "gender")
                            ?.message
                        }
                      </p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        placeholder="doctor@example.com"
                        value={formData.email}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "email")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({ ...formData, email: e.target.value })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.find((error) => error.key === "email")?.message}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        placeholder="Enter secure password"
                        value={formData.password}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "password")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({ ...formData, password: e.target.value })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "password")
                            ?.message
                        }
                      </p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization *
                      </label>
                      <select
                        value={formData.specialization}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none bg-white text-black ${
                          errors.find((error) => error.key === "specialization")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            specialization: e.target.value,
                          })
                        }
                      >
                        <option value="">Select Specialization</option>

                        {/* General & Internal Medicine */}
                        <optgroup label="🩺 General & Internal Medicine">
                          <option value="General Physician">
                            General Physician
                          </option>
                          <option value="Family Doctor">Family Doctor</option>
                          <option value="Internal Medicine">
                            Internal Medicine
                          </option>
                        </optgroup>

                        {/* Surgical & Emergency Care */}
                        <optgroup label="❤️ Surgical & Emergency Care">
                          <option value="General Surgeon">
                            General Surgeon
                          </option>
                          <option value="Orthopedic">Orthopedic</option>
                          <option value="Neurosurgeon">Neurosurgeon</option>
                          <option value="Cardiothoracic Surgeon">
                            Cardiothoracic Surgeon
                          </option>
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
                          <option value="Endocrinologist">
                            Endocrinologist
                          </option>
                          <option value="Oncologist">Oncologist</option>
                        </optgroup>
                      </select>
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "specialization")
                            ?.message
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        placeholder="Brief description about the doctor's expertise and experience"
                        rows={3}
                        value={formData.docDescription}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none text-black ${
                          errors.find((error) => error.key === "docDescription")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            docDescription: e.target.value,
                          })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "docDescription")
                            ?.message
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profile Image URL *
                      </label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={formData.profileImageUrl}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find(
                            (error) => error.key === "profileImageUrl"
                          )
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            profileImageUrl: e.target.value,
                          })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find(
                            (error) => error.key === "profileImageUrl"
                          )?.message
                        }
                      </p>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        placeholder="contact@example.com"
                        value={formData.contactEmail}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "contactEmail")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            contactEmail: e.target.value,
                          })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "contactEmail")
                            ?.message
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Numbers *
                      </label>
                      <input
                        type="text"
                        placeholder="Enter phone numbers (comma separated)"
                        value={formData.contactNumbers.join(", ")}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none text-black ${
                          errors.find((error) => error.key === "contactNumbers")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({
                            ...formData,
                            contactNumbers: e.target.value
                              .split(",")
                              .map((n) => n.trim()),
                          })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "contactNumbers")
                            ?.message
                        }
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address *
                      </label>
                      <textarea
                        placeholder="Enter full address"
                        rows={2}
                        value={formData.address}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none resize-none text-black ${
                          errors.find((error) => error.key === "address")
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        onChange={(e) =>
                          setFromData({ ...formData, address: e.target.value })
                        }
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {
                          errors.find((error) => error.key === "address")
                            ?.message
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                <button
                  type="button"
                  onClick={handleCloseAddEditModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all"
                >
                  {editDoc ? "Save Changes" : "Add Doctor"}
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

      {isSessionsModalOpen && selectedDoctorForSessions && (
        <DoctorSessionsModal
          doctor={selectedDoctorForSessions}
          isOpen={isSessionsModalOpen}
          onClose={handleCloseSessionsModal}
          accessToken={accessToken || ""}
        />
      )}

      {/* Doctors Grid */}
      <div className="container mx-auto px-6 pb-12">
        {doctors.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-12 h-12 text-gray-400"
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
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                No Doctors Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by adding your first doctor to the system
              </p>
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
            {/* Search and Filter Section */}
            <div className="relative p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="relative flex-1 w-full">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-teal-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search doctors by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm hover:border-teal-300 bg-white"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-600 transition-colors"
                    >
                      <svg
                        className="h-5 w-5"
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
                  )}
                </div>

                {/* Specialization Filter */}
                <div className="w-full md:w-64">
                  <select
                    value={selectSpecialization}
                    onChange={(e) => setSelectSpecialization(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-300 bg-white text-gray-700 shadow-sm hover:border-teal-300 cursor-pointer"
                  >
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec === "All" ? "All Specializations" : spec}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results Count */}
              {(search || selectSpecialization !== "All") && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    Found{" "}
                    <span className="font-semibold text-teal-600">
                      {filteredDoctors.length}
                    </span>{" "}
                    doctor{filteredDoctors.length !== 1 ? "s" : ""}
                    {selectSpecialization !== "All" && (
                      <span>
                        {" "}
                        in <span className="font-semibold">{selectSpecialization}</span>
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Profile
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Specialization
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Age
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Gender
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDoctors.map((doctor, index) => (
                    <tr
                      key={doctor.id}
                      className={`hover:bg-teal-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-200">
                          <Image
                            src={
                              doctor.profileImageUrl || "/default-avatar.png"
                            }
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
                        <div className="text-sm text-gray-600">
                          {doctor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                          {doctor.specialization}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {doctor.age ? `${doctor.age} years` : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {doctor.gender || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {doctor.contactEmail || doctor.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDoctor(doctor)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-medium rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View
                          </button>
                          <button
                            onClick={() => handleViewSessions(doctor)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg"
                          >
                            <svg
                              className="w-4 h-4"
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
                            Sessions
                          </button>
                          <button
                            onClick={() => handleEditClick(doctor)}
                            className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z"
                              ></path>
                            </svg>
                            Edit
                          </button>

                          <DeleteButton
                            onDelete={() => handleDeleteClick(doctor.id)}
                          />
                        </div>
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
    </ProtectedRoute>
  );
}
