// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA0NOzCQKGiFcyx7tvBNKA6RKIdjt0DIJw",
    authDomain: "food-recipe-c4195.firebaseapp.com",
    projectId: "food-recipe-c4195",
    storageBucket: "food-recipe-c4195.appspot.com",
    messagingSenderId: "736535113490",
    appId: "1:736535113490:web:e3ae20b6c4ef0f923c4dcb",
    measurementId: "G-NH12LVGNPZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Expose Firebase globally
window.firebaseAuth = firebase.auth();
window.firebaseDB = firebase.firestore();
