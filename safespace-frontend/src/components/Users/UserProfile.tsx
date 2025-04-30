// UserProfile.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import { useAuth } from '../../context/AuthContext';
import api from "../../api";
import NoAccess from "../LandingPages/NoAccess";
import LoadingPage from "../LandingPages/LoadingPage";

const UserProfile: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<null | {
        first_name: string;
        last_name: string;
        phone_number: string;
    }>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                if (response.data.length === 0) {
                    // No profile exists, redirect to form
                    navigate(`/userprofileform/${id}`, {
                        state: { message: "You still need to create a User Profile." }
                    });
                } else {
                    setProfile(response.data[0]);
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setError("Failed to load profile. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchUserProfile();
        }
    }, [id, navigate]);

    if (!user) {
        return <NoAccess />;
    }

    if (isLoading) {
        return <LoadingPage />;
    }

    return profile ? (
        <Container className="p-5 my-5">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Card.Title>User Profile</Card.Title>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Card.Text><strong>First Name:</strong> {profile.first_name}</Card.Text>
                            <Card.Text><strong>Last Name:</strong> {profile.last_name}</Card.Text>
                            <Card.Text><strong>Phone Number:</strong> {profile.phone_number}</Card.Text>
                            <Button variant="primary" onClick={() => navigate(`/users/${id}`)}>Edit Profile</Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    ) : null;
};

export default UserProfile;