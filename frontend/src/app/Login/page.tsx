"use client";
import { useAuth } from "@/Context/AuthContext";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import type { CredentialResponse } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const API = process.env.NEXT_PUBLIC_BACKEND_URL;

  const router = useRouter();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (password.length > 20) {
      newErrors.password = "Password must be less than 20 characters";
    } else if (password.includes(" ")) {
      newErrors.password = "Password must not contain spaces";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/[!@#$%^&*]/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const res = await axios.post(
        `${API}/auth/login`,
        {
          Email: email,
          Password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // This is crucial for cookies to be set and sent
        }
      );

      const data = res.data;
      setAccessToken(data.accessToken);
      toast.success("Login successful!");
      
      if (data.role === "Patient") {
        router.push("/UserDashboard"); // Redirect to home or dashboard after successful login
      }else if(data.role === "Doctor"){
        router.push("/DocotorDashboard");
      }else if(data.role === "Admin"){
        router.push("/AdminDashboard");
      }
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if(err.response?.status === 400) {
          toast.error("Invalid email or password");
        }else if(err.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        }
      } else {
        toast.error("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      const res = await axios.post(`${API}/auth/googlelogin`, {
        IdToken: credentialResponse.credential,
      }, {
        withCredentials: true
      });
      
      const data = res.data;
      
      // Set the access token first (backend returns camelCase: accessToken)
      setAccessToken(data.accessToken);
      
      toast.success("Google login successful!");
      
      // Use requestAnimationFrame to ensure state has been flushed before navigation
      requestAnimationFrame(() => {
        // Navigate based on role (same as normal login)
        if (data.role === "Patient") {
          router.push("/UserDashboard");
        } else if (data.role === "Doctor") {
          router.push("/DoctorDashboard");
        } else if (data.role === "Admin") {
          router.push("/AdminDashboard");
        }
      });
    } catch {
      toast.error("Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Form Section */}
        <div>
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">Sign in to continue to your account</p>
          </div>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password:
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          <div className="flex justify-end">
            <a
              href="/ForgotPassword"
              className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? "Loading..." : "Login"}
          </button>
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <div className="mt-4 text-center">
              <p className="text-gray-600 mb-2">Or sign up with</p>
              <div className="flex justify-center">
                <div className="[&_button]:!gap-2 [&_button]:!px-3">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {/* Google Login Failed */}}
                  />
                </div>
              </div>
            </div>
          )}
          <div>
            <p className="mt-4 text-center text-gray-600">
              Don&#39;t have an account?{" "}
              <a href="/UserSignup" className="text-teal-600 hover:underline">
                Sign up here
              </a>
            </p>
          </div>
        </form>
        </div>
        
        {/* Image Section */}
        <div className="hidden lg:flex items-center justify-center">
          <Image
            src="/Green Grey Simple Medical Health Center Logo.png"
            alt="Medical Center"
            width={400}
            height={400}
            className="w-full h-auto max-w-md rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
