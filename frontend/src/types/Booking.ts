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
    };
    bookedDateandTime: string; // ISO date string
    positionInQueue?: number;
    onGoing: boolean;
    completed: boolean;
}
