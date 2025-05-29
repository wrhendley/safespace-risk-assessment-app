// UserContext.tsx
// This file provides global user profile context based on authenticated Firebase user.
// It fetches and stores additional user info from the backend, including name, phone number, and role.

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

// Define the structure of a user profile
export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
}

// Define the structure of the context state
interface UserContextType {
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile | null) => void;
    isLoading: boolean;
    refreshUserProfile: () => Promise<void>;
}

// Create the UserContext with default values
const UserContext = createContext<UserContextType>({
    userProfile: null,
    setUserProfile: () => {},
    isLoading: true,
    refreshUserProfile: async () => {},
});

// UserProvider wraps parts of the app that need access to user profile data
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth(); // Access the Firebase user from AuthContext

    // Fetches user profile and account role from backend
    const fetchUserProfile = async () => {
        if (!user) return; // Exit if no Firebase user

        setIsLoading(true);
        try {
            // Get basic user info
            const response = await api.get("/users/me");
            const data = response.data;

            // Get user role from account model
            const accountResponse = await api.get("/accounts/me");
            const accountData = accountResponse.data;

            // Set the user profile state
            setUserProfile({
                id: data.id,
                firstName: data.first_name,
                lastName: data.last_name,
                phoneNumber: data.phone_number,
                role: accountData.role,
            });
        } catch (err: any) {
            // If user profile doesn't exist yet (404), reset to null
            if (err.response?.status === 404) {
                setUserProfile(null);
            } else {
                console.error("Failed to fetch user", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch user profile when Firebase user changes (on login/logout)
    useEffect(() => {
        fetchUserProfile();
    }, [user]);

    return (
        <UserContext.Provider
            value={{
                userProfile,
                setUserProfile,
                isLoading,
                refreshUserProfile: fetchUserProfile,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to access UserContext values
export const useUser = () => useContext(UserContext);
