// Login.tsx
// This page handles user login via Firebase and verifies that the email has been confirmed before granting access.

import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { Container, Row, Col, Button, Form, Image, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Navigation/SuccessModal";
import AlreadySignedIn from "./AlreadySignedIn";
import LoadingPage from "../LandingPages/LoadingPage";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebaseConfig";

const Login = () => {
    // Form state
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    // Error and loading states
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    // Auth context
    const { signIn, loading, user, error, logOut } = useAuth();

    // Navigation
    const navigate = useNavigate();

    // Tracks if user just logged in successfully
    const justLoggedIn = useRef(false);

    // Reset the login flag after modal is closed
    useEffect(() => {
        if (!showSuccessModal && justLoggedIn.current) {
            justLoggedIn.current = false;
        }
    }, [showSuccessModal]);

    // Handles the login process
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setErrorPage('');

            // Sign in with Firebase
            await signIn(email, password);
            justLoggedIn.current = true;

            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not available after login.");

            // Only allow users with verified emails
            if (currentUser.emailVerified) {
                setShowSuccessModal(true);
            } else {
                logOut();
                setErrorPage("Please verify your email before signing in. Remember to check your spam folder.");
            }
        } catch (err: any) {
            setErrorPage(`Login failed: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Show loading page while auth is processing
    if (loading || isLoading) return <LoadingPage />;

    // Prevent already signed-in users from accessing login page
    if (user && !justLoggedIn.current && !loading && !isLoading) {
        return <AlreadySignedIn />;
    }

    return (
        <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row className="align-items-center">
                {/* Login form column */}
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Welcome back.</h1>
                    <Form onSubmit={handleLogin}>
                        {/* Email input */}
                        <Form.Group className="mb-3" controlId="loginEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        {/* Password input */}
                        <Form.Group className="mb-3" controlId="loginPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        {/* Action buttons and links */}
                        <div className="text-center mb-3">
                            <Button variant="primary" type="submit">Log In</Button>{' '}
                            <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                            <br />
                            <a className="small" href="/forgot-password">Forgot password?</a>
                        </div>

                        {/* Error messages */}
                        {(error || errorPage) && (
                            <Alert variant="danger">
                                {error || errorPage}
                            </Alert>
                        )}
                    </Form>
                </Col>

                {/* Illustration column */}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/log-in-img.jpg" alt="Login visual" width="100%" fluid />
                </Col>
            </Row>

            {/* Success modal shown after verified login */}
            <SuccessModal
                show={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate("/user-profile");
                }}
                title="Login Successful!"
                message={`Hey, ${user?.email}, let's get to work.`}
                buttonText="View User Profile"
            />
        </Container>
    );
};

export default Login;