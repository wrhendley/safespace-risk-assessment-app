import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Row, Col, Image, Button, Alert } from "react-bootstrap";
import SuccessModal from "../Other/SuccessModal";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const SignUp = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [role, setRole] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const { user, signUp, error } = useAuth();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
    
        if (!email || !password || !confirmPassword || !role) {
            setErrorPage("Please fill out all required fields.");
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorPage("Please enter a valid email address.");
            return;
        }
    
        if (password !== confirmPassword) {
            setErrorPage("Passwords do not match.");
            return;
        }
    
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            setErrorPage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            return;
        }
    
        try {
            // First, register with Firebase
            await signUp(email, password);
    
            // Prepare payload for PostgreSQL
            const payload = {
                email: email,
                firebase_uid: user?.uid,
                email_verified: user?.emailVerified,
                role: role || "user", // default to "user"
                created_at: new Date(),
                is_active: true
            };
    
            // Make the Axios POST request
            const response = await axios.post("http://127.0.0.1:5000/accounts", payload);
    
            if (response.status !== 200) {
                throw new Error("Failed to create account.");
            }
    
            console.log("Account created:", response.data);
            setShowSuccessModal(true);
        } catch (err: any) {
            setErrorPage(err.message || "An error occurred during the registration process.");
        }
    };
    
    return (
        <Container className="p-5 my-5 rounded">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <h1>Let's get started.</h1>
                <p>Already have an account? <a href='/login'>Sign in</a>.</p>
                <Form onSubmit={handleRegister}>
                    <Form.Group className='mb-3' controlId='registerRole'>
                        <Form.Label>Role*</Form.Label>
                        <Form.Select 
                            aria-label="Select your role" 
                            value={role} 
                            onChange={(e) => setRole(e.target.value)} 
                            required
                        >
                            <option value=''>Select your role...</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="registerEmail">
                        <Form.Label>Email address*</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter email"                     
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="registerPassword">
                        <Form.Label>Password*</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Enter password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="registerConfirmPassword">
                        <Form.Label>Confirm password*</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Re-enter password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}/>
                    </Form.Group>

                    <div className='text-center'>
                        <Button variant='primary' type='submit'>Create Account</Button>
                        <Button variant='secondary' onClick={()=>navigate('/')}>Cancel</Button>
                    </div>
                {error || errorPage && 
                <Alert className='mt-3' variant='danger'>{error || errorPage}</Alert>
                }
                </Form>
                <SuccessModal 
                show={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate(`/userprofile/${user?.uid}`);
                }}
                title="Account Created"
                message="Your account has been created successfully."
                buttonText="Create User Profile"
                />

                </Col>

                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/sign-up-img.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
    );
};

export default SignUp;
