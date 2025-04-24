import React from 'react';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const { user } = useAuth();

    return (
        <div className="d-flex flex-column vh-100 p-3 side-bar" >
            <h3 className="text-center my-3">{user?.displayName || user?.email?.split('@')[0]}’s Dashboard</h3>
            <Nav className="flex-column gap-2">
                <Nav.Link href="/userdashboard" className='side-bar-link'>&#62; Overview</Nav.Link>
                <Nav.Link href="/banking" className='side-bar-link'>&#62; Banking</Nav.Link>
                <Nav.Link href="/risk-dashboard" className='side-bar-link'>&#62; Risk Dashboard</Nav.Link>
                <Nav.Link href="/risk-forecast" className='side-bar-link'>&#62; Risk Forecast</Nav.Link>
                <Nav.Link href="/loan-calculator" className='side-bar-link'>&#62; Loan Calculator</Nav.Link>
            </Nav>
        </div>
    );
}
