export interface Booking {
    id: number;
    sessionId: number;
    patientId: string;
    patient?: {
        id?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    bookedDateandTime: string; // ISO date string
    onGoing: boolean;
    completed: boolean;
}
