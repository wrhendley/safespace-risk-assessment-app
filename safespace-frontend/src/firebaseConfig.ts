// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import React from "react";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBXANc2BHmB4vHfI432U689rMN8QNDkJF8",
    authDomain: "safespace-risk-assessment-app.firebaseapp.com",
    projectId: "safespace-risk-assessment-app",
    storageBucket: "safespace-risk-assessment-app.firebasestorage.app",
    messagingSenderId: "452403457316",
    appId: "1:452403457316:web:13ab467c8d8a9a85a6d7b1",
    measurementId: "G-8G264K41MZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Wrap analytics to prevent crashing in unsupported environments
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});
const auth: Auth = getAuth(app);

export { auth };