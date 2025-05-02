import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import SignOutButton from '../Authorization/SignOutButton';

function NavBar(){
    const {user, logOut} = useAuth();

    return (
        <>
        <Navbar collapseOnSelect expand="lg">
            <Container>
                <Navbar.Brand href="/">
                    <img src='/safespace-logo-80x80.jpeg' width='60px' alt="SafeSpace Logo" /> <b>SAFESPACE</b>
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto">
                        <NavDropdown title="FEATURES" id="features-dropdown">
                            <NavDropdown.Item href="/dashboard">Dashboard</NavDropdown.Item>
                            <NavDropdown.Item href="/banking">Banking</NavDropdown.Item>
                            <NavDropdown.Item href="/risk-dashboard">Risk Dashboard</NavDropdown.Item>
                            <NavDropdown.Item href="/risk-forecast">Risk Forecast</NavDropdown.Item>
                            <NavDropdown.Item href="/loan-calculator">Loan Calculator</NavDropdown.Item>
                        </NavDropdown>

                        <NavDropdown title="ABOUT US" id="aboutus-dropdown">
                            <NavDropdown.Item href="/about-us#our-mission">Our Mission</NavDropdown.Item>
                            <NavDropdown.Item href="/about-us#team">Team</NavDropdown.Item>
                            <NavDropdown.Item href="/about-us#contact-us">Contact</NavDropdown.Item>
                        </NavDropdown>

                        {user ? (
                            <>
                                <Nav.Link href={`/user-profile`}>USER PROFILE</Nav.Link>
                                <SignOutButton/>
                                {/* <Nav.Link onClick={() => logOut()}>SIGN OUT</Nav.Link> */}
                            </>
                        ) : (
                            <>
                                <Nav.Link href="/accounts/login">LOG IN</Nav.Link>
                                <Nav.Link id='nav-get-started' href='/accounts/signup'>GET STARTED</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>


        </>
    );
}

export default NavBar;
