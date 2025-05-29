// AuthContext.tsx
// This file creates and exports the authentication context for use across the app.
// It handles sign up, sign in, sign out, and syncs Firebase auth state with backend activity status.

import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    getIdToken,
    User
} from "firebase/auth";
import api from '../api';

// Define the context shape
interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    error: string | null;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap the app with authentication state
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Set up auth state listener once on mount
    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            setError(null); // Clear any residual errors when auth state changes
        });

        return () => unsubscribe();
    }, []);

    // Create a new Firebase user account
    const signUp = async (email: string, password: string) => {
        try {
            setLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign in existing user and notify backend
    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);

            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Failed to retrieve current Firebase user.");

            const idToken = await currentUser.getIdToken(true);

            // Notify backend that user is active
            await api.put("/accounts/update", { is_active: true }, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            setError(null);
        } catch (err: any) {
            // On backend failure, sign out from Firebase to keep state consistent
            if (auth.currentUser) {
                await signOut(auth).catch(() => {
                    console.warn("Failed to sign out user after backend error.");
                });
            }

            setError(err.message || "An error occurred during sign in.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Sign out user from Firebase and backend
    const logOut = async () => {
        try {
            setLoading(true);
            const currentUser = auth.currentUser;
            // Optionally update backend status
            if (currentUser) {
                await api.put("/accounts/update", { is_active: false });
            }

            await signOut(auth);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, logOut, error }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access AuthContext easily
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};