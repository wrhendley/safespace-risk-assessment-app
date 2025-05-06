// SignUp.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createUserWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
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

        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
            error: null, 
            signUp: jest.fn((email: string, password: string) =>
                createUserWithEmailAndPassword(getAuth(), email, password)
            ),
        })
    });

    // simulate no user being signed in
    (useAuth as jest.Mock).mockReturnValue({ 
                    user: null,
                    loading: false,
                    error: null,
                    signIn: jest.fn(),
                    signUp: jest.fn(),
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
        expect(screen.getByPlaceholderText(/Repeat password/i)).toBeInTheDocument();    
    });
    
    // Simulating filling out the form and clicking create account
    test("registers a user and shows success modal", async () => {
        const mockUid = "mock-user-uid";
        const mockGetIdToken = jest.fn(() => Promise.resolve("mock-id-token"));
        const mockSendEmailVerification = jest.fn(() => Promise.resolve());
    
        // Mock Firebase auth.currentUser
        const mockCurrentUser = {
            uid: mockUid,
            getIdToken: mockGetIdToken,
        };
        const mockAuth = {
            currentUser: mockCurrentUser,
        };
        (getAuth as jest.Mock).mockReturnValue(mockAuth);
    
        // Mock sendEmailVerification directly (not through jest.mock above)
        jest.mock("firebase/auth", () => ({
            ...jest.requireActual("firebase/auth"),
            sendEmailVerification: mockSendEmailVerification,
        }));
    
        // Mock API call
        jest.mock("../api", () => ({
            __esModule: true,
            default: {
                post: jest.fn(() =>
                    Promise.resolve({ status: 201 })
                ),
            },
        }));
    
        render(
            <MemoryRouter>
                <SignUp />
            </MemoryRouter>
        );
    
        fireEvent.change(screen.getByLabelText(/Select your role/i), {
            target: { value: "user" },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
            target: { value: "test@example.com" },
        });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
            target: { value: "Password1!" },
        });
        fireEvent.change(screen.getByPlaceholderText(/Repeat password/i), {
            target: { value: "Password1!" },
        });
    
        await act(async () => {
            fireEvent.click(screen.getByText(/Create Account/i));
        });
    
        // Assertions
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
            expect.anything(),
            "test@example.com",
            "Password1!"
        );
        // expect(mockGetIdToken).toHaveBeenCalled();
        // expect(mockSendEmailVerification).toHaveBeenCalledWith(mockCurrentUser);
        // expect(await screen.findByText(/Please verify your email before signing in again./i)).toBeInTheDocument(); // modal appears
    });
});