'use client';

import { useAuth } from "@/Context/AuthContext";
import { UserDetails } from "@/types/User";
import axios from "axios";
import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Calendar, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

export default function UserProfile() {
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;
    const { accessToken } = useAuth();

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
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                {/* Welcome Header Container */}
                <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 rounded-3xl shadow-xl p-10 mb-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                    <div className="text-center">
                        {/* Profile Avatar Circle */}
                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 via-teal-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                <span className="text-white text-4xl font-bold">
                                    {((user.firstName || user.FirstName)?.[0] || '') + ((user.lastName || user.LastName)?.[0] || '')}
                                </span>
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
                                <span className="px-6 py-2 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 text-white rounded-full text-sm font-semibold shadow-md">
                                    {user.role || user.Role}
                                </span>
                            </div>
                        )}
                        
                        {/* Decorative Line */}
                        <div className="mt-6 flex justify-center">
                            <div className="w-32 h-1 bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600 rounded-full"></div>
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
                            {(user.age || user.Age) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Calendar className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Age</p>
                                        <p className="text-gray-900 font-semibold">{user.age || user.Age} years old</p>
                                    </div>
                                </div>
                            )}
                            {(user.gender || user.Gender) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <User className="w-5 h-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Gender</p>
                                        <p className="text-gray-900 font-semibold">{user.gender || user.Gender}</p>
                                    </div>
                                </div>
                            )}
                            {(user.email || user.Email) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Email</p>
                                        <p className="text-gray-900 font-semibold break-all">{user.email || user.Email}</p>
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
                            {(user.contactNumbers || user.ContactNumbers) && (user.contactNumbers || user.ContactNumbers)!.length > 0 && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-500 font-medium mb-2">Phone Numbers</p>
                                        <div className="space-y-1">
                                            {(user.contactNumbers || user.ContactNumbers)!.map((number, index) => (
                                                <p key={index} className="text-gray-900 font-semibold">
                                                    {number}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {(user.town || user.Town) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Town/City</p>
                                        <p className="text-gray-900 font-semibold">{user.town || user.Town}</p>
                                    </div>
                                </div>
                            )}
                            {(user.address || user.Address) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Address</p>
                                        <p className="text-gray-900 font-semibold">{user.address || user.Address}</p>
                                    </div>
                                </div>
                            )}
                            {(user.contactEmail || user.ContactEmail) && (
                                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="mt-1 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-medium">Contact Email</p>
                                        <p className="text-gray-900 font-semibold break-all">{user.contactEmail || user.ContactEmail}</p>
                                    </div>
                                </div>
                            )}
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
        </div>
    );
}