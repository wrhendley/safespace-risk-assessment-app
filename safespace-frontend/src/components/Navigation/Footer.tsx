import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faLinkedin, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return (
        <footer className="py-3">
            <Container>
                <Row className="align-items-center text-center text-md-start">
                    <Col xs={12} md={6} className="mb-2 mb-md-0">
                        <em>&copy; 2025 SafeSpace. All rights reserved.</em>
                    </Col>
                    <Col xs={12} md={6} className="d-flex justify-content-center justify-content-md-end align-items-center gap-3">
                    <span className="mb-0">FOLLOW US:</span>
                    <a className="icon-link" href="/"><FontAwesomeIcon icon={faFacebook} size="2x" /></a>
                        <a className="icon-link" href="/"><FontAwesomeIcon icon={faLinkedin} size="2x" /></a>
                        <a className="icon-link" href="/"><FontAwesomeIcon icon={faXTwitter} size="2x" /></a>
                        <a className="icon-link" href="https://github.com/SafeSpace-Financial/safespace-risk-assessment-app"><FontAwesomeIcon icon={faGithub} size="2x" /></a>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;
