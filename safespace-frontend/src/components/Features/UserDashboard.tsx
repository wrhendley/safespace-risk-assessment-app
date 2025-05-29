// UserDashboard.tsx
// This component renders the personalized user dashboard by embedding a secure Streamlit app deployed through Heroku.
// It retrieves the authenticated user's Firebase ID token and passes it to the Streamlit app via query parameters.
// While loading or unauthenticated, it shows appropriate loading or access-restricted views.

import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';

const UserDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();             // Get current user and loading state
    const { userProfile, isLoading: profileLoading } = useUser(); // Get user profile and loading state
    const [idToken, setIdToken] = useState<string>('');           // Store Firebase ID token

    // Fetch Firebase ID token for the current user
    useEffect(() => {
        const fetchIdToken = async () => {
            if (user) {
                const token = await user.getIdToken();
                setIdToken(token);
            }
        };
        fetchIdToken();
    }, [user]);

    // Redirect to NoAccess if no user is authenticated and loading is complete
    if (!user && !authLoading && !profileLoading) {
        return <NoAccess />;
    }

    // Show loading page while auth or profile is still loading
    if (authLoading || profileLoading) {
        return <LoadingPage />;
    }

    return (
        <Container className="my-5 p-0">
            {idToken && (
                // Embed the Streamlit app using an iframe and passing token and name as query params
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
                    <iframe
                        src={`https://safespace-streamlit-app-cc827f30d6b6.herokuapp.com/?token=${idToken}&name=${userProfile?.firstName || user?.email?.split('@')[0] || 'User'}`}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            padding: 0,
                        }}
                        title="User Dashboard"
                    />
                </div>
            )}
        </Container>
    );
};

export default UserDashboard;
