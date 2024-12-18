document.addEventListener("DOMContentLoaded", () => {
	const isLogin = localStorage.getItem("userId");
	if (isLogin) {
		alert("You are already logged in. Please Log out to sign up");
		window.location.href = "../user/home.html";
	}

	const signupForm = document.getElementById("signUpForm");
	const firstNameInput = signupForm.querySelector('input[name="first_name"]');
	const lastNameInput = signupForm.querySelector('input[name="last_name"]');
	const emailInput = signupForm.querySelector('input[name="email"]');
	const passwordInput = signupForm.querySelector('input[name="password"]');
	const confirmPasswordInput = signupForm.querySelector(
		'input[name="confirm_password"]'
	);
	const submitButton = signupForm.querySelector('button[type="submit"]');

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
			alert(validationErrors[0]);
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

			const url =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1"
					? "http://localhost:3000/api/signup"
					: "https://backend-itservice.onrender.com/api/signup";

			// Send signup request
			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			// Log the full response for debugging
			console.log("Response status:", response.status);

			// Try to parse response body
			let data;
			try {
				data = await response.json();
				console.log("Response data:", data);
			} catch (parseError) {
				console.error("Failed to parse response:", parseError);
				const responseText = await response.text();
				console.log("Response text:", responseText);
			}

			// Check response status
			if (!response.ok) {
				// Throw error with more detailed message
				throw new Error(
					data?.error ||
						data?.message ||
						`Signup failed with status ${response.status}`
				);
			}

			// Success handling
			alert("Signup successful! Redirecting to login...");
			window.location.href = "sign-in.html";
		} catch (error) {
			// Detailed error logging
			console.error("Signup error details:", {
				message: error.message,
				name: error.name,
				stack: error.stack,
			});

			// User-friendly error message
			alert(error.message || "Signup failed! Please try again.");
		} finally {
			// Re-enable submit button
			submitButton.disabled = false;
			submitButton.textContent = "Submit";
		}
	}

	// Add event listener
	signupForm.addEventListener("submit", handleSignup);
});
