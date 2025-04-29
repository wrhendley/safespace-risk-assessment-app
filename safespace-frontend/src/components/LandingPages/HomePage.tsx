import React from "react";
import { Container, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SignOutButton from "../Authorization/SignOutButton";
import { useEffect } from "react";
import api from "../../api";
import axios from "axios";

function HomePage(){
    const navigate = useNavigate();
    const { user } = useAuth();

    return (
        <>
        {/* SafeSpace Promo Banner*/ }
        <div className="text-center" style={{ backgroundColor: "black" }}>
            <Image src="/safespace-business-card-750x300.jpeg" width='550px' alt="SafeSpace Promo" fluid/>
        </div>
        
        <Container className="p-5 my-5 rounded">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>SafeSpace is your money's comfort zone.</h1>
                    <p>Plan smarter, learn faster, and take control with total peace of mind.</p>
                    <div className='d-flex justify-content-center gap-2'>
                        {/* If user is signed in, option to go to dashboard, 
                        otherwise, continue as guest or sign in*/}
                    {user?(
                        <><Button variant="primary" onClick={()=>navigate('/userdashboard')}>Go to Dashboard</Button>
                        <SignOutButton/></>
                    ):(
                        <>
                        <Button variant="primary">Continue as Guest</Button>
                        <Button variant="secondary" onClick={() => navigate('/accounts/signup')}>Get Started</Button></>
                    )}
                    </div>
                    
                </Col>
                
                {/*Home Page Image is on the right on Desktop and underneath on Mobile*/}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/home-page-image.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
        </>
    );
};

export default HomePage;