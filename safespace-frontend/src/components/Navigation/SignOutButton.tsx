// SignOutButton.tsx
// This component provides a button that logs the user out via the AuthContext
// and redirects them to the home page upon signing out.

import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function SignOutButton() {
    // Get the logOut function from AuthContext to sign the user out
    const { logOut } = useAuth();

    // React Router navigate function for page redirection
    const navigate = useNavigate();

    // Handler called when user clicks the Sign Out button
    const handleSignOut = () => {
        logOut();         // Log the user out
        navigate('/');    // Redirect to home page
    };

    return (
        <Button variant='secondary' onClick={handleSignOut}>
            Sign Out
        </Button>
    );
}

export default SignOutButton;