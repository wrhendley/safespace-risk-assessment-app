// SignUp.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { act } from "react";
import { useAuth } from "../context/AuthContext";
import SignUp from "../components/Authorization/SignUp";

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
describe("SignUp Component", () => {
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
    test("renders sign up form", () => {
        render(<MemoryRouter>
                <SignUp />
            </MemoryRouter>);
        
        expect(screen.getByText(/Let's get started./i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();    
        expect(screen.getByPlaceholderText(/Re-enter password/i)).toBeInTheDocument();    
    });
});