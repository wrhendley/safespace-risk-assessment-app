// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User, signOut, getIdToken} from "firebase/auth";
import React from "react";
import api from '../api'

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            setLoading(false);
            setError(null);
        });
    
        return () => unsubscribe();
    }, []);
    

    const signUp = async (email: string, password: string) => {
        try {
            setLoading(true);
            await createUserWithEmailAndPassword(auth, email, password);
            
        } catch (err: any) {
            setError(err.message);
            throw err;
        }finally{
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);

            // Get the ID token from Firebase
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("Failed to retrieve current Firebase user.");

            const idToken = await currentUser.getIdToken(true);

            // Attempt to update the backend
            await api.put("/accounts/update", { is_active: true }, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            setError(null); // clear error if success
        } catch (err: any) {
            // If backend update fails, sign out from Firebase to maintain consistency
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


    const logOut = async () => {
        try {
            setLoading(true);
            const currentUser = auth.currentUser;
            await signOut(auth);
            if (currentUser) {
                await api.put("/accounts/update", { is_active: false });
            }
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};


