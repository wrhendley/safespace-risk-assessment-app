// Footer.tsx
// This component renders the footer section of the app,
// displaying copyright information and social media links with icons.

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faLinkedin, faGithub, faXTwitter } from '@fortawesome/free-brands-svg-icons';

function Footer() {
    return (
        <footer className="py-3">
            <Container>
                <Row className="align-items-center text-center text-md-start">
                    {/* Copyright text */}
                    <Col xs={12} md={6} className="mb-2 mb-md-0">
                        <em>&copy; 2025 SafeSpace. All rights reserved.</em>
                    </Col>

                    {/* Social media links with icons */}
                    <Col
                        xs={12}
                        md={6}
                        className="d-flex justify-content-center justify-content-md-end align-items-center gap-3"
                    >
                        <span className="mb-0">FOLLOW US:</span>
                        <a className="icon-link" href="/" aria-label="Facebook">
                            <FontAwesomeIcon icon={faFacebook} size="2x" />
                        </a>
                        <a className="icon-link" href="/" aria-label="LinkedIn">
                            <FontAwesomeIcon icon={faLinkedin} size="2x" />
                        </a>
                        <a className="icon-link" href="/" aria-label="X Twitter">
                            <FontAwesomeIcon icon={faXTwitter} size="2x" />
                        </a>
                        <a
                            className="icon-link"
                            href="https://github.com/SafeSpace-Financial/safespace-risk-assessment-app"
                            aria-label="GitHub"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FontAwesomeIcon icon={faGithub} size="2x" />
                        </a>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;