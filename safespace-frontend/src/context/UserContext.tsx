// src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { useAuth } from './AuthContext';
import axios from "axios";

export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    role: string;
  // Add other fields as needed (e.g. riskProfile, income, etc.)
}

interface UserContextType {
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile | null) => void;
    isLoading: boolean;
    refreshUserProfile: () => Promise<void>; // ⬅️ NEW
}

const UserContext = createContext<UserContextType>({
    userProfile: null,
    setUserProfile: () => {},
    isLoading: true,
    refreshUserProfile: async () => {}, // ⬅️ NEW
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    const fetchUserProfile = async () => {
        if (!user) return;
    
        setIsLoading(true);
        try {
            console.log("About to make an API call");
            const token = await user.getIdToken();
            // const response = await axios.get("https://ec2-18-216-211-58.us-east-2.compute.amazonaws.com/users/me", 
            //     {headers: {Authorization: `Bearer ${token}` }}
            // );
            const response = await api.get("/users/me");
            const data = response.data;
            console.log(data);
            // const accountResponse = await axios.get("https://ec2-18-216-211-58.us-east-2.compute.amazonaws.com/accounts/me", 
            //     {headers: {Authorization: `Bearer ${token}` }});
            const accountResponse = await api.get("/accounts/me")
            const accountData = accountResponse.data;
            console.log(accountData);
            setUserProfile({
                id: data.id,
                firstName: data.first_name, 
                lastName: data.last_name, 
                phoneNumber: data.phone_number,
                role: accountData.role
            });       
            } catch (err) {
            console.error("Failed to fetch user profile", err);
        } finally {
            setIsLoading(false);
        }
    };

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

export const useUser = () => useContext(UserContext);
