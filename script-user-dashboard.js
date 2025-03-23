document.addEventListener("DOMContentLoaded", async function () {
    const auth = firebase.auth();
    const db = firebase.firestore();

    let userId = null;
    let maxRecipes = 0;
    let recipes = [];
    let editingIndex = -1;

    const maxRecipesDisplay = document.getElementById("max-recipes-display");
    const recipeListContainer = document.getElementById("added-recipe-list");

    window.openPopup = function () {
        document.getElementById("popup").style.display = "block";
    };

    window.closePopup = function () {
        document.getElementById("popup").style.display = "none";
        editingIndex = -1;
    };

    async function fetchMaxRecipes() {
        try {
            const configDoc = await db.collection("users").doc("config").get();
            if (configDoc.exists && configDoc.data().maxRecipes !== undefined) {
                maxRecipes = configDoc.data().maxRecipes;
                maxRecipesDisplay.textContent = `Max Recipes: ${maxRecipes}`;
            } else {
                maxRecipesDisplay.textContent = "Max Recipes: Not Set";
                maxRecipes = 0;
            }
            updateRecipeList();
        } catch (error) {
            console.error("Error fetching max recipes:", error);
        }
    }


    auth.onAuthStateChanged(async (user) => {
        if (user) {
            userId = user.uid;
            await fetchMaxRecipes();
            await fetchUserRecipes();
        } else {
            alert("User not logged in!");
            window.location.href = "login-user.html";
        }
    });

    async function fetchUserRecipes() {
        try {
            const userRecipesRef = db.collection("users").doc(userId).collection("recipes");
            const snapshot = await userRecipesRef.get();
            recipes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            updateRecipeList();
        } catch (error) {
            console.error("❌ Error fetching recipes:", error);
        }
    }

    window.addRecipe = function () {
        const title = document.getElementById("recipe-name").value.trim();
        const ingredients = document.getElementById("recipe-ingredients").value.trim();
        const description = document.getElementById("recipe-description").value.trim();

        if (!title || !ingredients || !description) {
            alert("Please fill all fields!");
            return;
        }

        if (editingIndex === -1) {
            if (recipes.length >= maxRecipes) {
                alert("You have reached the maximum number of recipes allowed.");
                return;
            }
            addRecipeToFirestore(title, ingredients, description);
        } else {
            updateRecipeInFirestore(editingIndex, title, ingredients, description);
        }
    };

    async function addRecipeToFirestore(title, ingredients, description) {
        try {
            const userRecipesRef = db.collection("users").doc(userId).collection("recipes");
            const newRecipe = await userRecipesRef.add({
                title,
                ingredients,
                description,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            recipes.push({ id: newRecipe.id, title, ingredients, description });
            updateRecipeList();
            clearInputs();
            closePopup();
        } catch (error) {
            console.error("❌ Error adding recipe:", error);
        }
    }

    async function updateRecipeInFirestore(index, title, ingredients, description) {
        try {
            const recipeId = recipes[index].id;
            await db.collection("users").doc(userId).collection("recipes").doc(recipeId).update({
                title,
                ingredients,
                description
            });

            recipes[index] = { id: recipeId, title, ingredients, description };
            updateRecipeList();
            clearInputs();
            closePopup();
            editingIndex = -1;
        } catch (error) {
            console.error("❌ Error updating recipe:", error);
        }
    }

    function updateRecipeList() {
        recipeListContainer.innerHTML = "";
        recipes.forEach((recipe, index) => {
            let recipeItem = document.createElement("div");
            recipeItem.classList.add("recipe-item");
            recipeItem.innerHTML = `
            <strong>${recipe.title}</strong> 
            <p>Description: ${recipe.description}</p>
            <p>Ingredients: ${recipe.ingredients}</p>
            <button class="delete-btn" onclick="deleteRecipe(${index})">Delete</button>
        `;
            recipeList.appendChild(recipeItem);
        });

        document.querySelector(".add-recipe").disabled = recipes.length >= maxRecipes;

        // Attach event listeners after rendering
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", function () {
                editRecipe(this.getAttribute("data-index"));
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", function () {
                deleteRecipe(this.getAttribute("data-index"));
            });
        });
    }

    // Move these functions outside
    window.editRecipe = function (index) {
        index = Number(index);
        const recipe = recipes[index];
        document.getElementById("recipe-name").value = recipe.title;
        document.getElementById("recipe-ingredients").value = recipe.ingredients;
        document.getElementById("recipe-description").value = recipe.description;
        editingIndex = index;
        openPopup();
    };

    window.deleteRecipe = async function (index) {
        index = Number(index);
        try {
            const recipeId = recipes[index].id;
            await db.collection("users").doc(userId).collection("recipes").doc(recipeId).delete();
            recipes.splice(index, 1);
            updateRecipeList();
        } catch (error) {
            console.error("❌ Error deleting recipe:", error);
        }
    };


    function clearInputs() {
        document.getElementById("recipe-name").value = "";
        document.getElementById("recipe-ingredients").value = "";
        document.getElementById("recipe-description").value = "";
    }
});