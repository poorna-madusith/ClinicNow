import axios from "axios";
import { useAuth } from "@/Context/AuthContext";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export function useApi() {
    const { accessToken, setAccessToken } = useAuth();

    // Request interceptor to attach token
    api.interceptors.request.use(
        (config) => {
            if (accessToken) {
                config.headers["Authorization"] = `Bearer ${accessToken}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response interceptor to handle 401 and refresh token
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            if (error.response && error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                try {
                    const refreshRes = await api.post("/auth/refresh-token");
                    const data = refreshRes.data;
                    const newToken = data.accessToken ?? data.AccessToken ?? data.token;
                    if (!newToken) throw new Error("No access token in refresh response");
                    setAccessToken(newToken);
                    originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    return { api };
}