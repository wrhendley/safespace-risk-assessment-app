import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import NoAccess from '../LandingPages/NoAccess';
import BottomNav from './BottomNav';
import LoadingPage from '../LandingPages/LoadingPage';
import { useEffect } from 'react';
import api from '../../api';
import { useState } from 'react';

const financeData = [
    { label: "Account Balance", value: "$12,340.75" },
    { label: "Credit Score", value: "742" },
    { label: "Monthly Spending", value: "$2,150" },
];

const recentActivity = [
    { title: "Paid Credit Card", date: "April 15", amount: "-$250.00" },
    { title: "Paycheck Deposit", date: "April 14", amount: "+$2,000.00" },
    { title: "Coffee Shop", date: "April 13", amount: "-$4.75" },
];

export default function UserDashboard() {
    const { user, error, loading } = useAuth(); 
    const [userName, setUserName] = useState<string>(user?.email?.split('@')[0] || 'User');
    const [errorPage, setErrorPage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchUserName = async () => {
            setIsLoading(true);
            try {
                const idToken = await user?.getIdToken(true);
                console.log(idToken);
                const response = await api.get(`/users/`, {headers: {Authorization: `Bearer ${idToken}`}});
                console.log(response.data);
                setUserName(response.data.first_name);
            } catch (err) {
                setUserName(user?.email?.split('@')[0] || 'User');
                setErrorPage(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        if (user) {
            fetchUserName();
        }
    }, [user]);

    if (!user && !isLoading && !loading) {
        return <NoAccess />;
    }

    if (isLoading || loading) {
        return <LoadingPage />;
    }
    return (
        <Container className="my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row>
                {/* Sidebar for desktop */}
                <Col xs={12} md={3} className="d-none d-md-block p-0">
                    <Sidebar />
                </Col>
                {/* Main content area */}
                <Col xs={12} md={9} className="p-4">
                <h2 className="mb-4">Welcome back, {userName}!</h2>
                {error &&<Alert variant='danger'>{error}</Alert>}
                {errorPage &&<Alert variant='danger'>{errorPage}</Alert>}
                {/* Financial Overview */}
                <Row className="mb-4">
                    {financeData.map((item, idx) => (
                    <Col key={idx} md={4} className="mb-3">
                        <Card className="h-100 shadow-sm">
                        <Card.Body>
                            <Card.Title className="text-muted fs-6">{item.label}</Card.Title>
                            <Card.Text className="fs-4 fw-semibold">{item.value}</Card.Text>
                        </Card.Body>
                        </Card>
                    </Col>
                    ))}
                </Row>

                {/* Recent Activity */}
                <h4 className="mb-3">Recent Activity</h4>
                <Card className="shadow-sm">
                    <Card.Body className="p-0">
                    {recentActivity.map((activity, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
                        <div>
                            <strong>{activity.title}</strong>
                            <div className="text-muted small">{activity.date}</div>
                        </div>
                        <div
                            className={`fw-semibold ${
                            activity.amount.startsWith('-') ? 'text-danger' : 'text-success'
                            }`}
                        >
                            {activity.amount}
                        </div>
                        </div>
                    ))}
                    </Card.Body>
                </Card>
                </Col>
            </Row>
            
            <BottomNav/>
        </Container>
    );
}
