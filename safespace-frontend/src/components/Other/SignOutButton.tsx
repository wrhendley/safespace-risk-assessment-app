import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignOutButton(){
    const { logOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = () => {
        logOut();
        navigate('/');
    }
    return(
        <Button variant='secondary' onClick={()=>handleSignOut()}>Sign Out</Button>
    )
}

export default SignOutButton; 