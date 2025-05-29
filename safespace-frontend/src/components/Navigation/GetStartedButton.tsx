// GetStartedButton.tsx
// This button navigates the user to the Sign Up page. 

import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function GetStartedButton(){
    // Navigation
    const navigate = useNavigate();

    return(
        <Button variant='secondary' onClick={()=>navigate('/accounts/signup')}>Get Started</Button>
    )
}

export default GetStartedButton; 