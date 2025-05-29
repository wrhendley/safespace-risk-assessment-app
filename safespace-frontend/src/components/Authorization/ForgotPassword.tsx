// ForgotPassword.tsx
// This page allows users to request a password reset email via Firebase Authentication.

import React, { FormEvent, useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import SuccessModal from '../Navigation/SuccessModal';
import { Container, Row, Col, Form, Button, Image, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    // Form and state management
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    // React Router navigation hook
    const navigate = useNavigate();

    // Handles password reset email submission
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Basic form validation
        if (!email) {
            setError('Email is required.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        try {
            // Send reset email using Firebase
            await sendPasswordResetEmail(auth, email);
            setEmail('');
            setShowSuccessModal(true);
        } catch (err) {
            setError('Failed to send reset email. Please try again later.');
        }
    };

    return (
        <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row className="align-items-center">
                {/* Form column */}
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Forgotten password? Let's reset it.</h1>
                    <Form onSubmit={handleSubmit}>
                        {/* Email input */}
                        <Form.Group className="mb-3" controlId="resetEmail">
                            <Form.Label>Email address</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>

                        {/* Action buttons */}
                        <div className="text-center">
                            <Button variant="primary" type="submit">Submit</Button>{' '}
                            <Button variant="secondary" onClick={() => navigate('/')}>Cancel</Button>
                        </div>

                        {/* Error message */}
                        {error && (
                            <Alert variant="danger" className="mt-3">
                                {error}
                            </Alert>
                        )}
                    </Form>
                </Col>

                {/* Illustration column */}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/forgot-password-img.jpg" alt="Forgot password illustration" width="100%" fluid />
                </Col>
            </Row>
            
            {/* Success modal shown after reset email is sent */}
            <SuccessModal 
                show={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate('/accounts/login');
                }}
                title="Password Reset Email Sent!"
                message="Please check your inbox—and your junk folder just in case."
                buttonText="Close"
            />
        </Container>
    );
};

export default ForgotPassword;
