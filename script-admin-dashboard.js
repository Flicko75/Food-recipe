// Initializing EmailJS

document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("UnBt0-SUlvBrGK77k");  // Your actual public key
});

// Manage User page show up
document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".content-section");
    const menuItems = document.querySelectorAll(".side-menu li a");

    function showSection(sectionId) {
        sections.forEach(section => section.classList.add("hidden"));
        document.getElementById(sectionId).classList.remove("hidden");
    }

    menuItems.forEach(item => {
        item.addEventListener("click", function (e) {
            e.preventDefault();
            const sectionId = this.getAttribute("data-section");
            if (sectionId) {
                showSection(sectionId);
                if (sectionId === "manage-users-section") {
                    loadUserRequests();
                }
            }
        });
    });

    showSection("dashboard-section");
});

// Load pending user requests
async function loadUserRequests() {
    const userRequestsTable = document.getElementById("user-requests-table");
    userRequestsTable.innerHTML = "";

    try {
        const querySnapshot = await firebaseDB.collection("userRequests").get();

        if (querySnapshot.empty) {
            userRequestsTable.innerHTML = "<tr><td colspan='3'>No pending requests</td></tr>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${data.name || "Unknown"}</td>
                <td>${data.email}</td>
                <td>
                    <button class="approve-btn" data-id="${doc.id}" data-email="${data.email}" data-name="${data.name}">Approve</button>
                    <button class="reject-btn" data-id="${doc.id}">Reject</button>
                </td>
            `;
            userRequestsTable.appendChild(row);
        });

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

// Approve user
async function approveUser(event) {
    const userId = event.target.getAttribute("data-id");
    const userRef = firebaseDB.collection("userRequests").doc(userId);

    try {
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            alert("User request not found!");
            return;
        }

        const userData = userDoc.data();
        if (!userData.email || !userData.name) {
            alert("User data is incomplete. Cannot approve.");
            return;
        }

        const generatedPassword = generateRandomPassword();

        const userCredential = await firebase.auth().createUserWithEmailAndPassword(userData.email, generatedPassword);
        const newUser = userCredential.user; 

        await firebaseDB.collection("users").doc(newUser.uid).set({
            name: userData.name,
            email: userData.email,
            password: generatedPassword,
            status: "approved",
            isDefaultPassword: true,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            defaultPassword: generatedPassword
        });

        sendApprovalEmail(userData.email, userData.name, generatedPassword);
        alert("User approved successfully!");

        // Step 3: Remove request from userRequests
        await userRef.delete();
        loadUserRequests();
    } catch (error) {
        console.error("Error processing user request:", error);
        alert("Error processing user request.");
    }
}


// Reject user
async function rejectUser(event) {
    const userId = event.target.getAttribute("data-id");
    try {
        await firebaseDB.collection("userRequests").doc(userId).delete();
        alert("User request rejected and removed.");
        loadUserRequests();
    } catch (error) {
        console.error("Error rejecting user:", error);
    }
}

// Generate random password
function generateRandomPassword() {
    return Math.random().toString(36).slice(-8);
}

// Send approval email using EmailJS
function sendApprovalEmail(email, name, password) {
    emailjs.send("service_pes7z4r", "template_7ovzjhj", {
        to_email: email,
        user_name: name,
        generated_password: password
    }).then(response => {
        console.log("Email sent successfully!", response);
    }).catch(error => {
        console.error("Error sending email:", error);
    });
}

// Manage recipe section
document.addEventListener("DOMContentLoaded", function () {
    const manageRecipesLink = document.querySelector('a[data-section="manage-recipes-section"]');
    const manageRecipesSection = document.getElementById("manage-recipes-section");

    manageRecipesLink.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default anchor behavior
        
        // Toggle visibility without affecting other sections
        if (manageRecipesSection.classList.contains("hidden")) {
            manageRecipesSection.classList.remove("hidden");
        } else {
            manageRecipesSection.classList.add("hidden");
        }
    });

    
});


// Manage Recipes Section Toggle
document.querySelector("a[data-section='manage-recipes-section']").addEventListener("click", function () {
    document.getElementById("manage-recipes-section").classList.toggle("active");
});

// Setting max recipes in Firebase
document.addEventListener("DOMContentLoaded", function () {
    const setMaxRecipesButton = document.getElementById("set-max-recipes");
    const maxRecipesInput = document.getElementById("max-recipes");
    const recipeStatus = document.getElementById("recipe-status");

    if (setMaxRecipesButton) {
        setMaxRecipesButton.addEventListener("click", function () {
            const maxRecipes = parseInt(maxRecipesInput.value);
            if (isNaN(maxRecipes) || maxRecipes < 1) {
                recipeStatus.textContent = "Please enter a valid number greater than 0.";
                recipeStatus.style.color = "red";
                return;
            }

           
            firebase.firestore().collection("users").doc("config").set({
                maxRecipes: maxRecipes
            })
            .then(() => {
                recipeStatus.textContent = `Max recipes set to ${maxRecipes}.`;
                recipeStatus.style.color = "green";
            })
            .catch((error) => {
                console.error("Error updating max recipes:", error);
                recipeStatus.textContent = "Error saving max recipes.";
                recipeStatus.style.color = "red";
            });
        });
    } else {
        console.error("Button with ID 'set-max-recipes' not found!");
    }
});



// Sidebar toggle
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');
menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

// Search button toggle
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');
searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        searchButtonIcon.classList.toggle('bx-x', searchForm.classList.contains('show'));
    }
});

if (window.innerWidth < 768) {
    sidebar.classList.add('hide');
}

window.addEventListener('resize', function () {
    if (this.innerWidth > 576) {
        searchButtonIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

// Logout button functionality
document.querySelector(".logout").addEventListener("click", async function (e) {
    e.preventDefault();
    try {
        await firebase.auth().signOut();
        alert("Logged out successfully!");
        window.location.href = "login-admin.html"; // Redirect to the login page
    } catch (error) {
        console.error("Error logging out:", error);
        alert("Failed to log out. Try again.");
    }
});

