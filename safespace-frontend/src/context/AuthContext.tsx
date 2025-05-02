// AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, User, signOut} from "firebase/auth";
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

    useEffect(()=>{
        const authStateChange = onAuthStateChanged(auth, (currentUser)=>{
            setUser(currentUser);
            setLoading(false);
            setError(null);
        });

        return ()=>{
            try{
                authStateChange();
            }catch(err:any){
                setError(err.message);
            }};
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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken(true);
    
            await api.put("/accounts/update", 
                { is_active: true },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logOut = async () => {
        try {
            setLoading(true);
            const currentUser = auth.currentUser;
    
            if (currentUser) {
                const idToken = await currentUser.getIdToken(true);
                await api.put("/accounts/update", 
                    { is_active: false },
                    { headers: { Authorization: `Bearer ${idToken}` } }
                );
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
