import React, { useEffect, useState } from 'react';
import { Container, Table, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import api from '../../api';
import Sidebar from './Sidebar';
import NoAccess from '../LandingPages/NoAccess';
import LoadingPage from '../LandingPages/LoadingPage';
import SuccessModal from '../Navigation/SuccessModal';

export default function ManageLoans() {
    const { user } = useAuth();
    const { userProfile } = useUser();
    const [simulations, setSimulations] = useState([]);
    const [search, setSearch] = useState<string>('');
    const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchSimulations = async () => {
            try {
                const token = await user?.getIdToken();
                const response = await api.get('/admin/simulations/loans', {
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

    // Handle loan simulation deletion
    const handleDelete = async () => {
        if (user) {
            try {
                // Call API 
                const response = await api.delete(`/admin/simulations/loans/` );

                if (response.status === 200) {
                    // Successfully deleted the loan simulation
                    setShowSuccessDeleteModal(true);
                }
            } catch (err) {
                console.error("Error deleting account:", err);
                setError("An error occurred while deleting your account. Please try again later.");
            }
        } else {
            setError("User ID not found.");
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />
            <Container className="p-5 my-5">
                <h2>Manage Investment Simulations</h2>
                {error && <Alert className='mt-3' variant='danger'>{error}</Alert>}
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
                            <th>Loan Amount</th>
                            <th>Income</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((sim: any) => (
                            <tr key={sim.id}>
                                <td>{sim.user_email}</td>
                                <td>{sim.loan_amount}</td>
                                <td>{sim.income}</td>
                                <td>
                                    <Button variant="danger" onClick={()=>handleDelete()} size="sm">Delete</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
            <SuccessModal 
                    show={showSuccessDeleteModal}
                    onClose={() => {
                        setShowSuccessDeleteModal(false);
                    }}
                    title="Success!"
                    message="The loan assessment has been successfully deleted."
                    buttonText="Back"
            />
        </div>
    );
}