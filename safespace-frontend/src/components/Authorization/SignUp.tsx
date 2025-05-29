// SignUp.tsx
// Handles user registration via Firebase and backend API, enforces validations, and sends verification emails.

import React, { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Row, Col, Image, Button, Alert } from "react-bootstrap";
import SuccessModal from "../Navigation/SuccessModal";
import AlreadySignedIn from "./AlreadySignedIn";
import LoadingPage from "../LandingPages/LoadingPage";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../firebaseConfig";
import { sendEmailVerification } from "firebase/auth";
import api from '../../api';

const SignUp = () => {
    // Form fields
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [role, setRole] = useState<string>("");

    // UI states
    const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    const navigate = useNavigate();
    const { user, loading, signUp, error, logOut } = useAuth();

    // Form submission handler
    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorPage(null);

        // Basic validation
        if (!email || !password || !confirmPassword || !role) {
            setErrorPage("Please fill out all required fields.");
            setSubmitting(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorPage("Please enter a valid email address.");
            setSubmitting(false);
            return;
        }

        if (password !== confirmPassword) {
            setErrorPage("Passwords do not match.");
            setSubmitting(false);
            return;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            setErrorPage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            setSubmitting(false);
            return;
        }

        try {
            // 1. Register in Firebase
            await signUp(email, password);

            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not available after registration.");

            const idToken = await currentUser.getIdToken(true);

            // 2. Register user in backend
            const payload = {
                email: email,
                firebase_uid: currentUser.uid,
                role: role || "user",
            };

            const response = await api.post("/accounts/", payload, {
                headers: { Authorization: `Bearer ${idToken}` },
            });

            if (response.status < 200 || response.status >= 300) {
                throw new Error("Failed to create account in backend.");
            }

            // 3. Send verification email
            await sendEmailVerification(currentUser);

            setJustLoggedIn(true);
            setShowSuccessModal(true);
        } catch (err: any) {
            // Rollback: delete Firebase user if backend fails
            if (auth.currentUser) {
                await auth.currentUser.delete().catch(() => {
                    console.warn("Failed to delete Firebase user after backend error.");
                });
            }
            setErrorPage(err.message || "An error occurred during the registration process.");
        } finally {
            setSubmitting(false);
        }
    };

    // Show loading screen if in progress
    if (loading || submitting) return <LoadingPage />;

    // Redirect if already logged in
    if (user && !justLoggedIn && !errorPage && !submitting) return <AlreadySignedIn />;

    return (
        <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row className="align-items-center">
                {/* Form Column */}
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Let's get started.</h1>
                    <p>Already have an account? <a href="/login">Sign in</a>.</p>
                    <Form onSubmit={handleRegister}>
                        {/* Role dropdown */}
                        <Form.Group className="mb-3" controlId="registerRole">
                            <Form.Label>Role*</Form.Label>
                            <Form.Select
                                aria-label="Select your role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                required
                            >
                                <option value="">Select your role...</option>
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Email input */}
                        <Form.Group className="mb-3" controlId="registerEmail">
                            <Form.Label>Email address*</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        {/* Password input */}
                        <Form.Group className="mb-3" controlId="registerPassword">
                            <Form.Label>Password*</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </Form.Group>

                        {/* Confirm password input */}
                        <Form.Group className="mb-3" controlId="registerConfirmPassword">
                            <Form.Label>Confirm password*</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Repeat password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </Form.Group>

                        {/* Submit and Cancel */}
                        <div className="text-center">
                            <Button variant="primary" type="submit">Create Account</Button>{' '}
                            <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                        </div>

                        {/* Error messages */}
                        {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
                        {errorPage && <Alert className="mt-3" variant="danger">{errorPage}</Alert>}
                    </Form>

                </Col>

                {/* Image Column */}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/sign-up-img.jpg" alt="Sign up visual" width="100%" fluid />
                </Col>
            </Row>
            {/* Success Modal */}
            <SuccessModal
                show={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    logOut();
                    navigate("/accounts/login");
                    setJustLoggedIn(false);
                }}
                title="Account Created"
                message="Please verify your email before signing in again."
                buttonText="Ok"
            />
        </Container>
    );
};

export default SignUp;
