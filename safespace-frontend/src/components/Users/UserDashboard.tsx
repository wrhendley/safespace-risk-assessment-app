import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../Other/Sidebar';
import NoAccess from '../Other/NoAccess';
import BottomNav from '../Other/BottomNav';
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
    const { user } = useAuth(); 
    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

    if(user){
    return (
        <Container className="my-5 rounded">
            <Row>
                {/* Sidebar for desktop */}
                <Col xs={12} md={3} className="d-none d-md-block p-0">
                    <Sidebar />
                </Col>
                {/* Main content area */}
                <Col xs={12} md={9} className="p-4">
                <h2 className="mb-4">Welcome back, {userName}!</h2>
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
}else{
    return(
        <NoAccess/>
    )
}
}
