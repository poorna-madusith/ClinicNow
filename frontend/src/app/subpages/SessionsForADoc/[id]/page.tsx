"use client";

import { useAuth } from "@/Context/AuthContext";
import { Session } from "@/types/Session";
import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface sessionPageProps {
  params: { id: string };
}

export default function SessionsForADoc({ params }: sessionPageProps) {
  const [session, setSessions] = useState<Session | null>(null);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { accessToken } = useAuth();
  const { id } = params;

  const fetchSessions = async () => {
    try {
      const res = await axios.get(
        `${API}/usersession/getsessionsfordoctor/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setSessions(res.data);
      console.log("Fetched sessions for doctor:", res.data);
    } catch (err) {
      console.log("Error fetching sessions for doctor:", err);
      toast.error("Failed to fetch sessions for the doctor.");
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchSessions();
    }
  }, [accessToken]);
}
