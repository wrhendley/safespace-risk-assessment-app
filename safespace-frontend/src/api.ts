import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // for Vite
    withCredentials: true, // keep this if your backend uses cookies
});

// Add interceptor to attach token to every request
api.interceptors.request.use(
    async (config) => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;