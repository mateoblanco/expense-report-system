// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6rTfsyghFyRJT7PXGmrUNQz5Sa2s9R5U",
  authDomain: "expense-report-system.firebaseapp.com",
  projectId: "expense-report-system",
  storageBucket: "expense-report-system.firebasestorage.app",
  messagingSenderId: "951751740170",
  appId: "1:951751740170:web:dc2f44a566bd63303108f3",
  measurementId: "G-4CE4Z6TF62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);