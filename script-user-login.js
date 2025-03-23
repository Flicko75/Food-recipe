// CSS toggle methods
const container = document.getElementById("container");
const registerbtn = document.getElementById("register");
const loginbtn = document.getElementById("login");

registerbtn.addEventListener("click", () => container.classList.add("active"));
loginbtn.addEventListener("click", () => container.classList.remove("active"));

// Signup: Send Request to Admin
document.querySelector(".sign-in form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get email and password input values
    const email = document.querySelector(".sign-in input[type='text']").value.trim();
    const password = document.querySelector(".sign-in input[type='password']").value.trim();

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        // Authenticate user with Firebase
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        console.log("✅ Logged in:", user.email);

        // Fetch user details from Firestore
        const doc = await firebase.firestore().collection("users").doc(user.uid).get();

        if (doc.exists) {
            const userData = doc.data();
            console.log("✅ Firestore Data:", userData);

            if (userData.status === "approved" && userData.isDefaultPassword) {
                sessionStorage.setItem("userEmail", userData.email);
                window.location.href = "reset-password.html";
            } else {
                window.location.href = "user-dashboard.html";
            }
        } else {
            console.error("❌ No user data found in Firestore.");
            alert("User not found in Firestore.");
        }
    } catch (error) {
        console.error("❌ Login error:", error.message);
        alert("Login failed. Check your email and password.");
    }
});


// // Forgot Password: Send Request to Admin
// document.getElementById("forgotPasswordRequest").addEventListener("click", async (e) => {
//     e.preventDefault();

//     const email = document.querySelector(".sign-in input[type='text']").value.trim();

//     if (!email) {
//         alert("Please enter your email before sending a forgot password request.");
//         return;
//     }

//     try {
//         // Fetch user details from Firestore
//         const userQuery = await window.firebaseDB.collection("users")
//             .where("email", "==", email)
//             .get();

//         if (userQuery.empty) {
//             alert("No account found with this email.");
//             return;
//         }

//         let userData;
//         userQuery.forEach(doc => {
//             userData = doc.data();
//         });

//         console.log("User found for forgot password:", userData); // Debugging

//         if (!userData.name) {
//             alert("Error: User data is missing a name. Please contact admin.");
//             return;
//         }

//         // Send forgot password request with user’s name
//         await window.firebaseDB.collection("userRequests").add({
//             name: userData.name,  // Store user’s name
//             email: userData.email,
//             requestType: "forgot-password",
//             status: "pending"
//         });

//         alert("Forgot password request sent to admin.");
//     } catch (error) {
//         console.error("Error sending forgot password request:", error);
//         alert("Failed to send request. Try again later.");
//     }
// });

