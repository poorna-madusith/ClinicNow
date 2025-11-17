import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

// Create base axios instance with credentials
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true, // Critical: sends HTTP-only cookies with every request
    headers: {
        "Content-Type": "application/json",
    },
});

let accessTokenStore: string | null = null;
let setAccessTokenCallback: ((token: string | null) => void) | null = null;

// Request interceptor to attach token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (accessTokenStore && config.headers) {
            config.headers["Authorization"] = `Bearer ${accessTokenStore}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 and not already retried, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Try to refresh the token using the refresh token cookie
                const refreshRes = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true } // Send refresh token cookie
                );
                
                const data = refreshRes.data;
                const newToken = data.accessToken || data.AccessToken || data.token;
                
                if (!newToken) {
                    throw new Error("No access token in refresh response");
                }
                
                // Update token in memory and context
                accessTokenStore = newToken;
                if (setAccessTokenCallback) {
                    setAccessTokenCallback(newToken);
                }
                
                // Retry original request with new token
                originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
                return apiClient(originalRequest);
                
            } catch (refreshError) {
                // Refresh failed, clear token and redirect to login
                console.log('Token refresh failed, redirecting to login');
                accessTokenStore = null;
                if (setAccessTokenCallback) {
                    setAccessTokenCallback(null);
                }
                
                // Redirect to login if not already there
                if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    if (!currentPath.includes('/Login') && !currentPath.includes('/UserSignup')) {
                        // Clear any local storage or session storage if needed
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.href = '/Login';
                    }
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        // Handle other 401 errors (already retried or no retry needed)
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                if (!currentPath.includes('/Login') && !currentPath.includes('/UserSignup')) {
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.href = '/Login';
                }
            }
        }
        
        return Promise.reject(error);
    }
);

// Setup function to connect with AuthContext
export function setupApiClient(token: string | null, setToken: (token: string | null) => void) {
    accessTokenStore = token;
    setAccessTokenCallback = setToken;
}

// Export the configured instance
export default apiClient;

// Legacy hook for backward compatibility (now just returns the singleton)
export function useApi(): { api: AxiosInstance } {
    return { api: apiClient };
}