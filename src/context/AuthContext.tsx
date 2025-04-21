// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User, signOut} from "firebase/auth";
import axios from "axios";

interface AuthContextType {
    user: User | null;
    signUp: (email: string, password: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    logOut: () => Promise<void>;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                // If user is signed in, set 'is_active' to true in your database
                try {
                    await axios.post("http://localhost:5000/api/accounts/update", {
                        firebase_uid: currentUser.uid,
                        is_active: true
                    });
                } catch (err) {
                    setError("Failed to update user status.");
                }
            } else {
                // If user is signed out, set 'is_active' to false in your database
                try {
                    await axios.post("http://localhost:5000/api/accounts/update", {
                        firebase_uid: user?.uid,
                        is_active: false
                    });
                } catch (err) {
                    setError("Failed to update user status.");
                }
            }
        });

        return unsubscribe;
    }, [user]);

    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);

        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logOut = async () => {
        try {
            await signOut(auth);
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, signUp, signIn, logOut, error }}>
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
