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
        // Find the user document with the matching email
        const querySnapshot = await window.firebaseDB.collection("users")
            .where("email", "==", email)
            .get();

        if (querySnapshot.empty) {
            alert("User not found in the database.");
            return;
        }

        let userDocId;
        querySnapshot.forEach(doc => {
            userDocId = doc.id; // Get the actual user document ID
        });

        // Now update using the correct document ID
        await window.firebaseDB.collection("users").doc(userDocId).update({
            password: newPassword,
            isDefaultPassword: false
        });

        alert("Password updated successfully. Redirecting to dashboard...");
        sessionStorage.removeItem("userEmail");
        window.location.href = "user-dashboard.html"; // Redirect to dashboard
    } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to update password. Try again later.");
    }
});
