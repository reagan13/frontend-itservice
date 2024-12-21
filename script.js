document.addEventListener("DOMContentLoaded", function () {
	// Function to check authentication status
	function checkAuthentication() {
		// Get user ID from local storage
		const userId = localStorage.getItem("userId");

		// Define pages that don't require authentication
		const publicPages = [
			"auth/sign-in.html",
			"auth/sign-up.html",
			"index.html",
			"services.html",
			"about-us.html",
			"contact-us.html",
		];

		// Get current page path
		const currentPath = window.location.pathname;

		// Check if user is not authenticated
		if (!userId) {
			// If not on a public page, redirect to login
			if (!publicPages.some((page) => currentPath.includes(page))) {
				alert("You need to login to access this page");
				if (!currentPath.includes("auth/sign-in.html")) {
					window.location.href = "../auth/sign-in.html";
					return;
				}
			}
		}
	}

	// Logout function
	function logoutUser() {
		// Clear all authentication-related items from local storage
		localStorage.removeItem("userId");

		// Redirect to login page
		window.location.href = "/auth/sign-in.html";
	}

	// Function to handle login
	function handleLogin(userId, token, expiryTime) {
		localStorage.setItem("userId", userId);

		// Redirect to dashboard or home page
		window.location.href = "/dashboard.html";
	}

	// Attach logout functionality to logout buttons
	const logoutButtons = document.querySelectorAll(".logout-btn");
	logoutButtons.forEach((button) => {
		button.addEventListener("click", function (e) {
			e.preventDefault();
			logoutUser();
		});
	});

	// Run authentication check
	checkAuthentication();
});

// Improved login process with error handling
function handleLoginProcess(username, password) {
	fetch("/api/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: username,
			password: password,
		}),
	})
		.then((response) => {
			if (!response.ok) {
				throw new Error("Login failed");
			}
			return response.json();
		})
		.then((data) => {
			if (data.success) {
				// Calculate token expiry (e.g., 1 hour from now)
				const expiryTime = new Date().getTime() + 1 * 60 * 60 * 1000;

				// Call login handler with user details
				handleLogin(data.userId, data.token, expiryTime);
			} else {
				// Handle login failure
				console.error("Login failed:", data.message);
				// Optionally show error to user
				alert(data.message || "Login failed");
			}
		})
		.catch((error) => {
			console.error("Login error:", error);
			alert("An error occurred during login");
		});
}
