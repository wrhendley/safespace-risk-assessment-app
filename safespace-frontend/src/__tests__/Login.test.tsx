// Login.test.tsx
import React from "react";
import Login from "../components/Authorization/Login";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { act } from "react";
import { useAuth } from "../context/AuthContext";


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
describe("Login Component", () => {
    beforeEach(() => {
        window.alert = jest.fn();
    });

    // simulate no user being signed in
    (useAuth as jest.Mock).mockReturnValue({ user: null, loading: false, error: null });

    // Checking if the component renders correctly
    test("renders login form", () => {
        render(<MemoryRouter>
                <Login />
            </MemoryRouter>);
        
        expect(screen.getByText(/Sign in or Sign up Now/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter Your Email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter Your Password/i)).toBeInTheDocument();    
    });

    // Simulating filling out the form and clicking log in
    test("calls signInWithEmailAndPassword on login", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    
        fireEvent.change(screen.getByPlaceholderText(/Enter Your Email/i), { target: { value: "test@test.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Enter Your Password/i), { target: { value: "Password1!" } });
    
        await act(async () => {
            fireEvent.click(screen.getByText(/Log In/i));
        });

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "test@test.com", "Password1!");
    });
});
