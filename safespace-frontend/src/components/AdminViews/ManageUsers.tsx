import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import api from '../../api';
import Sidebar from './Sidebar';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';

export default function ManageUsers() {
    const { user } = useAuth();
    const { userProfile } = useUser();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await api.get('/admin/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsers(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUsers();
    }, [user]);

    if (!user || userProfile?.role !== 'admin') return <NoAccess />;
    if (!users.length) return <LoadingPage />;

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <Container className="p-5 my-5">
                <h2>Manage Users</h2>
                <Form.Control
                    type="text"
                    placeholder="Search by email"
                    className="mb-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>First Name</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u: any) => (
                            <tr key={u.id}>
                                <td>{u.email}</td>
                                <td>{u.first_name}</td>
                                <td>{u.role}</td>
                                <td>
                                    <Button variant="danger" size="sm">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
}
