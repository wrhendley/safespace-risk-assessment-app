// UserProfile.tsx
// Displays authenticated user's profile and navigates to edit page if profile not found

import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../context/UserContext";
import NoAccess from "../LandingPages/NoAccess";
import LoadingPage from "../LandingPages/LoadingPage";
import DashboardButton from "../Navigation/DashboardButton";
import { useEffect } from "react";

const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { user, loading: authLoading, error } = useAuth();
    const { userProfile, isLoading: profileLoading } = useUser();

    // Redirect to edit page if userProfile is missing and loading has finished
    useEffect(() => {
        if (!userProfile && !profileLoading && !authLoading) {
            navigate("/users");
        }
    }, [userProfile, profileLoading, authLoading, navigate]);

    // If not authenticated
    if (!user && !authLoading && !profileLoading) return <NoAccess />;

    // Show loading state
    if (authLoading || profileLoading) return <LoadingPage />;

    // Render profile
    return userProfile ? (
        <Container className="p-5 my-5 rounded">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className="text-center">
                            <strong>User Profile</strong>
                        </Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Card.Text><strong>First Name:</strong> {userProfile.firstName}</Card.Text>
                            <Card.Text><strong>Last Name:</strong> {userProfile.lastName}</Card.Text>
                            <Card.Text><strong>Phone Number:</strong> {userProfile.phoneNumber}</Card.Text>
                            <div className="text-center mt-4">
                                <Button variant="primary" onClick={() => navigate("/users")}>
                                    Edit Profile
                                </Button>{' '}
                                <DashboardButton />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    ) : null;
};

export default UserProfile;
