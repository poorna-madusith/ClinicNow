export interface Session {
    id: number;
    doctorId: string;
    doctor?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    date: string; // ISO date string
    startTime: string; // TimeSpan from C# will be serialized as string (e.g., "14:30:00")
    endTime: string; // TimeSpan from C# will be serialized as string (e.g., "16:30:00")
    sessionFee: number;
    description: string;
    capacity: number;
    patients?: Array<{
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    }>;
}