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

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const [justLoggedIn, setJustLoggedIn] = useState<boolean>(false);
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const { signIn, loading, user, error, logOut } = useAuth();

<<<<<<< Updated upstream
=======
    // useEffect(()=>{
    //     if (user){
    //         api.get(`/accounts/${user.uid}`)
    //     }
    // }, [user]);

>>>>>>> Stashed changes
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            setErrorPage('');
            await signIn(email, password);
            setJustLoggedIn(true);
            // Get IdToken
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not available after registration.");
            const idToken = await currentUser.getIdToken(true);
            console.log(idToken);

            if(currentUser.emailVerified){
                setShowSuccessModal(true);
            }else{
                logOut();
                setJustLoggedIn(false);
                setErrorPage('Please verify your email before signing in. Remember to check your spam folder.')
            }
        } catch (err: any) {
            setErrorPage(`Login failed: ${err.message}`);
        }
    };

    if (loading) {
        return <LoadingPage />;
    }

    if (user && !justLoggedIn) {
    return <AlreadySignedIn />;
    }

    return (
            <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
                <Row className="align-items-center">
                    <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Welcome back.</h1>
                    {loading&&<>
                            <div className="text-center">
                                <div className="spinner" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                    </>}
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
                                navigate(`/users/${user?.uid}`);
                                setJustLoggedIn(false);
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