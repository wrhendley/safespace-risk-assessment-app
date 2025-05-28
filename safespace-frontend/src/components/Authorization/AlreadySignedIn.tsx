import { Container, Row, Col, Button, Image } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardButton from '../Navigation/DashboardButton';
import SignOutButton from '../Navigation/SignOutButton';

function AlreadySignedIn(){
    const { logOut} = useAuth();
    const navigate = useNavigate();

    return(
    <>
        {/* SafeSpace Promo Banner*/ }
        <div className="text-center" style={{ backgroundColor: "black" }}>
            <Image src="/safespace-business-card-750x300.jpeg" height="200px" alt="SafeSpace Promo" fluid/>
        </div>
        
        <Container className="p-5 my-5 rounded">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1 className='text-danger'>Already Signed In</h1>
                    <p>Sorry, looks like you're already signed in. If you'd like to switch users, sign out and try again. </p>
                    <div className='text-center'>
                        <><DashboardButton/><SignOutButton/></>
                    </div>
                    
                </Col>
                
                {/*Image is on the right on Desktop and underneath on Mobile*/}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/already-signed-in-img.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
        </>

    )
}

export default AlreadySignedIn;