import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function GetStartedButton(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/accounts/signup');
    }
    return(
        <Button variant='secondary' onClick={()=>handleClick()}>Get Started</Button>
    )
}

export default GetStartedButton; 