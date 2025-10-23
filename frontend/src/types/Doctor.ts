export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other"
}

export enum Role {
  Admin = "Admin",
  Doctor = "Doctor",
  Patient = "Patient"
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName?: string;
  role: Role;
  age?: number;
  gender?: Gender;
  town?: string;
  address?: string;
  
  // Doctor specific fields
  specialization?: string;
  docDescription?: string;
  profileImageUrl?: string;
  contactEmail?: string;
  contactNumbers?: string[];
}

export interface DoctorRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  age?: number;
  gender?: Gender;
  specialization: string;
  docDescription: string;
  profileImageUrl: string;
  contactEmail: string;
  contactNumbers: string[];
  address: string;
}
