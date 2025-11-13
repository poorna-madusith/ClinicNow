'use client';

import { useAuth } from "@/Context/AuthContext";
import { UserDetails } from "@/types/User";
import axios from "axios";
import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Briefcase, Edit, X } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import Image from "next/image";

export default function DocProfile() {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;
    const { accessToken } = useAuth();

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        age: '',
        gender: '',
        address: '',
        contactNumbers: [''],
        docDescription: '',
        specialization: '',
        profileImageUrl: '',
        contactEmail: ''
    });

    const fetchuser = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/auth/getuserdetails`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            console.log("Raw API response:", res.data);
            setUser(res.data);
            
            // Populate form data with safe checks for contactNumbers
            const contactNumbersData = res.data.contactNumbers || res.data.ContactNumbers;
            const safeContactNumbers = Array.isArray(contactNumbersData) && contactNumbersData.length > 0 
                ? contactNumbersData 
                : [''];
            
            setFormData({
                firstName: res.data.firstName || res.data.FirstName || '',
                lastName: res.data.lastName || res.data.LastName || '',
                email: res.data.email || res.data.Email || '',
                age: (res.data.age || res.data.Age)?.toString() || '',
                gender: res.data.gender || res.data.Gender || '',
                address: res.data.address || res.data.Address || '',
                contactNumbers: safeContactNumbers,
                docDescription: res.data.docDescription || res.data.DocDescription || '',
                specialization: res.data.specialization || res.data.Specialization || '',
                profileImageUrl: res.data.profileImageUrl || res.data.ProfileImageUrl || '',
                contactEmail: res.data.contactEmail || res.data.ContactEmail || res.data.email || res.data.Email || ''
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleContactNumberChange = (index: number, value: string) => {
        const newContactNumbers = [...formData.contactNumbers];
        newContactNumbers[index] = value;
        setFormData(prev => ({
            ...prev,
            contactNumbers: newContactNumbers
        }));
    };

    const addContactNumber = () => {
        setFormData(prev => ({
            ...prev,
            contactNumbers: [...prev.contactNumbers, '']
        }));
    };

    const removeContactNumber = (index: number) => {
        if (formData.contactNumbers.length > 1) {
            const newContactNumbers = formData.contactNumbers.filter((_, i) => i !== index);
            setFormData(prev => ({
                ...prev,
                contactNumbers: newContactNumbers
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        try {
            const userId = user?.id || user?.Id;
            if (!userId) {
                toast.error("User ID not found");
                return;
            }

            // Validation
            if (!formData.firstName.trim() || !formData.lastName.trim()) {
                toast.error("First name and last name are required");
                setUpdating(false);
                return;
            }

            if (!formData.email.trim()) {
                toast.error("Email is required");
                setUpdating(false);
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                toast.error("Please enter a valid email address");
                setUpdating(false);
                return;
            }

            // Age validation
            if (formData.age && (parseInt(formData.age) < 0 || parseInt(formData.age) > 120)) {
                toast.error("Age must be between 0 and 120");
                setUpdating(false);
                return;
            }

            // Phone number validation
            const phoneRegex = /^[0-9+\-() ]{10,}$/;
            const validContactNumbers = formData.contactNumbers.filter(num => num.trim() !== '');
            
            if (validContactNumbers.length === 0) {
                toast.error("At least one contact number is required");
                setUpdating(false);
                return;
            }

            for (const number of validContactNumbers) {
                if (!phoneRegex.test(number)) {
                    toast.error("Please enter valid phone numbers (at least 10 digits)");
                    setUpdating(false);
                    return;
                }
            }

            // Profile Image URL validation
            if (formData.profileImageUrl && formData.profileImageUrl.trim()) {
                try {
                    new URL(formData.profileImageUrl);
                } catch {
                    toast.error("Please enter a valid image URL");
                    setUpdating(false);
                    return;
                }
            }

            // Address validation (required for doctors)
            if (!formData.address || !formData.address.trim()) {
                toast.error("Address is required");
                setUpdating(false);
                return;
            }

            // Doctor description validation
            if (!formData.docDescription || !formData.docDescription.trim()) {
                toast.error("About section is required");
                setUpdating(false);
                return;
            }

            const updateDto = {
                FirstName: formData.firstName,
                LastName: formData.lastName,
                Email: formData.email,
                Age: formData.age ? parseInt(formData.age) : null,
                Gender: formData.gender || null,
                Specialization: formData.specialization || null,
                DocDescription: formData.docDescription || null,
                ProfileImageUrl: formData.profileImageUrl || null,
                ContactEmail: formData.contactEmail || formData.email,
                ContactNumbers: validContactNumbers,
                Address: formData.address || null
            };

            await axios.put(
                `${API}/auth/doctorprofileupdate/${userId}`,
                updateDto,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                }
            );

            toast.success("Profile updated successfully!");
            setIsModalOpen(false);
            
            // Refresh user data
            await fetchuser();
        } catch (error) {
            console.error("Error updating profile:", error);
            const errorMessage = error instanceof Error && 'response' in error 
                ? (error as { response?: { data?: { Message?: string } } }).response?.data?.Message 
                : "Failed to update profile";
            toast.error(errorMessage || "Failed to update profile");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (accessToken) {
            fetchuser();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accessToken]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="text-center">
                    <div className="text-6xl mb-4">😞</div>
                    <p className="text-gray-600 text-xl">Unable to load profile</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={["Doctor"]}>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                {/* Welcome Header Container */}
                <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 rounded-3xl shadow-xl p-10 mb-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    
                    <div className="mt-2 text-center">
                        {/* Profile Avatar Circle */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg overflow-hidden">
                                {(user.profileImageUrl || user.ProfileImageUrl) ? (
                                    <Image
                                        src={user.profileImageUrl || user.ProfileImageUrl || ""}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white text-4xl font-bold">
                                        {((user.firstName || user.FirstName)?.[0] || '') + ((user.lastName || user.LastName)?.[0] || '')}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        {/* User Name */}
                        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-3 tracking-tight">
                            {(user.firstName || user.FirstName) && (user.lastName || user.LastName)
                                ? `${user.firstName || user.FirstName} ${user.lastName || user.LastName}`
                                : 'User Profile'}
                        </h1>
                        
                        {/* Role Badge */}
                        {(user.role || user.Role) && (
                            <div className="inline-flex items-center gap-2 mt-4">
                                <span className="px-6 py-3 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 text-white rounded-full text-lg font-semibold shadow-md">
                                    {user.role || user.Role}
                                </span>
                            </div>
                        )}
                        
                        {/* Decorative Line */}
                        <div className="mt-6 flex justify-center">
                            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 rounded-full"></div>
                        </div>

                        {/* Edit Profile Button - Centered below decorative line */}
                        <div className="mt-2 flex justify-center mb-4">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 hover:from-teal-600 hover:via-teal-700 hover:to-cyan-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group text-sm"
                            >
                                <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                                <span>Edit Profile</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Information Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                            </div>
                            Personal Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mt-1 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Age</p>
                                    <p className="text-gray-900 font-semibold">
                                        {(user.age || user.Age) ? `${user.age || user.Age} years old` : 'Not Provided'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mt-1 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-pink-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Gender</p>
                                    <p className="text-gray-900 font-semibold">{user.gender || user.Gender || 'Not Provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mt-1 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Email</p>
                                    <p className="text-gray-900 font-semibold break-all">{user.email || user.Email || 'Not Provided'}</p>
                                </div>
                            </div>
                            {(user.specialization || user.Specialization) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Briefcase className="w-5 h-5 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Specialization</p>
                                        <p className="text-gray-900 font-semibold">{user.specialization || user.Specialization}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <Phone className="w-5 h-5 text-green-600" />
                            </div>
                            Contact Information
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mt-1 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-500 font-medium mb-2">Phone Numbers</p>
                                    <div className="space-y-1">
                                        {((user.contactNumbers || user.ContactNumbers) && 
                                          Array.isArray(user.contactNumbers || user.ContactNumbers) && 
                                          (user.contactNumbers || user.ContactNumbers)!.length > 0) ? (
                                            (user.contactNumbers || user.ContactNumbers)!.map((number, index) => (
                                                <p key={index} className="text-gray-900 font-semibold">
                                                    {number}
                                                </p>
                                            ))
                                        ) : (
                                            <p className="text-gray-900 font-semibold">Not Provided</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mt-1 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Contact Email</p>
                                    <p className="text-gray-900 font-semibold break-all">
                                        {user.contactEmail || user.ContactEmail || user.email || user.Email || 'Not Provided'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="mt-1 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Address</p>
                                    <p className="text-gray-900 font-semibold">{user.address || user.Address || 'Not Provided'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Doctor Description - Full Width */}
                    {(user.docDescription || user.DocDescription) && (
                        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-5 h-5 text-teal-600" />
                                </div>
                                About
                            </h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {user.docDescription || user.DocDescription}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Edit className="w-5 h-5" />
                                </div>
                                <h2 className="text-2xl font-bold">Edit Profile</h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="hover:bg-white/20 rounded-full p-2 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Name Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        minLength={2}
                                        maxLength={50}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        minLength={2}
                                        maxLength={50}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter email address"
                                />
                            </div>

                            {/* Contact Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contact Email
                                    <span className="text-gray-500 text-xs font-normal ml-2">
                                        (Email for patient inquiries)
                                    </span>
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleInputChange}
                                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter contact email (defaults to main email)"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    If not provided, your main email will be used
                                </p>
                            </div>

                            {/* Profile Image URL */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Profile Image URL
                                </label>
                                <input
                                    type="url"
                                    name="profileImageUrl"
                                    value={formData.profileImageUrl}
                                    onChange={handleInputChange}
                                    pattern="https?://.+"
                                    title="Please enter a valid URL starting with http:// or https://"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    placeholder="Enter image URL"
                                />
                            </div>

                            {/* Age and Gender */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="120"
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                        placeholder="Enter age"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    minLength={10}
                                    maxLength={200}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Enter full address"
                                />
                            </div>

                            {/* Contact Numbers */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contact Numbers
                                </label>
                                <div className="space-y-2">
                                    {formData.contactNumbers.map((number, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="tel"
                                                value={number}
                                                onChange={(e) => handleContactNumberChange(index, e.target.value)}
                                                required
                                                pattern="[0-9+\-() ]{10,}"
                                                title="Please enter a valid phone number (at least 10 digits)"
                                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                                                placeholder={`Contact number ${index + 1}`}
                                            />
                                            {formData.contactNumbers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeContactNumber(index)}
                                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addContactNumber}
                                        className="text-teal-600 hover:text-teal-700 font-semibold text-sm flex items-center gap-1"
                                    >
                                        <span className="text-xl">+</span> Add another number
                                    </button>
                                </div>
                            </div>

                            {/* Doctor Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    About
                                </label>
                                <textarea
                                    name="docDescription"
                                    value={formData.docDescription}
                                    onChange={handleInputChange}
                                    required
                                    minLength={20}
                                    maxLength={1000}
                                    rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Write a brief description about yourself (minimum 20 characters)"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {updating ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Updating...
                                        </span>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            </div>
        </ProtectedRoute>
    );
}
