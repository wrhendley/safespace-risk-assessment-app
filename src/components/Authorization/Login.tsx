// Login.tsx
import { useState, FormEvent } from "react";
import { Container, Row, Col, Button, Form, Image, Alert  } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SuccessModal from "../Other/SuccessModal";
import { useAuth } from "../../context/AuthContext";
import NoAccess from "../Other/NoAccess";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [errorPage, setErrorPage] = useState<string | null>(null);
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const { signIn, user, error } = useAuth();

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await signIn(email, password);
            setShowSuccessModal(true);
        } catch (err: any) {
            setErrorPage(`Login failed: ${err.message}`);
        }
    };

    if(user){
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
                        {(error || errorPage) && (
                            <Alert variant="danger">
                                {error || errorPage}
                            </Alert>
                        )}                </Form>
                        <SuccessModal 
                        show={showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            navigate('/userdashboard');
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
    }else{
        <NoAccess/>
    }
};

export default Login;