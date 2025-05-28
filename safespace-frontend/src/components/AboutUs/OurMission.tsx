import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function OurMission(){
    return (
        <>
        <Container className="p-5 my-5 rounded mb-3" id="our-mission">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Our Mission</h1>
                    <p>At SafeSpace, our mission is to empower individuals to take control of their 
                        financial futures by providing a secure, intuitive platform for managing personal finances, 
                        exploring investment opportunities, and building financial literacy. 
                        We believe everyone deserves access to trustworthy tools and personalized insights 
                        that foster confidence, independence, and long-term well-being.</p>

                </Col>
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/our-mission-img.jpg" alt="" width="100%" fluid />
                </Col>
            </Row>
            <div className="text-center mt-5">
                <a href="#team">
                    <FontAwesomeIcon icon={faChevronCircleDown} size="3x" className="scroll-down-arrow" />
                </a>
            </div>
        </Container>
    </>
    );
};

export default OurMission;