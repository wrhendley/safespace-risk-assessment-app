// ForgotPassword.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { act } from "react";
import { useAuth } from "../context/AuthContext";
import ForgotPassword from "../components/Authorization/ForgotPassword";

// Mock React Router Dom useNavigate
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: () => jest.fn(),
}));

// Mock Firebase Auth and Functions
jest.mock("firebase/auth", () => {
    const actualAuth = jest.requireActual("firebase/auth");
    return {
        ...actualAuth,
        getAuth: jest.fn(() => ({ currentUser: null })), // Ensure auth instance is valid
        signInWithEmailAndPassword: jest.fn(() => 
            Promise.resolve({ user: { uid: "9w9o6dc27uOfVt989cOgoKjVNGc2" } })
        ),
        createUserWithEmailAndPassword: jest.fn(() => 
            Promise.resolve({ user: { uid: "test-user-uid" } }) // Ensures a resolved promise
        ),
        signOut: jest.fn(),
    };
});

// Mock useAuth
jest.mock('../context/AuthContext', ()=>({
    useAuth: jest.fn(),
}));

// Describing the Component for signing in/out and registering
describe("ForgotPassword Component", () => {
    beforeEach(() => {
        window.alert = jest.fn();
    });

    // simulate no user being signed in
    (useAuth as jest.Mock).mockReturnValue({ 
                    user: null,
                    loading: false,
                    error: null,
                    signIn: jest.fn(),
                    logOut: jest.fn(),
                }); 

    // Checking if the component renders correctly
    test("renders forgot password form", () => {
        render(<MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>);
        
        expect(screen.getByText(/Forgotten password?/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter your email/i)).toBeInTheDocument();   
    });
});

// import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
// import ForgotPassword from '../components/Authorization/ForgotPassword';
// import { sendPasswordResetEmail } from 'firebase/auth';

// // Mock the Firebase module
// jest.mock('firebase/auth', () => ({
//     sendPasswordResetEmail: jest.fn()
// }));

// describe('ForgotPassword', () => {
//     it('renders email input and reset button', () => {
//         render(<ForgotPassword />);
//         expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
//         expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
//     });

//     it('calls sendPasswordResetEmail on valid email', async () => {
//         const mockSend = sendPasswordResetEmail as jest.Mock;
//         mockSend.mockResolvedValueOnce(undefined);

//         render(<ForgotPassword />);

//         await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
//         await userEvent.click(screen.getByRole('button', { name: /submit/i }));

//         expect(mockSend).toHaveBeenCalledWith(expect.anything(), 'user@example.com');
//     });
// });