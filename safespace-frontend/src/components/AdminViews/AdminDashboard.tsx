import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';
import Sidebar from './Sidebar';

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { userProfile, isLoading: profileLoading } = useUser();

    if (!user || userProfile?.role !== 'admin') {
        return <NoAccess />;
    }

    if (authLoading || profileLoading) {
        return <LoadingPage />;
    }

    return (
        <div className="d-flex">
            <Sidebar />
            <Container className="p-5 my-5">
                <h1 className="mb-4">{userProfile?.firstName || 'Admin'}'s Dashboard</h1>
                <p>Welcome to the Admin Panel. Use the sidebar to manage users and simulations.</p>
            </Container>
        </div>
    );
}




