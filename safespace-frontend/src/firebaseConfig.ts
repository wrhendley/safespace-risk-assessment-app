// firebaseConfig.ts
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth: Auth = getAuth(app);

export { auth };