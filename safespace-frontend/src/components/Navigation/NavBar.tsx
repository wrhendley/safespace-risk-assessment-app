// NavBar.tsx
// This component displays the navigation bar at the top of the application. 
// It includes links to About Us sections and authentication-based navigation (Dashboard, Profile, etc.).

import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import SignOutButton from './SignOutButton';

function NavBar() {
    // Access current authenticated user
    const { user } = useAuth();

    return (
        <Navbar collapseOnSelect expand="lg">
            <Container>
                {/* App Logo and Brand */}
                <Navbar.Brand href="/">
                    <img src='/safespace-logo-80x80.jpeg' width='60px' alt="SafeSpace Logo" />{' '}
                    <b>SAFESPACE</b>
                </Navbar.Brand>

                {/* Toggle button for mobile view */}
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />

                {/* Navigation Links */}
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="ms-auto">
                        {/* About Us dropdown menu */}
                        <NavDropdown title="ABOUT US" id="aboutus-dropdown">
                            <NavDropdown.Item href="/about-us#our-mission">Our Mission</NavDropdown.Item>
                            <NavDropdown.Item href="/about-us#our-features">Our Features</NavDropdown.Item>
                            <NavDropdown.Item href="/about-us#team">Team</NavDropdown.Item>
                            <NavDropdown.Item href="/about-us#contact-us">Contact</NavDropdown.Item>
                        </NavDropdown>

                        {/* Authenticated User Links */}
                        {user ? (
                            <>
                                <Nav.Link href="/user-dashboard">DASHBOARD</Nav.Link>
                                <Nav.Link href="/user-profile">USER PROFILE</Nav.Link>
                                <SignOutButton />
                                {/* You can also use: <Nav.Link onClick={() => logOut()}>SIGN OUT</Nav.Link> */}
                            </>
                        ) : (
                            // Guest User Links
                            <>
                                <Nav.Link href="/accounts/login">LOG IN</Nav.Link>
                                <Nav.Link id="nav-get-started" href="/accounts/signup">GET STARTED</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

export default NavBar;
