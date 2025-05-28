import React, {useEffect, useState} from 'react';
import { Nav } from 'react-bootstrap';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const { user } = useAuth();
    const [userName, setUserName] = useState<string>(user?.email?.split('@')[0] || 'User');


    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const idToken = await user?.getIdToken(true);
                const response = await api.get(`/users/`, {headers: {Authorization: `Bearer ${idToken}`}});
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
            <h3 className="text-center my-3">{userName}’s Admin Dashboard</h3>
            <Nav className="flex-column gap-2">
                <Nav.Link href="/admin/dashboard" className='side-bar-link'>&#62; Admin Dashboard</Nav.Link>
                <Nav.Link href="/admin/dashboard/users" className='side-bar-link'>&#62; Manage Users</Nav.Link>
                <Nav.Link href="/admin/dashboard/simulations" className='side-bar-link'>&#62; Manage Investment Simulations</Nav.Link>
                <Nav.Link href="/admin/dashboard/loans" className='side-bar-link'>&#62; Manage Loan Simulations</Nav.Link>
            </Nav>
        </div>
    );
}
