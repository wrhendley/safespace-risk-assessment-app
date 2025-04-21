import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from './Sidebar';
import UserDashboard from '../Users/UserDashboard'; // or another main content component

export default function DashboardLayout() {
    return (
        <Container fluid>
        <Row>
            <Col xs={12} md={3}>
            <Sidebar />
            </Col>
            <Col xs={12} md={9} className="p-4">
            <UserDashboard />
            </Col>
        </Row>
        </Container>
    );
}