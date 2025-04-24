// BottomNav.tsx
import { Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGauge, faBuildingColumns, faChartLine, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function BottomNav() {
    const navigate = useNavigate();

    return (
        <Navbar fixed="bottom" className="d-md-none justify-content-around py-2v bg-primary-dark" >
            <Nav className='d-flex flex-row justify-content-between w-100 text-center'>
                <Nav.Link onClick={() => navigate('/userdashboard')} style={{fontSize:"1rem"}}>
                    <FontAwesomeIcon icon={faGauge} size="lg" /><br/>Dash
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/banking')}>
                    <FontAwesomeIcon icon={faBuildingColumns} size="lg" /><br/>Bank
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/risk-dashboard')}>
                    <FontAwesomeIcon icon={faChartLine} size="lg" /><br/>Risk
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/more')}>
                    <FontAwesomeIcon icon={faGripVertical} size="lg" /><br/>More
                </Nav.Link>
            </Nav>
        </Navbar>
    );
}