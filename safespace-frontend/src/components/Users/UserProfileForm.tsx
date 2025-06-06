
// UserProfileForm.tsx
import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Row, Col, Image, Button, Alert } from "react-bootstrap";
import SuccessModal from "../Navigation/SuccessModal";
import { useAuth } from '../../context/AuthContext';
import api from "../../api";
import NoAccess from "../LandingPages/NoAccess";
import React from "react";
import { deleteUser } from "firebase/auth";

const UserProfileForm: React.FC = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const navigate = useNavigate();

// Fetch user data when component mounts or when ID changes
useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try{
                const response = await api.get(`/users/${id}`);
                const { first_name, last_name, phone_number } = response.data[0];
                setFirstName(first_name);
                setLastName(last_name);
                setPhone(phone_number);
            }catch(error){
                const err = error as Error;
                console.error("Error fetching user data:", err.message);
                setError(err.message);
            }finally{
                setIsLoading(false);
            }
        }
        if (id) {
            fetchData();
        }
            
    }, [id]);

        // Handle account deletion
        const handleDeleteAccount = async () => {
            if (id) {
                try {
                    // Call your API to delete the user account
                    // const response = await api.delete(`/users/${id}`);

                    // if (response.status === 200) {
                        // Successfully deleted the account
                        await deleteUser(user);
                        navigate("/"); // Redirect home
                    // } else {
                    //     setError("An error occurred while deleting your account. Please try again later.");
                    // }
                } catch (err) {
                    console.error("Error deleting account:", err);
                    setError("An error occurred while deleting your account. Please try again later.");
                }
            } else {
                setError("User ID not found.");
            }
        };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
    
        if (!firstName || !lastName || !phone) {
            setError("Please fill out all required fields.");
            return;
        }
    
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setError("Phone number must be 10 digits.");
            return;
        }
        
        try {
            // Put/Post the User Info
            // let response;
            // const userData = {
            //     firebase_uid: user?.uid,
            //     first_name: firstName,
            //     last_name: lastName,
            //     phone_number: phone,
            // };
            // if(id){
            //     response = await api.put(`/users/${id}`, userData,
            //         {headers:{'Content-Type': 'application/json'}}
            //     );
            // }else{
            //     response = await api.post(`/users/${id}`, userData, 
            //         {headers:{'Content-Type': 'application/json'}}
            //     );
            // }
            // if (response.status < 200 || response.status >= 300) {
            //     throw new Error("Failed to save user info.");
            // }
            setShowSuccessModal(true);           
        }catch(error){
            const err = error as Error;
            console.error("Error submitting form:", err.message);
            setError(err.message);
        }

    };
    if(user){
        return (
            <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
                <Row className="align-items-center">
                    <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <h1>Your personal info's safe with us.</h1>
                    {isLoading&&<>
                            <div className="text-center">
                                <div className="spinner" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                    </>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="userFirstName">
                            <Form.Label>First Name*</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your first name"                     
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="userLastName">
                            <Form.Label>Last Name*</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your last name"                     
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="userPhone">
                            <Form.Label>Phone Number*</Form.Label>
                            <Form.Control 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}/>
                        </Form.Group>                        
                        <div className='d-flex justify-content-center gap-3 mt-3'>
                            <Button variant='primary' type='submit'>Save</Button>
                            <Button variant='danger' onClick={handleDeleteAccount}>Delete Account</Button>
                        </div>
                    {error && 
                    <Alert className='mt-3' variant='danger'>{error}</Alert>
                    }
                    </Form>
                    <SuccessModal 
                    show={showSuccessModal}
                    onClose={() => {
                        setShowSuccessModal(false);
                        navigate('/userdashboard');
                    }}
                    title="Success!"
                    message="Your user profile has been successfully updated."
                    buttonText="Go to Your Dashboard"
                    />
                    </Col>
                    <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                        <Image src="/user-profile-img.jpg" alt="" width="100%" fluid />
                    </Col>
                </Row>
            </Container>
        );
    }else{
        if (isLoading) return null;
        return <NoAccess />;
    }
};

export default UserProfileForm;