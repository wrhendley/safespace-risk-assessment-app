import React from "react";
import { Container, Image } from "react-bootstrap";
import ContactUs from "./ContactUs";
import Team from "./Team";
import OurMission from "./OurMission";

function AboutUs(){

    return (
        <div className='aboutus-scroll-container'>
        <div className="snap-section">
                <OurMission />
            </div>

            <div className="snap-section">
                <Team />
            </div>

            <div className="snap-section">
                <ContactUs />
            </div>
        </div>
    );
};

export default AboutUs;