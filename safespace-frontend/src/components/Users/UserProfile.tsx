// UserProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useAuth } from '../../context/AuthContext';
import api from "../../api";
import NoAccess from "../LandingPages/NoAccess";
import LoadingPage from "../LandingPages/LoadingPage";

const UserProfile: React.FC = () => {
    const { user, loading, error } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<null | {
        first_name: string;
        last_name: string;
        phone_number: string;
    }>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorPage, setErrorPage] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setIsLoading(true);
            try {
                const idToken = await user?.getIdToken(true);
                console.log(idToken);
                const response = await api.get(`/users/`, {headers: {Authorization: `Bearer ${idToken}`}});
                console.log(response.data);
                setProfile(response.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setProfile(null);
                    navigate('/users');
                } else {
                    setErrorPage(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    if (!user && !isLoading && !loading) {
        return <NoAccess />;
    }

    if (isLoading || loading) {
        return <LoadingPage />;
    }

    return profile ? (
        <Container className="p-5 my-5 rounded">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className='text-center'><strong>User Profile</strong></Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {errorPage && <Alert variant="danger">{errorPage}</Alert>}
                            <Card.Text><strong>First Name</strong>:  {profile.first_name}</Card.Text>
                            <Card.Text><strong>Last Name</strong>:  {profile.last_name}</Card.Text>
                            <Card.Text><strong>Phone Number</strong>:  {profile.phone_number}</Card.Text>
                            <div className='text-center'>
                                <Button variant="primary" onClick={() => navigate(`/users`)}>Edit Profile</Button>
                                <Button variant="secondary" onClick={() => navigate(`/userdashboard`)}>Back to Dashboard</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    ) : null;
};

export default UserProfile;