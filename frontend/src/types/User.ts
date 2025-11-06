export interface User {
    UserId: string;
    FirstName: string;
    LastName: string;
    Email: string;
    Password: string;
    ConfirmPassword: string;
    Role: string;
    Age: number;
    Gender: string;
    Address: string;
    Town: string;
    ContactNumbers: number[];
}



export interface UserDetails {
    id?: string;
    Id?: string;
    firstName?: string;
    FirstName?: string;
    lastName?: string;
    LastName?: string;
    email?: string;
    Email?: string;
    role?: 'Admin' | 'Doctor' | 'Patient';
    Role?: 'Admin' | 'Doctor' | 'Patient';
    age?: number;
    Age?: number;
    gender?: 'Male' | 'Female' | 'Other';
    Gender?: 'Male' | 'Female' | 'Other';
    town?: string;
    Town?: string;
    address?: string;
    Address?: string;
    contactNumbers?: string[];
    ContactNumbers?: string[];
    specialization?: string;
    Specialization?: string;
    docDescription?: string;
    DocDescription?: string;
    profileImageUrl?: string;
    ProfileImageUrl?: string;
    contactEmail?: string;
    ContactEmail?: string;
}