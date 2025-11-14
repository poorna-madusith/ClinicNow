"use client";

import { useAuth } from "@/Context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface GenderStats {
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  totalPatients: number;
}

interface TownStatItem {
  town: string;
  count: number;
}

interface TownStats {
  townStats: TownStatItem[];
  totalPatients: number;
}

interface DayBookingStat {
  dayOfWeek: string;
  bookingCount: number;
  averageRating: number;
}

interface WeeklyBookingStats {
  dailyStats: DayBookingStat[];
  totalBookings: number;
  overallAverageRating: number;
}

interface DoctorGenderStats {
  maleCount: number;
  femaleCount: number;
  otherCount: number;
  totalDoctors: number;
}

interface SpecializationStatItem {
  specialization: string;
  count: number;
}

interface DoctorSpecializationStats {
  specializationStats: SpecializationStatItem[];
  totalDoctors: number;
}

interface DoctorRatingItem {
  doctorId: string;
  doctorName: string;
  specialization: string;
  averageRating: number;
  totalFeedbacks: number;
}

interface DoctorFeedbackStats {
  topRatedDoctors: DoctorRatingItem[];
  totalFeedbacks: number;
}

interface RatingCategoryStats {
  averageCommunicationRating: number;
  averageProfessionalismRating: number;
  averagePunctualityRating: number;
  averageTreatmentRating: number;
  averageOverallRating: number;
  totalFeedbacks: number;
}

interface DoctorBookingRatingItem {
  doctorId: string;
  doctorName: string;
  specialization: string;
  totalBookings: number;
  averageRating: number;
}

interface DoctorBookingRatingStats {
  doctorStats: DoctorBookingRatingItem[];
  totalBookings: number;
}

