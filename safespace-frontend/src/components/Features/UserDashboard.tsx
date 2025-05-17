import React, { useEffect, useState} from 'react';
import { Container, } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';
import { useUser } from '../../context/UserContext';

export default function UserDashboard() {
    const { user, loading: authLoading } = useAuth();
    const { userProfile, isLoading: profileLoading } = useUser();
    const [idToken, setIdToken] = useState<string>('');

    useEffect(() => {
        const fetchIdToken = async () => {
        if (user) {
            const token = await user.getIdToken();
            setIdToken(token);
        }
        };
        fetchIdToken();
    }, [user]);

    if (!user && !authLoading && !profileLoading) {
        return <NoAccess />;
    }

    if (authLoading || profileLoading) {
        return <LoadingPage />;
    }

    return (
        <Container className="p-5 my-5 rounded text-center">
            <h1 className='text-center mb-3'>
                {userProfile?.firstName || user?.email?.split('@')[0] || 'User'}'s Dashboard!
            </h1>

            {/* <PortfolioSimulator/> */}
            { idToken && (
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%' }}>
                    <iframe
                    src={`http://localhost:8501/?token=${idToken}`}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    title="User Dashboard"
                    />
                </div>
            )}

        </Container>
    )
}