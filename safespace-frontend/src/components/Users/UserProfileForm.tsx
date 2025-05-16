// UserProfileForm.tsx
import { useState, useEffect, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Row, Col, Image, Button, Alert } from "react-bootstrap";
import SuccessModal from "../Navigation/SuccessModal";
import { useAuth } from '../../context/AuthContext';
import api from "../../api";
import NoAccess from "../LandingPages/NoAccess";
import React from "react";
import { deleteUser } from "firebase/auth";
import LoadingPage from "../LandingPages/LoadingPage";
import { useUser } from "../../context/UserContext";

const UserProfileForm: React.FC = () => {
    const { user, loading: authLoading, error } = useAuth();
    const {userProfile, isLoading: profileLoading, refreshUserProfile} = useUser();
    const [firstName, setFirstName] = useState(userProfile?.firstName || "");
    const [lastName, setLastName] = useState(userProfile?.lastName || "");
    const [phone, setPhone] = useState(userProfile?.phoneNumber || "");
    const [formError, setError] = useState<string | null>(null);
    const [showSuccessUpdateModal, setShowSuccessUpdateModal] = useState<boolean>(false);
    const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState<boolean>(false);
    const [newUser, setNewUser] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (userProfile) {
            setFirstName(userProfile.firstName);
            setLastName(userProfile.lastName);
            setPhone(userProfile.phoneNumber);
            setNewUser(false);
        } else {
            setNewUser(true);
        }
    }, [userProfile]);

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (user) {
            try {
                // Call API to delete the user account
                const response = await api.delete(`/users/me`, 
                );

                if (response.status === 200) {
                    // Successfully deleted the account
                    await deleteUser(user);
                    setShowSuccessDeleteModal(true);
                } else {
                    setError("An error occurred while deleting your account. Please try again later.");
                }
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
            const userData = {
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
            };

            let response;
            if (newUser) {
                response = await api.post('/users/me', userData, {
                });
                setNewUser(false);
            } else {
                response = await api.put('/users/me', userData, {
                });
            }

            if (response.status < 200 || response.status >= 300) {
                throw new Error("Failed to save user info.");
            }

            await refreshUserProfile(); 
            setShowSuccessUpdateModal(true);
        } catch (error) {
            const err = error as Error;
            console.error("Error submitting form:", err.message);
            setError(err.message);
        }
    };

    if(authLoading || profileLoading)return(<LoadingPage/>);
    if(!user && !authLoading && !profileLoading)return(<NoAccess/>);

    return (
        <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                <h1>Your personal info's safe with us.</h1>
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
                {error && <Alert className='mt-3' variant='danger'>{error}</Alert>}
                {formError && <Alert className='mt-3' variant='danger'>{formError}</Alert>}

                </Form>
                <SuccessModal 
                    show={showSuccessUpdateModal}
                    onClose={() => {
                        setShowSuccessUpdateModal(false);
                        navigate('/user-dashboard');
                    }}
                    title="Success!"
                    message="Your user profile has been successfully updated."
                    buttonText="Go to Your Dashboard"
                />
                <SuccessModal 
                    show={showSuccessDeleteModal}
                    onClose={() => {
                        setShowSuccessDeleteModal(false);
                        navigate('/');
                    }}
                    title="Sorry to see you go."
                    message="Your account has been successfully deleted."
                    buttonText="Home"
                />
                </Col>
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/user-profile-img.jpg" alt="" width="100%" fluid />
                </Col>
            </Row>
        </Container>
    );
};

export default UserProfileForm;