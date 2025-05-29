// ContactUs.tsx
// Contact form page for SafeSpace app allowing users to send messages.
// Includes client-side validation, submission via Formspree API, 
// and displays a success modal upon successful form submission.

import React, { useState, FormEvent } from "react";
import { Button, Row, Col, Image, Form, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Navigation/SuccessModal";

function ContactUs() {
    // Form state variables to hold user input
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    
    // State for error messages and success modal visibility
    const [error, setError] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

    const navigate = useNavigate();

    // Handles form submission and validation
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Basic required fields validation
        if (!name || !email || !message) {
        setError("Please fill out all required fields.");
        return;
        }

        // Simple email format validation using regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
        setError("Please enter a valid email address.");
        return;
        }

        try {
        // POST form data to Formspree API
        const response = await fetch("https://formspree.io/f/myzwknzz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, message }),
        });

        // Check for successful response
        if (!response.ok) throw new Error("Failed to send message");

        // On success: show modal, reset form, clear errors
        setShowSuccessModal(true);
        setName("");
        setEmail("");
        setMessage("");
        setError("");
        } catch (err) {
        // Handle network or server errors
        setError("Oops! Something went wrong. Please try again later.");
        }
    };

    return (
    <Container className="p-5 my-5 rounded" id="contact-us">
        <Row className="align-items-center">
            {/* Left column: Contact form */}
            <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <h1>Questions? Concerns? Ideas? Send us a message.</h1>

                <Form onSubmit={handleSubmit}>
                    {/* Name input */}
                    <Form.Group className="mb-3" controlId="userFirstName">
                    <Form.Label>Name*</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    </Form.Group>

                    {/* Email input */}
                    <Form.Group className="mb-3" controlId="userEmail">
                    <Form.Label>Email*</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </Form.Group>

                    {/* Message textarea */}
                    <Form.Group className="mb-3" controlId="userMessage">
                    <Form.Label>Message*</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={5}
                        placeholder="Enter your message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    </Form.Group>

                    {/* Submit button */}
                    <div className="d-flex justify-content-center gap-3 mt-3">
                    <Button variant="primary" type="submit">Send</Button>
                    </div>

                    {/* Display error alert if any */}
                    {error && <Alert className="mt-3" variant="danger">{error}</Alert>}
                </Form>
            </Col>

            {/* Right column: illustrative image */}
            <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
            <Image src="/contact-us-img.jpg" alt="Contact Us" width="100%" fluid />
            </Col>
        </Row>
        {/* Success modal shown after successful submission */}
        <SuccessModal
            show={showSuccessModal}
            onClose={() => {
            setShowSuccessModal(false);
            navigate('/'); // Redirect to home after closing modal
            }}
            title="Success!"
            message="Your message was sent. Someone will be in touch with you soon."
            buttonText="Home"
        />
    </Container>
    );
}

export default ContactUs;
