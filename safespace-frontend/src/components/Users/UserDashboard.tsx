import React from 'react';
import { Container, } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';
import { useUser } from '../../context/UserContext';

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { userProfile, isLoading: profileLoading } = useUser();

    if (!user && !authLoading && !profileLoading) {
        return <NoAccess />;
    }

    if (authLoading || profileLoading) {
        return <LoadingPage />;
    }

    return user?(
        <Container className="p-5 my-5 rounded text-center">
            <h1 className='text-center mb-3'>{userProfile?.firstName || user?.email?.split('@')[0] || 'User'}'s Dashboard!</h1>
                <iframe
                    src="https://30days.streamlit.app?embed=true"
                    style={{height: "1200px", width: "1200px"}}
                ></iframe>
        </Container>
):null;
}