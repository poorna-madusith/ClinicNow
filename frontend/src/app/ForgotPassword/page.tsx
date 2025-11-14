"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("http://localhost:5091/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.Message || "If your email is registered, you will receive a password reset link shortly.");
        setEmail("");
      } else {
        setError(data.Message || "Failed to send reset email. Please try again.");
      }
    } catch {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Form Section */}
        <div>
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-800 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {message && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address:
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="mt-4 text-center space-y-2">
              <Link
                href="/Login"
                className="text-sm text-teal-600 hover:text-teal-700 hover:underline font-medium block"
              >
                ← Back to Login
              </Link>
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{" "}
                <Link href="/UserSignup" className="text-teal-600 hover:underline">
                  Sign up here
                </Link>
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
