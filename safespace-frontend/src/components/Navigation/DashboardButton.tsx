// DashboardButton.tsx
// This button navigates the user to the User Dashboard.

import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function DashboardButton(){
    // Navigation
    const navigate = useNavigate();

    return(
        <Button variant='primary' onClick={()=>navigate('/user-dashboard')}>Go to Dashboard</Button>
    )
}

export default DashboardButton; 