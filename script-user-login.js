// Firebase & EmailJS setup 

// CSS toggle methods
const container = document.getElementById("container");
const registerbtn = document.getElementById("register");
const loginbtn = document.getElementById("login");

registerbtn.addEventListener("click", () => container.classList.add("active"));
loginbtn.addEventListener("click", () => container.classList.remove("active"));

// Signup: Send Request to Admin
document.querySelector(".sign-up form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signup_name").value.trim();
    const email = document.getElementById("signup_email").value.trim();


    if (!name || !email) {
        alert("Please enter your name and email.");
        return;
    }

    try {
        await window.firebaseDB.collection("userRequests").add({
            name,
            email,
            status: "pending"
        });
        alert("Request sent to admin. Wait for email with credentials.");
    } catch (error) {
        console.error("Error sending request:", error);
        alert("Failed to send request. Try again later.");
    }
});


// Login: Authenticate User
document.querySelector(".sign-in form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = e.target[0].value.trim();
    const password = e.target[1].value.trim();

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    try {
        // Query Firestore for a user with matching email
        const querySnapshot = await window.firebaseDB.collection("users")
            .where("email", "==", email)
            .get();

        if (querySnapshot.empty) {
            alert("User not found. Please sign up first.");
            return;
        }

        // Extract user data
        let userData;
        querySnapshot.forEach(doc => {
            userData = doc.data();
        });

        if (password === userData.password) {
            if (userData.status === "approved" && userData.isDefaultPassword !== false) {
                // If user is approved and still using the default password, go to reset-password.html
                sessionStorage.setItem("userEmail", email);
                window.location.href = "reset-password.html";
            } else {
                // Otherwise, go to the dashboard
                window.location.href = "user-dashboard.html";
            }
        } else {
            alert("Incorrect password.");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Login failed. Try again.");
    }
});

