export interface Booking {
    id: number;
    sessionId: number;
    patientId: string;
    patientName?: string;
    patient?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        contactNumbers?: string[];
    };
    session?: {
        id: number;
        doctorId: string;
        doctorName?: string;
        date: string;
        startTime: string;
        endTime: string;
        capacity: number;
        sessionFee: number;
        description: string;
        canceled: boolean;
        completed: boolean;
        ongoing?: boolean;
    };
    bookedDateandTime: string; // ISO date string
    positionInQueue?: number;
    onGoing: boolean;
    completed: boolean;
}
