document.addEventListener("DOMContentLoaded", () => {
	const signinForm = document.querySelector(".Sign-In");
	const emailInput = signinForm.querySelector('input[type="email"]');
	const passwordInput = signinForm.querySelector('input[type="password"]');
	const submitButton = signinForm.querySelector(".signupsubmit");

	// Create Alert Div Function
	function createAlertDiv(message, isSuccess) {
		const alertDiv = document.createElement("div");
		alertDiv.style.position = "fixed";
		alertDiv.style.top = "20px";
		alertDiv.style.left = "50%";
		alertDiv.style.transform = "translateX(-50%)";
		alertDiv.style.padding = "15px";
		alertDiv.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336";
		alertDiv.style.color = "white";
		alertDiv.style.borderRadius = "5px";
		alertDiv.style.zIndex = "1000";
		alertDiv.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
		alertDiv.textContent = message;
		return alertDiv;
	}

	// Show Message Function
	function showMessage(message, isSuccess = false) {
		const alertDiv = createAlertDiv(message, isSuccess);
		document.body.appendChild(alertDiv);

		setTimeout(() => {
			document.body.removeChild(alertDiv);

			if (isSuccess) {
				// Redirect to user home page
				window.location.href = "/user/home.html";
			}
		}, 3000);
	}

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
			alert(loginData);
			// Send login request
			const response = await fetch("http://localhost:3000/api/signin", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(loginData),
			});
			alert(response);
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
			showMessage("Sign-in successful! Redirecting...", true);
		} catch (error) {
			console.error("Sign-in error:", error);

			// Show error message
			showMessage(error.message || "An error occurred during sign-in", false);
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
