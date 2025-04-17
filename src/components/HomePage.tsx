import { Container, Button, Row, Col, Image } from "react-bootstrap";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from '../firebaseConfig';
import { User } from "firebase/auth";

function HomePage(){
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(()=>{
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);

    return (
        <Container className="p-5 my-5 rounded">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>SafeSpace is your money's comfort zone.</h1>
                    <p>Plan smarter, learn faster, and take control with total peace of mind.</p>
                    <div className='text-center'>
                    {user?(
                        <Button variant="primary">Go to Dashboard</Button>
                    ):(
                        <>
                        <Button variant="primary">Continue as Guest</Button>
                        <Button variant="secondary" onClick={() => navigate('/register')}>Get Started</Button></>
                    )}
                    </div>
                    
                </Col>

                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/home-page-image.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
    );
};

export default HomePage;