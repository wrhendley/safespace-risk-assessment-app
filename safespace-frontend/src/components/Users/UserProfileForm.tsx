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
    const { userProfile, isLoading: profileLoading, refreshUserProfile } = useUser();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [showSuccessUpdateModal, setShowSuccessUpdateModal] = useState<boolean>(false);
    const [showSuccessDeleteModal, setShowSuccessDeleteModal] = useState<boolean>(false);
    const [newUser, setNewUser] = useState<boolean>(true);
    const navigate = useNavigate();

    // Pre-fill form if user profile exists and loading is complete
    useEffect(() => {
        if (!authLoading && !profileLoading) {
            if (userProfile) {
                setFirstName(userProfile.firstName);
                setLastName(userProfile.lastName);
                setPhone(userProfile.phoneNumber);
                setNewUser(false);
            } else {
                setNewUser(true);
            }
        }
    }, [authLoading, profileLoading, userProfile]);

    // Handle account deletion with confirmation
    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        if (user) {
            try {
                const response = await api.delete(`/users/me`);

                if (response.status === 200) {
                    await deleteUser(user); // Remove from Firebase
                    setShowSuccessDeleteModal(true);
                } else {
                    setFormError("An error occurred while deleting your account. Please try again later.");
                }
            } catch (err) {
                console.error("Error deleting account:", err);
                setFormError("An error occurred while deleting your account. Please try again later.");
            }
        } else {
            setFormError("User ID not found.");
        }
    };

    // Handle form submission to create/update user profile
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!firstName || !lastName || !phone) {
            setFormError("Please fill out all required fields.");
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setFormError("Phone number must be 10 digits.");
            return;
        }

        try {
            const userData = {
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
            };

            const response = newUser
                ? await api.post('/users', userData)
                : await api.put('/users/me', userData);

            if (response.status < 200 || response.status >= 300) {
                throw new Error("Failed to save user info.");
            }

            await refreshUserProfile();
            setShowSuccessUpdateModal(true);
        } catch (err) {
            const error = err as Error;
            console.error("Error submitting form:", error.message);
            setFormError(error.message);
        }
    };

    if (authLoading || profileLoading) return <LoadingPage />;
    if (!user && !authLoading && !profileLoading) return <NoAccess />;

    return (
        <Container className="p-5 my-5 rounded flex-grow-1 d-flex align-items-center">
            <Row className="align-items-center">
                <Col xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    {/* Form */}
                    <h1>Your personal info's safe with us.</h1>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="userFirstName">
                            <Form.Label>First Name*</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your first name"                     
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="userLastName">
                            <Form.Label>Last Name*</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Enter your last name"                     
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="userPhone">
                            <Form.Label>Phone Number*</Form.Label>
                            <Form.Control 
                                type="tel" 
                                placeholder="Enter your phone number" 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)} />
                        </Form.Group>                        
                        {/* Actionable buttons */}
                        <div className='d-flex justify-content-center gap-3 mt-3'>
                            <Button variant='primary' type='submit'>Save</Button>
                            <Button variant='danger' onClick={handleDeleteAccount}>Delete Account</Button>
                        </div>

                        {formError && <Alert className='mt-3' variant='danger'>{formError}</Alert>}
                        {error && <Alert className='mt-3' variant='danger'>{error}</Alert>}
                    </Form>
                </Col>

                {/* Imagery Column */}
                <Col xs={12} md={6} order={{ xs: 1, md: 2 }} className="text-center mb-4 mb-md-0">
                    <Image src="/user-profile-img.jpg" alt="User Profile" width="100%" fluid />
                </Col>
            </Row>

            {/* Update Success Modal */}
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

            {/* Delete Success Modal */}
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
        </Container>
    );
};

export default UserProfileForm;
