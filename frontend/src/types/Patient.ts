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

export interface Patient {
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
  phoneNumber?: string;
  contactNumbers?: string[];
}
