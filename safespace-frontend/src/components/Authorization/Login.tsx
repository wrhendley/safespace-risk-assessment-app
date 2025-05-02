// Login.tsx
import { useState, FormEvent } from "react";
import { Container, Row, Col, Button, Form, Image, Alert  } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Navigation/SuccessModal";
import { useAuth } from "../../context/AuthContext";
import AlreadySignedIn from "./AlreadySignedIn";
import LoadingPage from "../LandingPages/LoadingPage";
import { auth } from "../../firebaseConfig";
import React from 'react';
import { useRef } from "react";
import { useEffect } from "react";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const { signIn, loading, user, error, logOut } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const justLoggedIn = useRef(false);

    useEffect(() => {
        if (!showSuccessModal && justLoggedIn.current) {
            justLoggedIn.current = false;
        }
    }, [showSuccessModal]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            setErrorPage('');
            await signIn(email, password);
            justLoggedIn.current = true;
            // Get IdToken
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not available after registration.");
            const idToken = await currentUser.getIdToken(true);
            console.log(idToken);

            if(currentUser.emailVerified){
                setShowSuccessModal(true);
            }else{
                logOut();
                setErrorPage('Please verify your email before signing in. Remember to check your spam folder.')
            }
        } catch (err: any) {
            setErrorPage(`Login failed: ${err.message}`);
        }finally{
            setIsLoading(false);
        }
    };

    if (loading || isLoading) return <LoadingPage />;
    if (user && !justLoggedIn.current && !loading && !isLoading) return <AlreadySignedIn />;

    return (
            <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
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

                        <div className='text-center mb-3'>
                            <Button variant='primary' type='submit'>Log In</Button>
                            <Button variant='secondary' onClick={()=>navigate('/')}>Cancel</Button>
                            <br/><a className='small' href='/forgot-password'>Forgot password?</a>
                        </div>
                        {(error || errorPage) && (
                            <Alert variant="danger">
                                {error || errorPage}
                            </Alert>
                        )}                </Form>
                        <SuccessModal 
                            show={showSuccessModal}
                            onClose={() => {
                                setShowSuccessModal(false);
                                navigate(`/user-profile`);
                            }}
                            title="Login Successful!"
                            message= {`Hey, ${user?.email}, let's get to work.`}
                            buttonText="View User Profile"
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