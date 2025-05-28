import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import api from '../../api';
import Sidebar from './Sidebar';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';

export default function ManageSimulations() {
    const { user } = useAuth();
    const { userProfile } = useUser();
    const [simulations, setSimulations] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchSimulations = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await api.get('/admin/simulations/investments', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSimulations(response.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSimulations();
    }, [user]);

    if (!user || userProfile?.role !== 'admin') return <NoAccess />;
    if (!simulations.length) return <LoadingPage />;

    const filtered = simulations.filter((sim: any) =>
        sim.user_email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="d-flex">
            <Sidebar />
            <Container className="p-5 my-5">
                <h2>Manage Investment Simulations</h2>
                <Form.Control
                    type="text"
                    placeholder="Search by user email"
                    className="mb-3"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Tickers</th>
                            <th>Date Range</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((sim: any) => (
                            <tr key={sim.id}>
                                <td>{sim.user_email}</td>
                                <td>{sim.tickers.join(', ')}</td>
                                <td>{sim.start_date} - {sim.end_date}</td>
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
