document.addEventListener("DOMContentLoaded", () => {
	const signupForm = document.querySelector(".Sign-Up");
	const firstNameInput = signupForm.querySelector('input[name="first_name"]');
	const lastNameInput = signupForm.querySelector('input[name="last_name"]');
	const emailInput = signupForm.querySelector('input[name="email"]');
	const passwordInput = signupForm.querySelector('input[name="password"]');
	const confirmPasswordInput = signupForm.querySelector(
		'input[name="confirm_password"]'
	);
	const submitButton = signupForm.querySelector(".signupsubmit");

	// Validation Functions
	function validateEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	function validatePassword(password) {
		// At least 8 characters, one uppercase, one lowercase, one number
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
		return passwordRegex.test(password);
	}

	// Create Alert Div
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

	// Show Error/Success Message
	function showMessage(message, isSuccess = false) {
		const alertDiv = createAlertDiv(message, isSuccess);
		document.body.appendChild(alertDiv);

		setTimeout(() => {
			document.body.removeChild(alertDiv);

			if (isSuccess) {
				window.location.href = "sign-in.html";
			}
		}, 3000);
	}

	// Validate Form
	function validateForm() {
		let errors = [];

		// Validate First Name
		if (firstNameInput.value.trim() === "") {
			errors.push("First name is required");
		}

		// Validate Last Name
		if (lastNameInput.value.trim() === "") {
			errors.push("Last name is required");
		}

		// Validate Email
		if (!validateEmail(emailInput.value.trim())) {
			errors.push("Please enter a valid email address");
		}

		// Validate Password
		if (!validatePassword(passwordInput.value)) {
			errors.push(
				"Password must be at least 8 characters long, contain uppercase, lowercase, and a number"
			);
		}

		// Validate Confirm Password
		if (passwordInput.value !== confirmPasswordInput.value) {
			errors.push("Passwords do not match");
		}

		return errors;
	}

	// Handle Form Submission
	async function handleSignup(event) {
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
		submitButton.textContent = "Signing Up...";

		try {
			// Prepare form data
			const formData = {
				first_name: firstNameInput.value.trim(),
				last_name: lastNameInput.value.trim(),
				email: emailInput.value.trim(),
				password: passwordInput.value,
				confirm_password: confirmPasswordInput.value,
			};

			// Send signup request
			const response = await fetch(
				"https://backend-itservices.onrender.com/api/signup",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(formData),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Signup failed");
			}

			// Successful signup
			showMessage("Signup successful! Redirecting to login...", true);
		} catch (error) {
			console.error("Signup error:", error);
			showMessage(error.message || "An error occurred during signup", false);
		} finally {
			// Re-enable submit button
			submitButton.disabled = false;
			submitButton.textContent = "Submit";
		}
	}

	// Add event listeners
	signupForm.addEventListener("submit", handleSignup);
});
