import React, { useState, FormEvent } from "react";
import { Button, Row, Col, Image, Form, Alert, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Navigation/SuccessModal";
import { useForm, ValidationError } from '@formspree/react';


function ContactUs(){
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        if (!name || !email || !message) {
            setError("Please fill out all required fields.");
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
    
        try {
            const response = await fetch("https://formspree.io/f/myzwknzz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });
    
            if (!response.ok) throw new Error("Failed to send message");
    
            setShowSuccessModal(true);
            setName("");
            setEmail("");
            setMessage("");
            setError("");
        } catch (err) {
            setError("Oops! Something went wrong. Please try again later.");
        }
    };

    return (
        <Container className="p-5 my-5 rounded" id='contact-us'>
        <Row className="align-items-center">
                    <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Questions? Concerns? Ideas? Send us a message.</h1>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="userFirstName">
                            <Form.Label>Name*</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your name"                     
                                value={name}
                                onChange={(e) => setName(e.target.value)}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="userLastName">
                            <Form.Label>Email*</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Enter your email"                     
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="userPhone">
                            <Form.Label>Message*</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={5} 
                                placeholder="Enter your message" 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </Form.Group>                        
                        <div className='d-flex justify-content-center gap-3 mt-3'>
                            <Button variant='primary' type='submit'>Send</Button>
                        </div>
                    {error && 
                    <Alert className='mt-3' variant='danger'>{error}</Alert>
                    }
                    </Form>
                    <SuccessModal 
                    show={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        navigate('/');
                    }}
                    title="Success!"
                    message="Your message was sent. Someone will be in touch with you soon."
                    buttonText="Home"
                    />
                    </Col>
                    <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                        <Image src="/contact-us-img.jpg" alt="" width="100%" fluid />
                    </Col>
                </Row>
        </Container>
    );
};

export default ContactUs;