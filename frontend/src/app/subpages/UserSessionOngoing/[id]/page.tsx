'use client';

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";
import axios, { AxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";


interface UserSessionOngoingprops{
    params: Promise<{ id: number }>;
}

export default function UserSessionOngoing({params}: UserSessionOngoingprops){
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {accessToken}  = useAuth();
    const {id} = React.use(params);
    const router = useRouter();
    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    const fetchSession = useCallback(async () => {
        setLoading(true);
        setError(null);
        try{
            const res = await axios.get(`${API}/userSession/getseesionbyid/${id}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setSession(res.data);
            console.log(id);
            console.log("Fetched session:", res.data);
        }catch(error){
            console.error("Error fetching session:", error);
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 404) {
                setError("Session not found");
                toast.error("Session not found");
                router.push("/MyAppoinments");
            } else {
                setError("Failed to fetch session details");
                toast.error("Failed to fetch session details");
            }
        } finally {
            setLoading(false);
        }
    }, [API, accessToken, id, router]);

    useEffect(() => {
       fetchSession(); 
       console.log(`id: ${id}`);
    },[fetchSession, id]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen">
                <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
                <p>Redirecting to appointments...</p>
            </div>
        );
    }

    if (!session) {
        return <div className="flex justify-center items-center min-h-screen">No session data</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Ongoing Session</h1>
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Session Details</h2>
                <p><strong>Doctor:</strong> {session.doctor ? `${session.doctor.firstName} ${session.doctor.lastName}` : 'Unknown'}</p>
                <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
                <p><strong>Status:</strong> {session.ongoing ? 'Ongoing' : 'Completed'}</p>
                {/* Add more session details as needed */}
            </div>
        </div>
    );
}