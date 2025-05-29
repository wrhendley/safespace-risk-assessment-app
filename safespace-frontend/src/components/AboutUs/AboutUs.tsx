// AboutUs.tsx
// This page renders all the different snap sections, including OurMission, Team, OurFeatures, and ContactUs.

import React from "react";
import ContactUs from "./ContactUs";
import Team from "./Team";
import OurMission from "./OurMission";
import OurFeatures from "./OurFeatures";

function AboutUs(){
    console.log()
    return (
        <div className='aboutus-scroll-container'>
            <div className="snap-section">
                <OurMission />
            </div>

            <div className="snap-section">
                <Team />
            </div>

            <div className="snap-section">
                <OurFeatures />
            </div>

            <div className="snap-section">
                <ContactUs />
            </div>
        </div>
    );
};

export default AboutUs;