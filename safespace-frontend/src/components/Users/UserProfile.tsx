// UserProfile.tsx
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Alert, Button } from "react-bootstrap";
import { useAuth } from '../../context/AuthContext';
import NoAccess from "../LandingPages/NoAccess";
import LoadingPage from "../LandingPages/LoadingPage";
import DashboardButton from "../Navigation/DashboardButton";
import { useUser } from '../../context/UserContext';

const UserProfile: React.FC = () => {
    const { user, loading: authLoading, error } = useAuth();
    const { userProfile, isLoading: profileLoading } = useUser();
    const navigate = useNavigate();

    if (!user && !authLoading && !profileLoading) {
        return <NoAccess />;
    }

    if (authLoading || profileLoading) {
        return <LoadingPage />;
    }

    if(!userProfile && !profileLoading && !authLoading){
        navigate('/users/');
    }    

    return userProfile ? (
        <Container className="p-5 my-5 rounded">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Header className='text-center'><strong>User Profile</strong></Card.Header>
                        <Card.Body>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Card.Text><strong>First Name</strong>:  {userProfile.firstName}</Card.Text>
                            <Card.Text><strong>Last Name</strong>:  {userProfile.lastName}</Card.Text>
                            <Card.Text><strong>Phone Number</strong>:  {userProfile.phoneNumber}</Card.Text>
                            <div className='text-center'>
                                <Button variant="primary" onClick={() => navigate(`/users`)}>Edit Profile</Button>
                                <DashboardButton/>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    ) : null;
};

export default UserProfile;