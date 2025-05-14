import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SignOutButton from '../Navigation/SignOutButton';
import DashboardButton from '../Navigation/DashboardButton';
import HomeButton from '../Navigation/HomeButton';
import GetStartedButton from '../Navigation/GetStartedButton';

function NotFound(){
    const navigate = useNavigate();
    const {user, logOut} = useAuth(); 

    return(

        <>
        {/* SafeSpace Promo Banner*/ }
        <div className="text-center" style={{ backgroundColor: "black" }}>
            <Image src="/safespace-business-card-750x300.jpeg" width='550px' alt="SafeSpace Promo" fluid/>
        </div>
        
        <Container className="p-5 my-5 rounded">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1 className='text-danger'>404: Page Not Found</h1>
                    <p>Oops! The page you're looking for doesn't exist or has been moved.
                    </p>
                    <div className='text-center'>
                        {/* If user is signed in, option to go to dashboard, 
                        otherwise, continue as guest or sign in*/}
                    {user?(
                        <>
                        <DashboardButton/>
                        <SignOutButton/></>
                    ):(
                        <>
                        <HomeButton/>
                        <GetStartedButton/></>
                    )}
                    </div>
                    
                </Col>
                
                {/*Home Page Image is on the right on Desktop and underneath on Mobile*/}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/not-found-img.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
        </>
    )
}

export default NotFound;