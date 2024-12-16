document.querySelector(".Sign-Up").addEventListener("submit", function (event) {
	event.preventDefault(); // Prevent the default form submission

	// Get form values
	const firstname = document.querySelector('input[placeholder=""]').value;
	const lastname = document.querySelector('input[placeholder=""]').value;
	const email = document.querySelector('input[type="email"]').value;
	const password = document.querySelector('input[type="password"]').value;
	const confirmPassword = document.querySelectorAll('input[type="password"]')[1]
		.value;

	// Simple validation
	if (password !== confirmPassword) {
		alert("Passwords do not match!");
		return;
	}

	// Here you can add code to send the form data to your server

	// Redirect to member.html after successful registration
	window.location.href = "member.html";
});
