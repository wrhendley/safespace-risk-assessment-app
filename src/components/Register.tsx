// Register.tsx
import { useState, FormEvent } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { Container, Form, Row, Col, Image, Button, Alert } from "react-bootstrap";
import SuccessModal from "./SuccessModal";

const Register = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [role, setRole] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();
    
        if (!email || !password || !confirmPassword || !username || !role) {
            setError("Please fill out all required fields.");
            return;
        }
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address.");
            return;
        }
    
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
    
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!strongPasswordRegex.test(password)) {
            setError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
            return;
        }
    
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // Add Firestore storage here
            setShowSuccessModal(true);
        } catch (err: any) {
            setError(err.message);
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
                    <Form.Group className="mb-3" controlId="registerUsername">
                        <Form.Label>Username*</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter username"                     
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="registerEmail">
                        <Form.Label>Email address*</Form.Label>
                        <Form.Control 
                            type="email" 
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
                {error && 
                <Alert className='mt-3' variant='danger'>{error}</Alert>
                }
                </Form>
                <SuccessModal 
                show={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    navigate('/userprofileform');
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

export default Register;