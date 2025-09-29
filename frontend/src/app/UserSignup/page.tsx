'use client';

import { User } from "@/types/User";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/Context/AuthContext';



export default function UserSignupPage() {
    const [formData, setFormData] = useState<User>({
        UserId: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        Role: '',
        Age: 0,
        Gender: '',
        Address: '',
        Town: '',
        ContactNumbers: [],
        
    });
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const { setAccessToken } = useAuth();

    const API = process.env.NEXT_PUBLIC_BACKEND_URL;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name , value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try{
            const res = await axios.post(`${API}/auth/userregister`, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("User registered successfully", res.data);
            router.push('/Login');
            
        } catch (err: unknown) {
            if(axios.isAxiosError(err)){
                console.error("User registration failed", err.response?.data);
            } else {
                console.error("User registration failed", err);
            }
        } finally {
            setLoading(false);
        }
    }

    // Add this function to handle Google login success
    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        try {
            const res = await axios.post(`${API}/auth/googlelogin`, {
                IdToken: credentialResponse.credential
            });
            setAccessToken(res.data.AccessToken);
            router.push('/');  // Redirect to home or dashboard after successful signup/login
        } catch (err) {
            console.error("Google login failed", err);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-teal-700 mb-6">User Signup</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="FirstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name:
                        </label>
                        <input
                            id="FirstName"
                            name="FirstName"    
                            type="text"
                            value={formData.FirstName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="LastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name:
                        </label>
                        <input
                            id="LastName"
                            name="LastName"
                            type="text"
                            value={formData.LastName}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email:
                        </label>
                        <input
                            id="Email"
                            name="Email"
                            type="email"
                            value={formData.Email}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password:
                        </label>
                        <input
                            id="Password"
                            name="Password"
                            type="password"
                            value={formData.Password}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Age" className="block text-sm font-medium text-gray-700 mb-1">
                            Age:
                        </label>
                        <input
                            id="Age"
                            name="Age"
                            type="number"
                            value={formData.Age}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Gender" className="block text-sm font-medium text-gray-700 mb-1">
                            Gender:
                        </label>
                        <select
                            id="Gender"
                            name="Gender"
                            value={formData.Gender}
                            onChange={handleSelectChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="Address" className="block text-sm font-medium text-gray-700 mb-1">
                            Address:
                        </label>
                        <input
                            id="Address"
                            name="Address"
                            type="text"
                            value={formData.Address}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="Town" className="block text-sm font-medium text-gray-700 mb-1">
                            Town:
                        </label>
                        <input
                            id="Town"
                            name="Town"
                            type="text"
                            value={formData.Town}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="ContactNumbers" className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Numbers (comma separated):
                        </label>
                        <input
                            id="ContactNumbers"
                            name="ContactNumbers"
                            type="text"
                            value={formData.ContactNumbers.join(',')}
                            onChange={(e) =>
                                setFormData(prev => ({
                                    ...prev,
                                    ContactNumbers: e.target.value.split(',').map(num => num.trim() as unknown as number),
                                }))
                            }
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300"
                        >
                            {loading ? 'Registering...' : 'Register'}
                        </button>
                    </div>
                </form>
                {/* Add Google sign-in option */}
                <div className="mt-4 text-center">
                    <p className="text-gray-600 mb-2">Or sign up with</p>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => console.log('Google Login Failed')}
                    />
                </div>
            </div>
        </div>                
    );
}



