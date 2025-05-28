import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function DashboardButton(){
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/user-dashboard');
    }
    return(
        <Button variant='primary' onClick={()=>handleClick()}>Go to Dashboard</Button>
    )
}

export default DashboardButton; 