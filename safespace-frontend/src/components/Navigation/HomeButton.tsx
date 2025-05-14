import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function HomeButton(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/');
    }
    return(
        <Button variant='primary' onClick={()=>handleClick()}>Go Home</Button>
    )
}

export default HomeButton; 