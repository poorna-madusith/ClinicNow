"use client";
import Chat from '@/components/Chat';
import ProtectedRoute from '@/components/ProtectedRoute';
import React from 'react';

const UserChatPage = () => {
    return (
        <ProtectedRoute allowedRoles={["Patient"]}>
            <Chat userType="patient" />
        </ProtectedRoute>
    );
};

export default UserChatPage;
