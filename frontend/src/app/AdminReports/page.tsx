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

export default function AdminReports() {
  const [genderStats, setGenderStats] = useState<GenderStats | null>(null);
  const [townStats, setTownStats] = useState<TownStats | null>(null);
  const [loading, setLoading] = useState(true);
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
    } catch (err) {
      console.error("Failed to fetch gender statistics", err);
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
    } catch (err) {
      console.error("Failed to fetch town statistics", err);
      toast.error("Failed to fetch town statistics");
    }
  }, [accessToken, API]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchGenderStats(), fetchTownStats()]);
      setLoading(false);
    };
    fetchData();
  }, [fetchGenderStats, fetchTownStats]);

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
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-8">
        <div className="w-full px-4">
          {/* Header Section */}
          <div className="mb-10">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Reports
            </h1>
            <p className="text-gray-600 text-lg">Comprehensive patient analytics and insights</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gender Distribution Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
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
                  <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-cyan-500 rounded-full"></div>
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
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
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
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
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
          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
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
