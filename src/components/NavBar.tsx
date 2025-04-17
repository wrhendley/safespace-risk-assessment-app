import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from '../firebaseConfig';
import { User, signOut, onAuthStateChanged } from 'firebase/auth';

function NavBar(){
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, []);

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
                            <NavDropdown.Item href="/our-mission">Our Mission</NavDropdown.Item>
                            <NavDropdown.Item href="/team">Team</NavDropdown.Item>
                            <NavDropdown.Item href="/contact">Contact</NavDropdown.Item>
                        </NavDropdown>

                        {user ? (
                            <>
                                <Nav.Link href="/user-profile">USER PROFILE</Nav.Link>
                                <Nav.Link onClick={() => signOut(auth)}>SIGN OUT</Nav.Link>
                            </>
                        ) : (
                            <>
                                <Nav.Link href="/login">LOG IN</Nav.Link>
                                <Nav.Link id='nav-get-started' href='/register'>GET STARTED</Nav.Link>
                                {/* <Button variant="primary" className="m-0" onClick={() => navigate('/register')}>GET STARTED</Button> */}
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>

        <div className="text-center" style={{ backgroundColor: "black" }}>
            <img src="/safespace-business-card-750x300.jpeg" height="200px" alt="SafeSpace Promo" />
        </div>
        </>
    );
}

export default NavBar;
