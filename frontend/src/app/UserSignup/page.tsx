'use client';

import { User } from "@/types/User";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/Context/AuthContext';
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";



export default function UserSignupPage() {
    const [formData, setFormData] = useState<User>({
        UserId: '',
        FirstName: '',
        LastName: '',
        Email: '',
        Password: '',
        ConfirmPassword: '',
        Role: '',
        Age: 0,
        Gender: '',
        Address: '',
        Town: '',
        ContactNumbers: [],
        
    });
    const [loading, setLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ [key: string]: string}>({});
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const router = useRouter();
    const { setAccessToken } = useAuth();

    const API = process.env.NEXT_PUBLIC_BACKEND_URL;


    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};


        if(!formData.FirstName){
            newErrors.FirstName = "First Name is required";
        }else if(!formData.LastName){
            newErrors.LastName = "Last Name is required";
        }

        if(!formData.Email){
            newErrors.Email = "Email is required";
        } else if(!/\S+@\S+\.\S+/.test(formData.Email)){
            newErrors.Email = "Invalid email address";
        }

        if(!formData.Password){
            newErrors.Password = "Password is required";
        } else if(formData.Password.length < 6){
            newErrors.Password = "Password must be at least 6 characters";
        } else if(formData.Password.length > 20){
            newErrors.Password = "Password must be less than 20 characters";
        } else if(formData.Password.includes(" ")){
            newErrors.Password = "Password must not contain spaces";
        } else if(!/[A-Z]/.test(formData.Password)){
            newErrors.Password = "Password must contain at least one uppercase letter";
        } else if(!/[a-z]/.test(formData.Password)){
            newErrors.Password = "Password must contain at least one lowercase letter";
        } else if(!/[0-9]/.test(formData.Password)){
            newErrors.Password = "Password must contain at least one number";
        } else if(!/[!@#$%^&*]/.test(formData.Password)){
            newErrors.Password = "Password must contain at least one special character";
        }

        if(formData.Password !== formData.ConfirmPassword){
            newErrors.ConfirmPassword = "Passwords do not match";
        }

        if(!formData.Age || formData.Age <= 0){
            newErrors.Age = "Valid Age is required";
        }

        if(!formData.Gender){
            newErrors.Gender = "Gender is required";
        }

        if(!formData.Address){
            newErrors.Address = "Address is required";
        }

        if(!formData.Town){
            newErrors.Town = "Town is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;

    }

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

        if(!validateForm()) return;
        setLoading(true);
        try{
            const res = await axios.post(`${API}/auth/userregister`, formData, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            console.log("User registered successfully", res.data);
            toast.success("Registration successful! Please login.");
            router.push('/Login');
            
        } catch (err: unknown) {
            if(axios.isAxiosError(err)){
                if(err.response?.status === 400){
                    toast.error("Email already in use");
                    console.log("Email already in use", err.response?.data);
                }else if(err.response?.status === 500){
                    toast.error("Server error. Please try again later.");
                    console.log("Server error", err.response?.data);
                }else{
                    console.error("User registration failed", err.response?.data);
                }
            }else{
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
            }, {
                withCredentials: true
            });
            setAccessToken(res.data.AccessToken);
            router.push('/');  // Redirect to home or dashboard after successful signup/login
        } catch (err) {
            console.error("Google login failed", err);
        }
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-4xl">
                <div className="text-center mb-6 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-teal-800 mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-gray-600 text-sm">Join us today and start your journey</p>
                </div>
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Row 1: First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                            {errors.FirstName && <p className="text-red-500 text-sm mt-1">{errors.FirstName}</p>}
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                            {errors.LastName && <p className="text-red-500 text-sm mt-1">{errors.LastName}</p>}
                        </div>
                    </div>

                    {/* Row 2: Email and Age */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                            {errors.Email && <p className="text-red-500 text-sm mt-1">{errors.Email}</p>}
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                            {errors.Age && <p className="text-red-500 text-sm mt-1">{errors.Age}</p>}
                        </div>
                    </div>

                    {/* Row 3: Password and Confirm Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="Password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password:
                            </label>
                            <div className="relative">
                                <input
                                    id="Password"
                                    name="Password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.Password}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.Password && <p className="text-red-500 text-sm mt-1">{errors.Password}</p>}
                        </div>
                        <div>
                            <label htmlFor="ConfirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm Password:
                            </label>
                            <div className="relative">
                                <input
                                    id="ConfirmPassword"
                                    name="ConfirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.ConfirmPassword}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {errors.ConfirmPassword && <p className="text-red-500 text-sm mt-1">{errors.ConfirmPassword}</p>}
                        </div>
                    </div>

                    {/* Row 4: Gender and Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="Gender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender:
                            </label>
                            <select
                                id="Gender"
                                name="Gender"
                                value={formData.Gender}
                                onChange={handleSelectChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.Gender && <p className="text-red-500 text-sm mt-1">{errors.Gender}</p>}
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                            {errors.Address && <p className="text-red-500 text-sm mt-1">{errors.Address}</p>}
                        </div>
                    </div>

                    {/* Row 5: Town and Contact Numbers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                                required
                            />
                            {errors.Town && <p className="text-red-500 text-sm mt-1">{errors.Town}</p>}
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900"
                            />
                            {errors.ContactNumbers && <p className="text-red-500 text-sm mt-1">{errors.ContactNumbers}</p>}
                        </div>
                    </div>
                    
                    {/* Submit Button */}
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
                {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                    <div className="mt-4 text-center">
                        <p className="text-gray-600 mb-2">Or sign up with</p>
                        <div className="flex justify-center">
                            <div className="[&_button]:!gap-2 [&_button]:!px-3">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => console.log('Google Login Failed')}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-4 text-center text-gray-600">
                    Already have an account? <a href="/Login" className="text-teal-600 hover:underline">Login here</a>
                </div>
            </div>
        </div>                
    );
}



