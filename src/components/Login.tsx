// Login.tsx
import { useState, useEffect, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { Container, Row, Col, Button, Form, Image,  } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuccessModal from "./SuccessModal";
import { onAuthStateChanged, User } from "firebase/auth";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const [user, setUser] = useState<User|null>(null);

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowSuccessModal(true);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Container className="p-5 my-5 rounded">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <h1>Welcome back.</h1>
                <Form onSubmit={handleLogin}>
                    <Form.Group className="mb-3" controlId="loginEmail">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Enter email"                     
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="loginPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Enter password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}/>
                    </Form.Group>

                    <div className='text-center'>
                        <Button variant='primary' type='submit'>Log In</Button>
                        <Button variant='secondary' onClick={()=>navigate('/')}>Cancel</Button>
                    </div>
                {error && <p>{error}</p>}
                </Form>
                    <SuccessModal 
                    show={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        navigate('/');
                    }}
                    title="Login Successful!"
                    message= {`Hey, ${user?.email}, let's get to work.`}
                    buttonText="Go to Dashboard"
                    />
                </Col>

                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/log-in-img.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
    );
};

export default Login;