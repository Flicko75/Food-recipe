document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("UnBt0-SUlvBrGK77k");  // Your actual public key
});

document.addEventListener("DOMContentLoaded", function () {
    // Get all sections and sidebar menu items
    const sections = document.querySelectorAll(".content-section");
    const menuItems = document.querySelectorAll(".side-menu li a");

    // Function to show only the selected section
    function showSection(sectionId) {
        sections.forEach(section => section.classList.add("hidden")); // Hide all sections
        document.getElementById(sectionId).classList.remove("hidden"); // Show the selected section
    }

    // Add click event listeners to sidebar menu items
    menuItems.forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute("data-section");

            if (sectionId) {
                showSection(sectionId);

                // If "Manage Users" section is selected, load user requests
                if (sectionId === "manage-users-section") {
                    loadUserRequests();
                }
            }
        });
    });

    // Default section to display when page loads
    showSection("dashboard-section");
});

// Function to load pending user requests from Firestore
async function loadUserRequests() {
    const userRequestsTable = document.getElementById("user-requests-table");
    userRequestsTable.innerHTML = ""; // Clear table before adding new rows

    try {
        // Fetch all documents from the "userRequests" collection
        const querySnapshot = await firebaseDB.collection("userRequests").get();

        if (querySnapshot.empty) {
            console.log("No user requests found.");
            userRequestsTable.innerHTML = "<tr><td colspan='3'>No pending requests</td></tr>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log("User Data:", data); // Debugging log

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.name || "Unknown"}</td>
                <td>${data.dateRequested || "N/A"}</td>
                <td>
                    <button class="approve-btn" data-id="${doc.id}" data-email="${data.email}" data-name="${data.name}">Approve</button>
                    <button class="reject-btn" data-id="${doc.id}">Reject</button>
                </td>
            `;

            userRequestsTable.appendChild(row);
        });

        // Attach event listeners to approve and reject buttons
        document.querySelectorAll(".approve-btn").forEach(button => {
            button.addEventListener("click", approveUser);
        });

        document.querySelectorAll(".reject-btn").forEach(button => {
            button.addEventListener("click", rejectUser);
        });

    } catch (error) {
        console.error("Error fetching user requests:", error);
        alert("Failed to load user requests. Check the console for more details.");
    }
}


// Function to approve user request
async function approveUser(event) {
    const userId = event.target.getAttribute("data-id");
    const userRef = firebaseDB.collection("userRequests").doc(userId);

    console.log("Approve button clicked for User ID:", userId);

    try {
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error("User request not found!");
            alert("User request not found!");
            return;
        }

        const userData = userDoc.data();
        const generatedPassword = generateRandomPassword();

        console.log("User Data:", userData);
        console.log("Generated Password:", generatedPassword);

        // Update user status to approved in userRequests (optional)
        await userRef.update({
            status: "approved"
        });

        // Move user to 'users' collection
        await firebaseDB.collection("users").doc(userId).set({
            name: userData.name,
            email: userData.email,
            password: generatedPassword, // Ideally should be hashed
            status: "approved",
            isDefaultPassword: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log("User added to 'users' collection.");

        // Remove from 'userRequests' collection after approval
        await userRef.delete();
        console.log("User request deleted from 'userRequests'.");

        // Send email with the generated password
        sendApprovalEmail(userData.email, userData.name, generatedPassword);

        alert("User approved successfully!");
        loadUserRequests(); // Refresh table

    } catch (error) {
        console.error("Error approving user:", error);
        alert("Error approving user. Check console for details.");
    }
}

// Function to generate a random password
function generateRandomPassword() {
    return Math.random().toString(36).slice(-8); // Simple random 8-char password
}

// Function to send email using EmailJS
function sendApprovalEmail(email, name, password) {
    console.log("Sending email to:", email);
    
    emailjs.send("service_pes7z4r", "template_x0pv8fs", {
        to_email: email,
        user_name: name,
        generated_password: password
    }).then(response => {
        console.log("Email sent successfully!", response);
    }).catch(error => {
        console.error("Error sending email:", error);
    });
}

// Attach event listeners to buttons after loading data
async function loadUserRequests() {
    const userRequestsTable = document.getElementById("user-requests-table");
    userRequestsTable.innerHTML = ""; // Clear table

    try {
        const querySnapshot = await firebaseDB.collection("userRequests").get();
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${data.name}</td>
                <td>${data.dateRequested}</td>
                <td>
                    <button class="approve-btn" data-id="${doc.id}">Approve</button>
                    <button class="reject-btn" data-id="${doc.id}">Reject</button>
                </td>
            `;

            userRequestsTable.appendChild(row);
        });

        // Attach event listeners to newly created buttons
        document.querySelectorAll(".approve-btn").forEach(button => {
            button.addEventListener("click", approveUser);
        });

        document.querySelectorAll(".reject-btn").forEach(button => {
            button.addEventListener("click", rejectUser);
        });

    } catch (error) {
        console.error("Error fetching user requests:", error);
    }
}

// Ensure buttons work after DOM loads
document.addEventListener("DOMContentLoaded", function () {
    loadUserRequests();
});


// Function to reject a user request
async function rejectUser(event) {
    const userId = event.target.getAttribute("data-id"); // Get user ID

    try {
        // Remove the user request from Firestore
        await firebaseDB.collection("userRequests").doc(userId).delete();
        alert("User request rejected and removed.");

        // Refresh the user requests table
        loadUserRequests();
    } catch (error) {
        console.error("Error rejecting user:", error);
    }
}

// Function to send approval email using EmailJS
function sendApprovalEmail(email, name, password) {
    console.log("Attempting to send email to:", email);

    emailjs.send("service_pes7z4r", "template_7ovzjhj", {
        to_email: email, // This should be the user's email, not yours
        user_name: name,
        generated_password: password
    }).then(response => {
        console.log("Email sent successfully!", response);
    }).catch(error => {
        console.error("Error sending email:", error);
    });
}



// Toggle sidebar from minimized to maximized
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
	sidebar.classList.toggle('hide');
})




const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
	if(window.innerWidth < 576) {
		e.preventDefault();
		searchForm.classList.toggle('show');
		if(searchForm.classList.contains('show')) {
			searchButtonIcon.classList.replace('bx-search', 'bx-x');
		} else {
			searchButtonIcon.classList.replace('bx-x', 'bx-search');
		}
	}
})


if(window.innerWidth < 768) {
	sidebar.classList.add('hide');
} else if(window.innerWidth > 576) {
	searchButtonIcon.classList.replace('bx-x', 'bx-search');
	searchForm.classList.remove('show');
}


window.addEventListener('resize', function () {
	if(this.innerWidth > 576) {
		searchButtonIcon.classList.replace('bx-x', 'bx-search');
		searchForm.classList.remove('show');
	}
})




