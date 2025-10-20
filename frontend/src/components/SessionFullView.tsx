'use-client'

import { Session } from "@/types/Session";

interface SessionFullViewProps {
    isModalOpen:boolean;
    isClose: ()=> void;
    session:Session;
}



export default function SessionFullView({isModalOpen,isClose,session}: SessionFullViewProps){
    

    if(!isModalOpen){
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
                <h2 className="text-2xl font-bold mb-4">Session Details</h2>
                <div className="grid grid-cols-2 gap-4">
                    <p><strong>Doctor:</strong> {session.doctor?.firstName} {session.doctor?.lastName}</p>
                    <p><strong>Date:</strong> {new Date(session.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {session.startTime} - {session.endTime}</p>
                    <p><strong>Fee:</strong> ${session.sessionFee}</p>
                    <p><strong>Capacity:</strong> {session.capacity}</p>
                    <p><strong>Status:</strong> {session.canceled ? 'Canceled' : 'Active'}</p>
                </div>
                <div className="mt-4">
                    <p><strong>Description:</strong></p>
                    <p>{session.description}</p>
                </div>
                <div className="mt-4">
                    <h3 className="text-xl font-bold mb-2">Patients</h3>
                    {session.patients && session.patients.length > 0 ? (
                        <ul className="list-disc list-inside">
                            {session.patients.map((patient, index) => (
                                <li key={index}>{patient.firstName} {patient.lastName} ({patient.email})</li>
                            ))}
                        </ul>
                    ) : (
                        <p>No patients booked for this session yet.</p>
                    )}
                </div>
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={isClose}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}