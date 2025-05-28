import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function OurFeatures() {
    return (
        <>
        <Container className="p-5 my-5 rounded mb-3" id="our-features">
            <Row className="align-items-center">
            <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <h1>Our Features</h1>
                <p>
                SafeSpace currently offers two powerful financial tools:
                </p>
                <ul>
                <li>
                    <strong className='text-primary'>Investment Portfolio Simulator:</strong> Enter your chosen stocks,
                    allocation percentages, and a custom time period to see how your
                    portfolio would have performed based on historical data. You'll also get
                    a breakdown of associated risk levels to better understand volatility.
                </li><br/>
                <li>
                    <strong className='text-primary'>Loan Simulator:</strong> Input key financial data and receive
                    an instant assessment of your loan eligibility. Our tool helps users
                    understand their financial standing before applying for credit.
                </li>
                </ul>
            </Col>
            <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                <Image src="/investment-simulator-img.png" alt="Simulator preview" width="100%" fluid />
            </Col>
            </Row>
            <div className="text-center mt-5">
            <a href="#contact">
                <FontAwesomeIcon icon={faChevronCircleDown} size="3x" className="scroll-down-arrow" />
            </a>
            </div>
        </Container>
        </>
    );
}

export default OurFeatures;
