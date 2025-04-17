// Login.tsx
import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login successful!");
        } catch (err: any) {
        setError(err.message);
        }
    };

    const handleLogout = async () => {
        try {
        await signOut(auth);
        alert("Logged out!");
        } catch (err: any) {
        console.error("Logout error:", err.message);
        }
    };

    return (
        <>
        <form onSubmit={handleLogin}>
            <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            />
            <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
            {error && <p>{error}</p>}
        </form>
        <button onClick={handleLogout}>Logout</button>
        </>
    );
};

export default Login;