// HomePage.tsx
// The first page the user sees when accessing our app. From here you can navigate to sign in or sign up or view features.

import React from "react";
import { Container, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SignOutButton from "../Navigation/SignOutButton";
import DashboardButton from "../Navigation/DashboardButton";
import GetStartedButton from "../Navigation/GetStartedButton";

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // Get current user from auth context

    return (
        <>
            {/* Promo Banner */}
            <div className="text-center" style={{ backgroundColor: "black" }}>
                <Image
                    src="/safespace-business-card-750x300.jpeg"
                    width="550px"
                    alt="SafeSpace Promo"
                    fluid
                />
            </div>

            {/* Main Content Section */}
            <Container className="p-5 my-5 rounded">
                <Row className="align-items-center">

                    {/* Left Column: Text + Buttons */}
                    <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                        <h1>SafeSpace is your money's comfort zone.</h1>
                        <p>Plan smarter, learn faster, and take control with total peace of mind.</p>

                        <div className="d-flex justify-content-center gap-2 mt-3">
                            {user ? (
                                // If user is signed in
                                <>
                                    <DashboardButton />
                                    <SignOutButton />
                                </>
                            ) : (
                                // If user is not signed in
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/about-us#our-features')}
                                    >
                                        Explore Our Features
                                    </Button>
                                    <GetStartedButton />
                                </>
                            )}
                        </div>
                    </Col>

                    {/* Right Column: Home Page Image */}
                    <Col
                        xs={12}
                        md={6}
                        order={{ xs: 1, md: 2 }}
                        className="text-center mb-4 mb-md-0"
                    >
                        <Image
                            src="/home-page-image.jpg"
                            alt="People with peace of mind"
                            width="100%"
                            fluid
                        />
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default HomePage;