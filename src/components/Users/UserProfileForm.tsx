
// UserProfileForm.tsx
import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Row, Col, Image, Button, Alert } from "react-bootstrap";
import SuccessModal from "../Other/SuccessModal";
import { useAuth } from '../../context/AuthContext';
import axios from "axios";

const UserProfileForm: React.FC = () => {
    const { id } = useParams();
    const { user, logOut } = useAuth();
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
    const navigate = useNavigate();


    // Fetch user data on mount and if user Id updates
    useEffect(() => {
        if (id) {
            axios.get(`http://127.0.0.1:5000/users/${id}`)
                .then(response => {
                    setFirstName(response.data[0].first_name);
                    setLastName(response.data[0].last_name);
                    setPhone(response.data[0].phone_number);
                })
                .catch(error =>{
                    console.error("Error fetching user data:", error.message);
                    setError(error.message);
                });
    }}, [id]);

        // Handle account deletion
        const handleDeleteAccount = async () => {
            if (id) {
                try {
                    // Call your API to delete the user account
                    const response = await axios.delete(`http://127.0.0.1:5000/users/${id}`);
    
                    if (response.status === 200) {
                        // Successfully deleted the account
                        await logOut();  // Log out the user
                        navigate("/"); // Redirect home
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
            let userData = {
                account_id: user?.uid,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                created_at: new Date(),
                updated_at: new Date()
            };
            // Put/Post the User Info
            let response;
            if(id){
                response = await axios.put(`http://127.0.0.1:5000/users/${id}`, userData,
                    {headers:{'Content-Type': 'application/json'}}
                );
            }else{
                response = await axios.post(
                    `http://127.0.0.1:5000/customers/`, 
                    userData, 
                    {headers:{'Content-Type': 'application/json'}}
                );
            }
            if (response.status !== 200) {
                throw new Error("Failed to save user info.");
            }
            setShowSuccessModal(true);           
        }catch(err){
            console.error("Error submitting form:", err.message);
            setError(err.message);
        }

    };
    
    return (
        <Container className="p-5 my-5 rounded">
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

                    
                    <div className='text-center'>
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
                    <Image src="/sign-up-img.jpg" alt="" width="100%" fluid />
                </Col>

            </Row>
        </Container>
    );
};

export default UserProfileForm;

type UserProfileFormProps = {
    id: string;
};

    // const [profilePic, setProfilePic] = useState<File |null>(null);
    // const [imagePreview, setImagePreview] = useState('');


        // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (file) {
    //         setProfilePic(file);
    //         setImagePreview(URL.createObjectURL(file)); 
    //     }
    // };

    {/* <Form.Group controlId="userImage" className="mb-3">
    <Form.Label>Upload a Profile Image</Form.Label>
    <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
</Form.Group>
{imagePreview&&
<div className="text-center mb-3">
    <Image src={imagePreview} alt="Preview" rounded width={120} height={120} />
</div>
} */}