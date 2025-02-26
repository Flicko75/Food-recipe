//css methods
const container = document.getElementById("container");
const registerbtn = document.getElementById("register");
const loginbtn = document.getElementById("login");

registerbtn.addEventListener("click", () => container.classList.add("active"));
loginbtn.addEventListener("click", () => container.classList.remove("active"));


//firebase backend connection
document.addEventListener("DOMContentLoaded", function () {
    if (!window.firebaseAuth || !window.firebaseDB) return;

    //sign up part
    document.querySelector(".sign-up button").addEventListener("click", function (event) {
        event.preventDefault();

        const name = document.querySelector(".sign-up input[type='text']").value;
        const email = document.querySelector(".sign-up input[type='text']:nth-of-type(2)").value;
        const password = document.querySelector(".sign-up input[type='password']").value;

        window.firebaseAuth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                let user = userCredential.user;
                return window.firebaseDB.collection("admin").doc(user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                alert("Signup Successful!");
                window.location.href = "login-admin.html";
            })
            .catch((error) => alert("Signup Error: " + error.message));
    });

    //sign in part
    document.querySelector(".sign-in button").addEventListener("click", function (event) {
        event.preventDefault();

        const email = document.querySelector(".sign-in input[type='text']").value;
        const password = document.querySelector(".sign-in input[type='password']").value;

        window.firebaseAuth.signInWithEmailAndPassword(email, password)
            .then(() => {
                alert("Login Successful!");
                window.location.href = "admin-dashboard.html";
            })
            .catch((error) => alert("Login Error: " + error.message));
    });
});
