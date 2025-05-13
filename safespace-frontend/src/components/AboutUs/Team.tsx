import React from "react";
import { Row, Col, Image, Container } from "react-bootstrap";
import { faChevronCircleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Team() {
    return (
        <Container className="p-5 my-5 rounded" id="team">
            <Row className="mb-3">
                <Col>
                    <h1 className="text-center">Meet the Team</h1>
                    <p className="text-center">
                        Our team comes from diverse professional backgrounds, shaping the way we approach 
                        challenges and craft solutions with the end user in mind.
                    </p>
                </Col>
            </Row>

            <Row className="justify-content-center text-center">
                {[
                    { name: "Wesley Hendley", title: "Backend Developer", img: "/team/wes-hendley-headshot.jpeg" },
                    { name: "Kyle Jones", title: "Backend Developer", img: "/team/kyle-jones-headshot.jpeg" },
                    { name: "Elizabeth Yates", title: "Frontend Developer", img: "/team/elizabeth-yates-headshot.jpeg" },
                    { name: "James Wilson", title: "Data Analyst", img: "/team/james-wilson-headshot.jpg" },
                    { name: "Rafael Cervantes", title: "Cybersecurity Officer", img: "/team/rafa-cervantes-headshot.jpeg" },
                ].map((member, idx) => (
                    <Col key={idx} xs={12} sm={6} md={4} lg={3} className="mb-4">
                        <Image src={member.img} width="200" alt={`${member.name} Headshot`} rounded />
                        <h3 className="mt-3 text-center">{member.name}</h3>
                        <p className='text-center'>{member.title}</p>
                    </Col>
                ))}
            </Row>
            <div className="text-center">
                <a href="#our-features">
                    <FontAwesomeIcon icon={faChevronCircleDown} size="3x" className="scroll-down-arrow" />
                </a>
            </div>
        </Container>
    );
}

export default Team;