document.addEventListener("DOMContentLoaded", () => {
	const isLogin = localStorage.getItem("userId");
	if (isLogin) {
		alert("You are already logged in");
		window.location.href = "../user/home.html";
	}
	// Select elements using the correct selectors
	const signinForm = document.querySelector('form[method="post"]');
	const emailInput = document.querySelector('input[name="email"]');
	const passwordInput = document.querySelector('input[name="password"]');
	const submitButton = document.getElementById("submit");

	// Validate Email
	function validateEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	// Validate Form
	function validateForm() {
		let errors = [];

		// Validate Email
		if (!emailInput.value.trim()) {
			errors.push("Email is required");
		} else if (!validateEmail(emailInput.value.trim())) {
			errors.push("Please enter a valid email address");
		}

		// Validate Password
		if (!passwordInput.value) {
			errors.push("Password is required");
		}

		return errors;
	}

	// Handle Sign In
	async function handleSignIn(event) {
		event.preventDefault();
		console.log("Sign-in form submitted");

		// Validate form
		const validationErrors = validateForm();

		// If there are validation errors, show them
		if (validationErrors.length > 0) {
			showMessage(validationErrors[0], false);
			return;
		}

		// Disable submit button
		submitButton.disabled = true;
		submitButton.textContent = "Signing In...";

		try {
			// Prepare login data
			const loginData = {
				email: emailInput.value.trim(),
				password: passwordInput.value,
			};
			const url =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1"
					? "http://localhost:3000/api/signin"
					: "https://backend-itservice.onrender.com/api/signin";

			// Send login request
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(loginData),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Sign-in failed");
			}

			// Store user information in localStorage
			localStorage.setItem("userId", data.userId);
			localStorage.setItem("userEmail", data.email);
			localStorage.setItem("userName", `${data.firstName} ${data.lastName}`);

			// Optional: Store additional user details if needed
			localStorage.setItem("userRole", data.role);

			// Successful sign-in
			alert("Sign-in successful");
			window.location.href = "../user/home.html";
		} catch (error) {
			console.error("Sign-in error:", error);

			// Show error message
			alert("Sign-in failed. Please check your email and password.");
		} finally {
			// Re-enable submit button
			submitButton.disabled = false;
			submitButton.textContent = "Sign In";
		}
	}

	// Add event listeners
	signinForm.addEventListener("submit", handleSignIn);

	// Optional: Add enter key support
	emailInput.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			passwordInput.focus();
		}
	});

	passwordInput.addEventListener("keypress", (event) => {
		if (event.key === "Enter") {
			event.preventDefault();
			signinForm.dispatchEvent(new Event("submit"));
		}
	});

	// Optional: Password visibility toggle
	const passwordToggle = document.createElement("button");
	passwordToggle.innerHTML = "👁️";
	passwordToggle.type = "button";
	passwordToggle.style.position = "absolute";
	passwordToggle.style.right = "10px";
	passwordToggle.style.top = "50%";
	passwordToggle.style.transform = "translateY(-50%)";
	passwordToggle.style.background = "none";
	passwordToggle.style.border = "none";
	passwordToggle.style.cursor = "pointer";

	// Wrap password input in a relative positioned container
	const passwordWrapper = document.createElement("div");
	passwordWrapper.style.position = "relative";
	passwordInput.parentNode.insertBefore(passwordWrapper, passwordInput);
	passwordWrapper.appendChild(passwordInput);
	passwordWrapper.appendChild(passwordToggle);

	passwordToggle.addEventListener("click", () => {
		if (passwordInput.type === "password") {
			passwordInput.type = "text";
			passwordToggle.innerHTML = "🙈";
		} else {
			passwordInput.type = "password";
			passwordToggle.innerHTML = "👁️";
		}
	});
});
