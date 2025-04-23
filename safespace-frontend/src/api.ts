// src/api/api.js or api.ts
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true, // if you're using cookies for auth
});

export default api;