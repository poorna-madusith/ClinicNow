"use client";
import Chat from '@/components/Chat';
import ProtectedRoute from '@/components/ProtectedRoute';
import React from 'react';

const DoctorChatPage = () => {
    return (
        <ProtectedRoute allowedRoles={["Doctor"]}>
            <Chat userType="doctor" />
        </ProtectedRoute>
    );
};

export default DoctorChatPage;
