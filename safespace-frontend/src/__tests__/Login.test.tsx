// Login.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth } from "firebase/auth";
import { act } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../components/Authorization/Login";

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
            Promise.resolve({ user: { uid: "UXXv1D1ldRd3NVwQjMbRpMRyxzi2" } })
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
    
        (useAuth as jest.Mock).mockReturnValue({
            user: null,
            loading: false,
            error: null,
            signIn: jest.fn((email: string, password: string) =>
                signInWithEmailAndPassword(getAuth(), email, password)
            ),
            logOut: jest.fn(),
        });
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
    test("renders login form", () => {
        render(<MemoryRouter>
                <Login />
            </MemoryRouter>);
        
        expect(screen.getByText(/Welcome back./i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();    
    });

    // Simulating filling out the form and clicking log in
    test("calls signInWithEmailAndPassword on login", async () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    
        fireEvent.change(screen.getByPlaceholderText(/Enter email/i), { target: { value: "hola.lizbeth@gmail.com" } });
        fireEvent.change(screen.getByPlaceholderText(/Enter password/i), { target: { value: "Password1!" } });
    
        await act(async () => {
            fireEvent.click(screen.getByText(/Log In/i));
        });

        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "hola.lizbeth@gmail.com", "Password1!");
    });
});


    // // Simulating filling out the form and clicking log in
    // test("calls signInWithEmailAndPassword on login", async () => {
    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );
    
    //     fireEvent.change(screen.getByPlaceholderText(/Enter Your Email/i), { target: { value: "hola.lizbeth@gmail.com" } });
    //     fireEvent.change(screen.getByPlaceholderText(/Enter Your Password/i), { target: { value: "Password1!" } });
    
    //     await act(async () => {
    //         fireEvent.click(screen.getByText(/Login/i));
    //     });

    //     expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), "hola.lizbeth@gmail.com", "Password1!");
    // });

    // // Simulating filling out and clicking register
    // test('calls createUserWithEmailAndPassword on register', async () => {
    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );

    //     fireEvent.change(screen.getByPlaceholderText(/Enter Your Email/i), { target: { value: 'test@example.com' } });
    //     fireEvent.change(screen.getByPlaceholderText(/Enter Your Password/i), { target: { value: 'Password123!' } });

    //     await act(async()=>{
    //         fireEvent.click(screen.getByText(/Register/i));
    //     });

    //     expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
    //         expect.any(Object), // Accepts any object as the Firebase auth instance
    //         "test@example.com", 
    //         "Password123!"
    //     );
    // });

    // // Simulating clicking the sign out button
    // test('calls signOut on logout', async () => {
    //     // simulate a user being signed in
    //     (useAuth as jest.Mock).mockReturnValue({ user: { uid: '9w9o6dc27uOfVt989cOgoKjVNGc2' }, loading: false, error: null });

    //     render(
    //         <MemoryRouter>
    //             <Login />
    //         </MemoryRouter>
    //     );

    //     await act(async()=>{
    //         fireEvent.click(screen.getByText(/Sign Out/i));
    //     });

    //     expect(signOut).toHaveBeenCalled();
    // });




// import React from "react";
// import Login from "../components/Authorization/Login";
// import { render, screen, fireEvent } from "@testing-library/react";
// import { MemoryRouter } from "react-router-dom";
// import { act } from "react";
// import { useAuth } from "../context/AuthContext";

// // Mock useNavigate
// jest.mock("react-router-dom", () => ({
//     ...jest.requireActual("react-router-dom"),
//     useNavigate: () => jest.fn(),
// }));

// // Mock useAuth
// const mockSignIn = jest.fn();
// const mockLogOut = jest.fn();

// jest.mock("../context/AuthContext", () => ({
//     useAuth: jest.fn(),
// }));

// describe("Login Component", () => {
//     beforeEach(() => {
//         window.alert = jest.fn();
//         jest.clearAllMocks();

//         // Simulate user not signed in
//         (useAuth as jest.Mock).mockReturnValue({
//             user: null,
//             loading: false,
//             error: null,
//             signIn: mockSignIn,
//             logOut: mockLogOut,
//         });
//     });

//     test("renders login form", () => {
//         render(
//         <MemoryRouter>
//             <Login />
//         </MemoryRouter>
//         );

//         expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
//         expect(screen.getByPlaceholderText(/Enter email/i)).toBeInTheDocument();
//         expect(screen.getByPlaceholderText(/Enter password/i)).toBeInTheDocument();
//     });
// });

//     test("calls signIn on login", async () => {
//         mockSignIn.mockResolvedValueOnce(undefined); // simulate successful login

//         render(
//         <MemoryRouter>
//             <Login />
//         </MemoryRouter>
//         );

//         fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
//         target: { value: "test@test.com" },
//         });
//         fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
//         target: { value: "Password1!" },
//         });

//         await act(async () => {
//         fireEvent.click(screen.getByText(/Log In/i));
//         });

//         expect(mockSignIn).toHaveBeenCalledWith("test@test.com", "Password1!");
//     });

//     test("displays error when signIn fails", async () => {
//         mockSignIn.mockRejectedValueOnce(new Error("Login failed"));

//         render(
//         <MemoryRouter>
//             <Login />
//         </MemoryRouter>
//         );

//         fireEvent.change(screen.getByPlaceholderText(/Enter email/i), {
//         target: { value: "bad@test.com" },
//         });
//         fireEvent.change(screen.getByPlaceholderText(/Enter password/i), {
//         target: { value: "wrongPassword" },
//         });

//         await act(async () => {
//         fireEvent.click(screen.getByText(/Log In/i));
//         });

//         expect(screen.getByText(/Login failed: Invalid credentials/i)).toBeInTheDocument();
//     });
// });
