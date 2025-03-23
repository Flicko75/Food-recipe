document.getElementById("resetPasswordForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const email = sessionStorage.getItem("userEmail"); // Get user email from session storage

    if (!email) {
        alert("Session expired. Please log in again.");
        window.location.href = "user-login.html";
        return;
    }

    if (!newPassword || !confirmPassword) {
        alert("Please enter a new password.");
        return;
    }

    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    try {
        // Get the currently logged-in user
        const user = firebase.auth().currentUser;

        if (!user) {
            alert("User not logged in. Please log in again.");
            window.location.href = "user-login.html";
            return;
        }

        // Update password in Firebase Authentication
        await user.updatePassword(newPassword);

        // Find the user document in Firestore and update it
        const querySnapshot = await firebase.firestore().collection("users")
            .where("email", "==", email)
            .get();

        if (querySnapshot.empty) {
            alert("User not found in the database.");
            return;
        }

        let userDocId;
        querySnapshot.forEach(doc => {
            userDocId = doc.id;
        });

        // Update Firestore to mark the password as changed
        await firebase.firestore().collection("users").doc(userDocId).update({
            isDefaultPassword: false
        });

        alert("Password updated successfully. Redirecting to dashboard...");
        sessionStorage.removeItem("userEmail");
        window.location.href = "user-dashboard.html";
    } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password. Try again later.");
    }
});
