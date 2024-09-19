document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const loginBtn = document.getElementById("login-btn");
  const registerBtn = document.getElementById("register-btn");
  const updateBtn = document.getElementById("update-btn");
  const deleteBtn = document.getElementById("delete-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const notification = document.getElementById("notification");
  const allUsers = document.getElementById("all-users");
  const currentUser = document.getElementById("current-user");
  const colorTertiary = getComputedStyle(
    document.documentElement
  ).getPropertyValue("--color-tertiary");

  // Utility Functions
  function getBody() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    return { username, password };
  }

  //check if username and password are entered
  function checkIfUsernameAndPasswordAreEntered() {
    const { username, password } = getBody();
    if (!username || !password) {
      displayNotification("Username and password are required.", "red");
      return false;
    }
    return true;
  }

  // Clear input fields
  function clearInputFields() {
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
  }

  //clear current user
  function clearCurrentUser() {
    currentUser.innerText = "";
  }

  //Display current user
  function displayCurrentUser(data) {
    currentUser.innerText = data.username || "";
    currentUser.style.color = colorTertiary;
  }

  // Display notification
  function displayNotification(message, color = "green", duration = 3000) {
    notification.innerText = message;
    notification.style.backgroundColor = color;
    notification.style.display = "block";
    setTimeout(() => {
      notification.style.display = "none";
    }, duration);
  }

  //jump to website
  function jumpToWebsite(duration = 3000) {
    setTimeout(() => {
      window.location.href = "/website";
    }, duration);
  }

  // Fetch data from server
  async function fetchData(url, body = null, method = "POST") {
    try {
      const response = await fetch(`http://localhost:8080/users/${url}`, {
        method,
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Fetch error:", error);
      displayNotification(
        "Network or server error. Please try again later.",
        "red"
      );
      throw error; // Rethrow to let the calling function handle it
    }
  }

  //fetch all users
  async function fetchUsers() {
    try {
      const data = await fetchData("/users", null, "GET");
      allUsers.innerHTML = data.users.join(", ");
      allUsers.style.color = colorTertiary;
    } catch (error) {
      allUsers.innerText = "Error fetching users.";
    }
  }

  // Event Listeners
  // Log in user
  loginBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;

    try {
      const body = getBody();
      const data = await fetchData("/login", body);
      displayCurrentUser(data);
      displayNotification(
        "Login successful! Redirecting to the website in 3 seconds..."
      );
      jumpToWebsite();
    } catch (error) {
      clearCurrentUser();
      displayNotification(
        "Login failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Register new user
  registerBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;

    try {
      const body = getBody();
      const data = await fetchData("/register", body);

      displayNotification(data.message || "Registration successful!");
      clearInputFields();
      clearCurrentUser();
      fetchUsers();
    } catch (error) {
      displayNotification(
        "Registration failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Update user
  updateBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;
    const currentUsername = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const newUsername = prompt("Enter new username:") || "";
    const newPassword = prompt("Enter new password:") || "";

    if (!newUsername && !newPassword) {
      displayNotification("No new username or password entered.", "red");
      return;
    }

    try {
      const body = { password, newUsername, newPassword };
      const data = await fetchData(`/users/${currentUsername}`, body, "PUT");

      displayNotification(data.message || "User updated successfully!");
      clearInputFields();
      clearCurrentUser();
      fetchUsers();
    } catch (error) {
      displayNotification(
        "Update failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Delete user
  deleteBtn.addEventListener("click", async () => {
    if (!checkIfUsernameAndPasswordAreEntered()) return;

    const currentUsername = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const body = { password };
      const data = await fetchData(`/users/${currentUsername}`, body, "DELETE");
      displayNotification(data.message || "User deleted successfully!");
      clearInputFields();
      clearCurrentUser();
      fetchUsers();
    } catch (error) {
      displayNotification(
        "Delete failed: " + (error.message || "Unknown error"),
        "red"
      );
    }
  });

  // Initial fetch
  fetchUsers();

  logoutBtn.addEventListener("click", async function () {
    try {
      const response = await fetch("/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Logout was successful, redirect to the home or login page
        window.location.href = "/contact"; // or wherever you want to redirect after logout
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Error during logout. Please try again.");
    }
  });
});