export default function AdminReports() {
  const [genderStats, setGenderStats] = useState<GenderStats | null>(null);
  const [townStats, setTownStats] = useState<TownStats | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyBookingStats | null>(null);
  const [doctorGenderStats, setDoctorGenderStats] = useState<DoctorGenderStats | null>(null);
  const [doctorSpecializationStats, setDoctorSpecializationStats] = useState<DoctorSpecializationStats | null>(null);
  const [doctorFeedbackStats, setDoctorFeedbackStats] = useState<DoctorFeedbackStats | null>(null);
  const [ratingCategoryStats, setRatingCategoryStats] = useState<RatingCategoryStats | null>(null);
  const [doctorBookingRatingStats, setDoctorBookingRatingStats] = useState<DoctorBookingRatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient");
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();

  const fetchGenderStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/gender-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setGenderStats(res.data);
    } catch {
      toast.error("Failed to fetch gender statistics");
    }
  }, [accessToken, API]);

  const fetchTownStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/town-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setTownStats(res.data);
    } catch {
      toast.error("Failed to fetch town statistics");
    }
  }, [accessToken, API]);

  const fetchWeeklyBookingStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/weekly-booking-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setWeeklyStats(res.data);
    } catch {
      toast.error("Failed to fetch weekly booking statistics");
    }
  }, [accessToken, API]);

  const fetchDoctorGenderStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/doctor-gender-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDoctorGenderStats(res.data);
    } catch {
      toast.error("Failed to fetch doctor gender statistics");
    }
  }, [accessToken, API]);

  const fetchDoctorSpecializationStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/doctor-specialization-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDoctorSpecializationStats(res.data);
    } catch {
      toast.error("Failed to fetch doctor specialization statistics");
    }
  }, [accessToken, API]);

  const fetchDoctorFeedbackStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/doctor-feedback-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDoctorFeedbackStats(res.data);
    } catch {
      toast.error("Failed to fetch doctor feedback statistics");
    }
  }, [accessToken, API]);

  const fetchRatingCategoryStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/rating-category-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setRatingCategoryStats(res.data);
    } catch {
      toast.error("Failed to fetch rating category statistics");
    }
  }, [accessToken, API]);

  const fetchDoctorBookingRatingStats = useCallback(async () => {
    if (!accessToken) return;
    
    try {
      const res = await axios.get(`${API}/report/doctor-booking-rating-statistics`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setDoctorBookingRatingStats(res.data);
    } catch {
      toast.error("Failed to fetch doctor booking rating statistics");
    }
  }, [accessToken, API]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchGenderStats(), 
        fetchTownStats(), 
        fetchWeeklyBookingStats(),
        fetchDoctorGenderStats(),
        fetchDoctorSpecializationStats(),
        fetchDoctorFeedbackStats(),
        fetchRatingCategoryStats(),
        fetchDoctorBookingRatingStats()
      ]);
      setLoading(false);
    };
    fetchData();
  }, [fetchGenderStats, fetchTownStats, fetchWeeklyBookingStats, fetchDoctorGenderStats, fetchDoctorSpecializationStats, fetchDoctorFeedbackStats, fetchRatingCategoryStats, fetchDoctorBookingRatingStats]);

  // Calculate percentages
  const getMalePercentage = () => {
    if (!genderStats || genderStats.totalPatients === 0) return 0;
    return ((genderStats.maleCount / genderStats.totalPatients) * 100).toFixed(1);
  };

  const getFemalePercentage = () => {
    if (!genderStats || genderStats.totalPatients === 0) return 0;
    return ((genderStats.femaleCount / genderStats.totalPatients) * 100).toFixed(1);
  };

  const getOtherPercentage = () => {
    if (!genderStats || genderStats.totalPatients === 0) return 0;
    return ((genderStats.otherCount / genderStats.totalPatients) * 100).toFixed(1);
  };

  // Doctor percentage calculations
  const getDoctorMalePercentage = () => {
    if (!doctorGenderStats || doctorGenderStats.totalDoctors === 0) return 0;
    return ((doctorGenderStats.maleCount / doctorGenderStats.totalDoctors) * 100).toFixed(1);
  };

  const getDoctorFemalePercentage = () => {
    if (!doctorGenderStats || doctorGenderStats.totalDoctors === 0) return 0;
    return ((doctorGenderStats.femaleCount / doctorGenderStats.totalDoctors) * 100).toFixed(1);
  };

  const getDoctorOtherPercentage = () => {
    if (!doctorGenderStats || doctorGenderStats.totalDoctors === 0) return 0;
    return ((doctorGenderStats.otherCount / doctorGenderStats.totalDoctors) * 100).toFixed(1);
  };

  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #14b8a6, #06b6d4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0d9488, #0891b2);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50 to-cyan-50 p-8">
        <div className="w-full px-4">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Admin Reports
            </h1>
            <p className="text-gray-600 text-lg">Comprehensive analytics and insights</p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-2 inline-flex gap-2">
              <button
                onClick={() => setActiveTab("patient")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "patient"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Patient Reports
              </button>
              <button
                onClick={() => setActiveTab("doctor")}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "doctor"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Doctor Reports
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-500 border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Patient Reports Tab */}
              {activeTab === "patient" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gender Distribution Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Patient Gender Distribution
                  </h2>
                </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Pie Chart and Legend */}
                <div className="flex items-center justify-center gap-8">
                  <GenderPieChart genderStats={genderStats} getMalePercentage={getMalePercentage} getFemalePercentage={getFemalePercentage} getOtherPercentage={getOtherPercentage} />

                  {/* Legend */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Legend</h3>
                    <div className="space-y-3">
                      <div className="flex items-center group cursor-pointer">
                        <div className="w-5 h-5 bg-blue-500 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform"></div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Male</span>
                      </div>
                      <div className="flex items-center group cursor-pointer">
                        <div className="w-5 h-5 bg-pink-500 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform"></div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">Female</span>
                      </div>
                      <div className="flex items-center group cursor-pointer">
                        <div className="w-5 h-5 bg-purple-500 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform"></div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Other/Unspecified</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics Cards */}
                <div className="space-y-3">
                  {/* Male Stats */}
                  <div className="group bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Male Patients</p>
                        <p className="text-3xl font-bold text-blue-900 mt-1">
                          {genderStats?.maleCount || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md">
                          <p className="text-2xl font-bold">
                            {getMalePercentage()}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Female Stats */}
                  <div className="group bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-xl p-5 border-l-4 border-pink-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide">Female Patients</p>
                        <p className="text-3xl font-bold text-pink-900 mt-1">
                          {genderStats?.femaleCount || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md">
                          <p className="text-2xl font-bold">
                            {getFemalePercentage()}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Stats */}
                  <div className="group bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-5 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Other/Unspecified</p>
                        <p className="text-3xl font-bold text-purple-900 mt-1">
                          {genderStats?.otherCount || 0}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md">
                          <p className="text-2xl font-bold">
                            {getOtherPercentage()}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>

              {/* Town Distribution Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Patient Distribution by Town
                  </h2>
                </div>

              <div className="grid grid-cols-1 gap-8">
                {/* Town Pie Chart and Legend */}
                <div className="flex items-center justify-center gap-8">
                  <TownPieChart townStats={townStats} />
                  
                  {/* Town Legend */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 max-h-64 overflow-y-auto custom-scrollbar">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 pb-2">Legend</h3>
                    <div className="space-y-2">
                      {townStats?.townStats.slice(0, 10).map((town, index) => (
                        <div key={town.town} className="flex items-center group cursor-pointer">
                          <div 
                            className="w-5 h-5 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform flex-shrink-0" 
                            style={{ backgroundColor: getColorForIndex(index) }}
                          ></div>
                          <span className="text-xs font-medium text-gray-700 group-hover:font-semibold transition-all truncate">
                            {town.town}
                          </span>
                        </div>
                      ))}
                      {townStats && townStats.townStats.length > 10 && (
                        <p className="text-xs text-gray-500 italic mt-2">+{townStats.townStats.length - 10} more towns</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Town Statistics List */}
                <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Detailed Statistics</h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2 pb-2 pl-1 pt-1 custom-scrollbar">
                  {townStats?.townStats.map((town, index) => {
                    const percentage = townStats.totalPatients > 0
                      ? ((town.count / townStats.totalPatients) * 100).toFixed(1)
                      : 0;
                    const color = getColorForIndex(index);
                    
                    return (
                      <div
                        key={town.town}
                        className="group rounded-xl p-4 border-l-4 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                        style={{ 
                          borderColor: color,
                          background: `linear-gradient(to right, ${color}15, ${color}05)`
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color }}>
                              {town.town}
                            </p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              {town.count} <span className="text-sm font-normal text-gray-500">patients</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="px-4 py-2 rounded-lg shadow-md text-white" style={{ backgroundColor: color }}>
                              <p className="text-xl font-bold">
                                {percentage}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
              </div>

              {/* Weekly Booking Statistics Bar Chart */}
              <div className="col-span-full mt-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Weekly Booking Trends
                    </h2>
                  </div>
                  <WeeklyBookingBarChart weeklyStats={weeklyStats} />
                </div>
              </div>
                </div>
              )}

              {/* Doctor Reports Tab */}
              {activeTab === "doctor" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Doctor Gender Distribution Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Doctor Gender Distribution
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Pie Chart and Legend */}
                      <div className="flex items-center justify-center gap-8">
                        <DoctorGenderPieChart 
                          doctorGenderStats={doctorGenderStats} 
                          getDoctorMalePercentage={getDoctorMalePercentage} 
                          getDoctorFemalePercentage={getDoctorFemalePercentage} 
                          getDoctorOtherPercentage={getDoctorOtherPercentage} 
                        />

                        {/* Legend */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Legend</h3>
                          <div className="space-y-3">
                            <div className="flex items-center group cursor-pointer">
                              <div className="w-5 h-5 bg-blue-500 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform"></div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">Male</span>
                            </div>
                            <div className="flex items-center group cursor-pointer">
                              <div className="w-5 h-5 bg-pink-500 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform"></div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-pink-600 transition-colors">Female</span>
                            </div>
                            <div className="flex items-center group cursor-pointer">
                              <div className="w-5 h-5 bg-purple-500 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform"></div>
                              <span className="text-sm font-medium text-gray-700 group-hover:text-purple-600 transition-colors">Other/Unspecified</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statistics Cards */}
                      <div className="space-y-3">
                        {/* Male Stats */}
                        <div className="group bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl p-5 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Male Doctors</p>
                              <p className="text-3xl font-bold text-blue-900 mt-1">
                                {doctorGenderStats?.maleCount || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md">
                                <p className="text-2xl font-bold">
                                  {getDoctorMalePercentage()}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Female Stats */}
                        <div className="group bg-gradient-to-r from-pink-50 to-pink-100/50 rounded-xl p-5 border-l-4 border-pink-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-pink-600 uppercase tracking-wide">Female Doctors</p>
                              <p className="text-3xl font-bold text-pink-900 mt-1">
                                {doctorGenderStats?.femaleCount || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md">
                                <p className="text-2xl font-bold">
                                  {getDoctorFemalePercentage()}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Other Stats */}
                        <div className="group bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl p-5 border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Other/Unspecified</p>
                              <p className="text-3xl font-bold text-purple-900 mt-1">
                                {doctorGenderStats?.otherCount || 0}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md">
                                <p className="text-2xl font-bold">
                                  {getDoctorOtherPercentage()}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Specialization Distribution Card */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
                      <h2 className="text-2xl font-bold text-gray-800">
                        Doctor Distribution by Specialization
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Specialization Pie Chart and Legend */}
                      <div className="flex items-center justify-center gap-8">
                        <SpecializationPieChart specializationStats={doctorSpecializationStats} />
                        
                        {/* Specialization Legend */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 max-h-64 overflow-y-auto custom-scrollbar">
                          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide sticky top-0 bg-gradient-to-br from-gray-50 to-gray-100 pb-2">Legend</h3>
                          <div className="space-y-2">
                            {doctorSpecializationStats?.specializationStats.slice(0, 10).map((spec, index) => (
                              <div key={spec.specialization} className="flex items-center group cursor-pointer">
                                <div 
                                  className="w-5 h-5 rounded-md mr-3 shadow-md group-hover:scale-110 transition-transform flex-shrink-0" 
                                  style={{ backgroundColor: getColorForIndex(index) }}
                                ></div>
                                <span className="text-xs font-medium text-gray-700 group-hover:font-semibold transition-all truncate">
                                  {spec.specialization}
                                </span>
                              </div>
                            ))}
                            {doctorSpecializationStats && doctorSpecializationStats.specializationStats.length > 10 && (
                              <p className="text-xs text-gray-500 italic mt-2">+{doctorSpecializationStats.specializationStats.length - 10} more specializations</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Specialization Statistics List */}
                      <div className="bg-gradient-to-br from-gray-50/50 to-white rounded-xl p-6 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">Detailed Statistics</h3>
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2 pb-2 pl-1 pt-1 custom-scrollbar">
                          {doctorSpecializationStats?.specializationStats.map((spec, index) => {
                            const percentage = doctorSpecializationStats.totalDoctors > 0
                              ? ((spec.count / doctorSpecializationStats.totalDoctors) * 100).toFixed(1)
                              : 0;
                            const color = getColorForIndex(index);
                            
                            return (
                              <div
                                key={spec.specialization}
                                className="group rounded-xl p-4 border-l-4 hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                                style={{ 
                                  borderColor: color,
                                  background: `linear-gradient(to right, ${color}15, ${color}05)`
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold uppercase tracking-wide" style={{ color }}>
                                      {spec.specialization}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                      {spec.count} <span className="text-sm font-normal text-gray-500">doctors</span>
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <div className="px-4 py-2 rounded-lg shadow-md text-white" style={{ backgroundColor: color }}>
                                      <p className="text-xl font-bold">
                                        {percentage}%
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Feedback Statistics */}
                  <div className="col-span-full mt-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Top Rated Doctors
                        </h2>
                      </div>
                      <TopRatedDoctorsChart feedbackStats={doctorFeedbackStats} />
                    </div>
                  </div>

                  {/* Rating Categories Chart */}
                  <div className="col-span-full mt-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-emerald-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Average Ratings by Category
                        </h2>
                      </div>
                      <RatingCategoriesChart categoryStats={ratingCategoryStats} />
                    </div>
                  </div>

                  {/* Doctor Bookings & Ratings Chart */}
                  <div className="col-span-full mt-8">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-8 bg-gradient-to-b from-teal-500 to-cyan-500 rounded-full"></div>
                        <h2 className="text-2xl font-bold text-gray-800">
                          Doctor Bookings
                        </h2>
                      </div>
                      <DoctorBookingRatingChart bookingRatingStats={doctorBookingRatingStats} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Weekly Booking Bar Chart Component
function WeeklyBookingBarChart({ weeklyStats }: { weeklyStats: WeeklyBookingStats | null }) {
  if (!weeklyStats || weeklyStats.dailyStats.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        No booking data available
      </div>
    );
  }

  const totalBookings = weeklyStats.totalBookings || 1; // Avoid division by zero

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-l-4 border-teal-500 max-w-md">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Total Bookings</p>
          <p className="text-3xl font-bold text-teal-900 mt-1">{weeklyStats.totalBookings}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Booking Distribution by Day</h3>
        <div className="space-y-5">
          {weeklyStats.dailyStats.map((day) => {
            const bookingPercentage = ((day.bookingCount / totalBookings) * 100).toFixed(1);
            const barWidth = (day.bookingCount / totalBookings) * 100;
            
            return (
              <div key={day.dayOfWeek} className="space-y-2">
                {/* Day Label and Stats */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-gray-700 w-28">{day.dayOfWeek}</span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600">
                      <span className="font-semibold text-teal-600">{day.bookingCount}</span> bookings
                    </span>
                    <span className="text-gray-600">
                      <span className="font-semibold text-cyan-600">{bookingPercentage}%</span> of total
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-1">
                  <div className="relative h-10 bg-gray-100 rounded-xl overflow-hidden group shadow-inner">
                    <div
                      className="absolute h-full bg-gradient-to-r from-teal-400 via-teal-500 to-cyan-500 rounded-xl transition-all duration-500 hover:from-teal-500 hover:via-teal-600 hover:to-cyan-600 group-hover:shadow-lg"
                      style={{ width: `${barWidth}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white drop-shadow-md">
                          {bookingPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Gender Pie Chart Component
function GenderPieChart({ genderStats, getMalePercentage, getFemalePercentage, getOtherPercentage }: { 
  genderStats: GenderStats | null; 
  getMalePercentage: () => string | number;
  getFemalePercentage: () => string | number;
  getOtherPercentage: () => string | number;
}) {
  if (!genderStats || genderStats.totalPatients === 0) {
    return (
      <div className="w-72 h-72 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  // Calculate angles for each segment
  const maleAngle = (genderStats.maleCount / genderStats.totalPatients) * 360;
  const femaleAngle = (genderStats.femaleCount / genderStats.totalPatients) * 360;
  const otherAngle = (genderStats.otherCount / genderStats.totalPatients) * 360;

  // Helper function to create pie slice path
  const createPieSlice = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      `M 100 100`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `Z`
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  let currentAngle = 0;
  const slices = [
    { 
      angle: maleAngle, 
      color: "#3b82f6", 
      label: "Male", 
      count: genderStats.maleCount,
      percentage: getMalePercentage()
    },
    { 
      angle: femaleAngle, 
      color: "#ec4899", 
      label: "Female", 
      count: genderStats.femaleCount,
      percentage: getFemalePercentage()
    },
    { 
      angle: otherAngle, 
      color: "#a855f7", 
      label: "Other/Unspecified", 
      count: genderStats.otherCount,
      percentage: getOtherPercentage()
    }
  ];

  return (
    <div className="relative w-72 h-72 group">
      <svg viewBox="0 0 200 200" className="drop-shadow-lg">
        {slices.map((slice) => {
          if (slice.angle === 0) return null;
          
          const startAngle = currentAngle;
          const endAngle = currentAngle + slice.angle;
          
          // Special case: if angle is 360 (full circle), draw a circle instead of arc
          if (slice.angle >= 360) {
            return (
              <g key={slice.label}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill={slice.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                >
                  <title>{slice.label}: {slice.count} ({slice.percentage}%)</title>
                </circle>
              </g>
            );
          }
          
          const path = createPieSlice(startAngle, endAngle);
          currentAngle = endAngle;

          return (
            <g key={slice.label}>
              <path
                d={path}
                fill={slice.color}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105"
                style={{ transformOrigin: "center" }}
              >
                <title>{slice.label}: {slice.count} ({slice.percentage}%)</title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-xl border-4 border-gray-50">
          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {genderStats.totalPatients}
          </p>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">Total</p>
        </div>
      </div>
    </div>
  );
}

// Helper function to get colors for town pie chart
function getColorForIndex(index: number): string {
  const colors = [
    "#3b82f6", // blue
    "#ec4899", // pink
    "#a855f7", // purple
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#06b6d4", // cyan
    "#8b5cf6", // violet
    "#f97316", // orange
    "#84cc16", // lime
  ];
  return colors[index % colors.length];
}

// Town Pie Chart Component
function TownPieChart({ townStats }: { townStats: TownStats | null }) {
  if (!townStats || townStats.totalPatients === 0) {
    return (
      <div className="w-72 h-72 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  // Helper function to create pie slice path
  const createPieSlice = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      `M 100 100`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `Z`
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  let currentAngle = 0;

  return (
    <div className="relative w-72 h-72 group">
      <svg viewBox="0 0 200 200" className="drop-shadow-lg">
        {townStats.townStats.map((town, index) => {
          const percentage = town.count / townStats.totalPatients;
          const angle = percentage * 360;
          const percentageText = (percentage * 100).toFixed(1);
          
          if (angle === 0) return null;
          
          // Special case: if angle is 360 (full circle), draw a circle instead of arc
          if (angle >= 360) {
            return (
              <g key={town.town}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill={getColorForIndex(index)}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                >
                  <title>{town.town}: {town.count} patients ({percentageText}%)</title>
                </circle>
              </g>
            );
          }
          
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          const path = createPieSlice(startAngle, endAngle);
          currentAngle = endAngle;

          return (
            <g key={town.town}>
              <path
                d={path}
                fill={getColorForIndex(index)}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105"
                style={{ transformOrigin: "center" }}
              >
                <title>{town.town}: {town.count} patients ({percentageText}%)</title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-xl border-4 border-gray-50">
          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            {townStats.totalPatients}
          </p>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total</p>
          <p className="text-xs text-gray-400 font-medium">
            {townStats.townStats.length} Towns
          </p>
        </div>
      </div>
    </div>
  );
}

// Doctor Gender Pie Chart Component
function DoctorGenderPieChart({ doctorGenderStats, getDoctorMalePercentage, getDoctorFemalePercentage, getDoctorOtherPercentage }: { 
  doctorGenderStats: DoctorGenderStats | null; 
  getDoctorMalePercentage: () => string | number;
  getDoctorFemalePercentage: () => string | number;
  getDoctorOtherPercentage: () => string | number;
}) {
  if (!doctorGenderStats || doctorGenderStats.totalDoctors === 0) {
    return (
      <div className="w-72 h-72 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  // Calculate angles for each segment
  const maleAngle = (doctorGenderStats.maleCount / doctorGenderStats.totalDoctors) * 360;
  const femaleAngle = (doctorGenderStats.femaleCount / doctorGenderStats.totalDoctors) * 360;
  const otherAngle = (doctorGenderStats.otherCount / doctorGenderStats.totalDoctors) * 360;

  // Helper function to create pie slice path
  const createPieSlice = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      `M 100 100`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `Z`
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  let currentAngle = 0;
  const slices = [
    { 
      angle: maleAngle, 
      color: "#3b82f6", 
      label: "Male", 
      count: doctorGenderStats.maleCount,
      percentage: getDoctorMalePercentage()
    },
    { 
      angle: femaleAngle, 
      color: "#ec4899", 
      label: "Female", 
      count: doctorGenderStats.femaleCount,
      percentage: getDoctorFemalePercentage()
    },
    { 
      angle: otherAngle, 
      color: "#a855f7", 
      label: "Other/Unspecified", 
      count: doctorGenderStats.otherCount,
      percentage: getDoctorOtherPercentage()
    }
  ];

  return (
    <div className="relative w-72 h-72 group">
      <svg viewBox="0 0 200 200" className="drop-shadow-lg">
        {slices.map((slice) => {
          if (slice.angle === 0) return null;
          
          const startAngle = currentAngle;
          const endAngle = currentAngle + slice.angle;
          
          // Special case: if angle is 360 (full circle), draw a circle instead of arc
          if (slice.angle >= 360) {
            return (
              <g key={slice.label}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill={slice.color}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                >
                  <title>{slice.label}: {slice.count} ({slice.percentage}%)</title>
                </circle>
              </g>
            );
          }
          
          const path = createPieSlice(startAngle, endAngle);
          currentAngle = endAngle;

          return (
            <g key={slice.label}>
              <path
                d={path}
                fill={slice.color}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105"
                style={{ transformOrigin: "center" }}
              >
                <title>{slice.label}: {slice.count} ({slice.percentage}%)</title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-xl border-4 border-gray-50">
          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            {doctorGenderStats.totalDoctors}
          </p>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mt-1">Total</p>
        </div>
      </div>
    </div>
  );
}

// Specialization Pie Chart Component
function SpecializationPieChart({ specializationStats }: { specializationStats: DoctorSpecializationStats | null }) {
  if (!specializationStats || specializationStats.totalDoctors === 0) {
    return (
      <div className="w-72 h-72 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  // Helper function to create pie slice path
  const createPieSlice = (startAngle: number, endAngle: number, radius: number = 80) => {
    const start = polarToCartesian(100, 100, radius, endAngle);
    const end = polarToCartesian(100, 100, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      `M 100 100`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
      `Z`
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  let currentAngle = 0;

  return (
    <div className="relative w-72 h-72 group">
      <svg viewBox="0 0 200 200" className="drop-shadow-lg">
        {specializationStats.specializationStats.map((spec, index) => {
          const percentage = spec.count / specializationStats.totalDoctors;
          const angle = percentage * 360;
          const percentageText = (percentage * 100).toFixed(1);
          
          if (angle === 0) return null;
          
          // Special case: if angle is 360 (full circle), draw a circle instead of arc
          if (angle >= 360) {
            return (
              <g key={spec.specialization}>
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill={getColorForIndex(index)}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                >
                  <title>{spec.specialization}: {spec.count} doctors ({percentageText}%)</title>
                </circle>
              </g>
            );
          }
          
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          const path = createPieSlice(startAngle, endAngle);
          currentAngle = endAngle;

          return (
            <g key={spec.specialization}>
              <path
                d={path}
                fill={getColorForIndex(index)}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer hover:scale-105"
                style={{ transformOrigin: "center" }}
              >
                <title>{spec.specialization}: {spec.count} doctors ({percentageText}%)</title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center bg-white rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-xl border-4 border-gray-50">
          <p className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            {specializationStats.totalDoctors}
          </p>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total</p>
          <p className="text-xs text-gray-400 font-medium">
            {specializationStats.specializationStats.length} Specs
          </p>
        </div>
      </div>
    </div>
  );
}

// Top Rated Doctors Chart Component
function TopRatedDoctorsChart({ feedbackStats }: { feedbackStats: DoctorFeedbackStats | null }) {
  if (!feedbackStats || feedbackStats.topRatedDoctors.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        No feedback data available
      </div>
    );
  }

  const maxRating = 5;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-l-4 border-teal-500 max-w-md">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Total Feedbacks</p>
          <p className="text-3xl font-bold text-teal-900 mt-1">{feedbackStats.totalFeedbacks}</p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Doctor Rankings by Average Rating</h3>
        <div className="space-y-5">
          {feedbackStats.topRatedDoctors.map((doctor, index) => {
            const percentage = (doctor.averageRating / maxRating) * 100;
            
            return (
              <div key={doctor.doctorId} className="space-y-2">
                {/* Doctor Info and Stats */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-800">{doctor.doctorName}</span>
                      <p className="text-xs text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-600">
                      <span className="font-semibold text-teal-600">{doctor.averageRating.toFixed(1)}</span> ⭐
                    </span>
                    <span className="text-gray-600">
                      <span className="font-semibold text-cyan-600">{doctor.totalFeedbacks}</span> reviews
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-1">
                  <div className="relative h-10 bg-gray-100 rounded-xl overflow-hidden group shadow-inner">
                    <div
                      className="absolute h-full bg-gradient-to-r from-teal-400 via-teal-500 to-cyan-500 rounded-xl transition-all duration-500 hover:from-teal-500 hover:via-teal-600 hover:to-cyan-600 group-hover:shadow-lg"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold text-white drop-shadow-md">
                          {doctor.averageRating.toFixed(1)} / 5.0
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Rating Categories Chart Component
function RatingCategoriesChart({ categoryStats }: { categoryStats: RatingCategoryStats | null }) {
  if (!categoryStats || categoryStats.totalFeedbacks === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        No rating data available
      </div>
    );
  }

  const categories = [
    { 
      name: "Communication", 
      rating: categoryStats.averageCommunicationRating,
      color: "from-teal-400 to-teal-600",
      bgColor: "from-teal-50 to-teal-100/50",
      borderColor: "border-teal-500",
      textColor: "text-teal-600"
    },
    { 
      name: "Professionalism", 
      rating: categoryStats.averageProfessionalismRating,
      color: "from-cyan-400 to-cyan-600",
      bgColor: "from-cyan-50 to-cyan-100/50",
      borderColor: "border-cyan-500",
      textColor: "text-cyan-600"
    },
    { 
      name: "Punctuality", 
      rating: categoryStats.averagePunctualityRating,
      color: "from-emerald-400 to-emerald-600",
      bgColor: "from-emerald-50 to-emerald-100/50",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-600"
    },
    { 
      name: "Treatment", 
      rating: categoryStats.averageTreatmentRating,
      color: "from-teal-500 to-cyan-600",
      bgColor: "from-teal-50 to-cyan-100/50",
      borderColor: "border-teal-500",
      textColor: "text-teal-700"
    },
    { 
      name: "Overall", 
      rating: categoryStats.averageOverallRating,
      color: "from-cyan-500 to-teal-600",
      bgColor: "from-cyan-50 to-teal-100/50",
      borderColor: "border-cyan-500",
      textColor: "text-cyan-700"
    }
  ];

  const maxRating = 5;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-l-4 border-teal-500 max-w-md">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Total Feedbacks Analyzed</p>
          <p className="text-3xl font-bold text-teal-900 mt-1">{categoryStats.totalFeedbacks}</p>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const percentage = (category.rating / maxRating) * 100;
          
          return (
            <div
              key={category.name}
              className={`group bg-gradient-to-r ${category.bgColor} rounded-xl p-6 border-l-4 ${category.borderColor} hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-sm font-semibold ${category.textColor} uppercase tracking-wide`}>
                    {category.name}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {category.rating.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`bg-gradient-to-r ${category.color} text-white px-4 py-2 rounded-lg shadow-md`}>
                    <p className="text-xl font-bold">
                      ⭐ {category.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full bg-gradient-to-r ${category.color} rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-right">{percentage.toFixed(1)}% of max rating</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Doctor Booking & Rating Chart Component
function DoctorBookingRatingChart({ bookingRatingStats }: { bookingRatingStats: DoctorBookingRatingStats | null }) {
  if (!bookingRatingStats || bookingRatingStats.doctorStats.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        No booking data available
      </div>
    );
  }

  const totalBookingsAllDoctors = bookingRatingStats.totalBookings;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-5 border-l-4 border-teal-500 max-w-md">
          <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide">Total Bookings</p>
          <p className="text-3xl font-bold text-teal-900 mt-1">{bookingRatingStats.totalBookings}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-6">Bookings per Doctor</h3>
        <div className="space-y-6">
          {bookingRatingStats.doctorStats.map((doctor) => {
            const bookingPercentage = totalBookingsAllDoctors > 0 
              ? (doctor.totalBookings / totalBookingsAllDoctors) * 100 
              : 0;
            
            return (
              <div key={doctor.doctorId} className="space-y-3">
                {/* Doctor Info Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-gray-800">{doctor.doctorName}</h4>
                    <p className="text-xs text-gray-500">{doctor.specialization}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Bookings</p>
                      <p className="text-lg font-bold text-teal-600">{doctor.totalBookings}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Percentage</p>
                      <p className="text-lg font-bold text-cyan-600">
                        {bookingPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bookings Percentage Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600 font-medium">Booking Percentage</span>
                    <span className="text-teal-600 font-semibold">{bookingPercentage.toFixed(1)}% ({doctor.totalBookings} bookings)</span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden group shadow-inner">
                    <div
                      className="absolute h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 rounded-lg transition-all duration-500 hover:from-teal-500 hover:via-teal-600 hover:to-teal-700"
                      style={{ width: `${bookingPercentage}%` }}
                    >
                      <div className="absolute inset-0 flex items-center justify-end pr-2">
                        <span className="text-xs font-bold text-white drop-shadow-md">
                          {bookingPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
