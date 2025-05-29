// HomeButton.tsx
// This button navigates the user to the home page. 

import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function HomeButton(){
    // Navigation
    const navigate = useNavigate();

    return(
        <Button variant='primary' onClick={()=>navigate('/')}>Go Home</Button>
    )
}

export default HomeButton; 