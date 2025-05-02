import React from 'react';
import { Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useEffect } from 'react';
import { useState } from 'react';
import api from '../../api';

export default function Sidebar() {
    const { user } = useAuth();
    const [userName, setUserName] = useState<string>(user?.email?.split('@')[0] || 'User');


    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const idToken = await user?.getIdToken(true);
                console.log(idToken);
                const response = await api.get(`/users/`, {headers: {Authorization: `Bearer ${idToken}`}});
                console.log(response.data);
                setUserName(response.data.first_name);
            } catch (err) {
                setUserName(user?.email?.split('@')[0] || 'User');
            }
        };

        if (user) {
            fetchUserName();
        }
    }, [user]);

    return (
        <div className="d-flex flex-column vh-100 p-3 side-bar" >
            <h3 className="text-center my-3">{userName}’s Dashboard</h3>
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
