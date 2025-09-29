import axios from "axios";
import { useAuth } from "@/Context/AuthContext";
import type { AxiosRequestConfig } from "axios";

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
                    setAccessToken(data.accessToken);
                    originalRequest.headers["Authorization"] = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );


    async function request(url: string, options: AxiosRequestConfig = {}) {
        // Axios uses config object, not fetch options
        const res = await api({ url, ...options });
        return res.data;
    }

    return { request };
}