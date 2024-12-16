// DOM Elements (move to top to ensure they're defined early)
const productsGrid = document.getElementById("productsGrid");
const quickViewModal = document.getElementById("quickViewModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalContent = document.getElementById("modalContent");
const searchInput = document.getElementById("searchInput");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");

// Global variable to store products
let products = [];

// Open Quick View Modal

// Close Quick View Modal
function closeQuickView() {
	quickViewModal.classList.add("hidden");
}

// Event Listeners for Modal Closing
document.addEventListener("DOMContentLoaded", () => {
	// Close modal when close button is clicked
	if (closeModalBtn) {
		closeModalBtn.addEventListener("click", (event) => {
			event.stopPropagation(); // Prevent event from bubbling
			closeQuickView();
		});
	}

	// Close modal when clicking outside the modal content
	if (quickViewModal) {
		quickViewModal.addEventListener("click", (event) => {
			// Check if the click was on the modal overlay (not on the content)
			if (event.target === quickViewModal) {
				closeQuickView();
			}
		});
	}

	// Optional: Close modal with Escape key
	document.addEventListener("keydown", (event) => {
		if (
			event.key === "Escape" &&
			!quickViewModal.classList.contains("hidden")
		) {
			closeQuickView();
		}
	});
});

// Filter Products
function filterProducts() {
	// Get search term
	const searchTerm = searchInput.value.trim().toLowerCase();

	// Get selected categories
	const selectedCategories = Array.from(
		document.querySelectorAll('input[type="checkbox"]:checked')
	).map((cb) => cb.value);

	// Get price range
	const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
	const maxPrice =
		parseFloat(document.getElementById("maxPrice").value) || Infinity;

	// Get selected price range radio (if any)
	const selectedPriceRange = document.querySelector(
		'input[name="priceRange"]:checked'
	);

	// If everything is reset, show all products
	if (
		searchTerm === "" &&
		selectedCategories.length === 0 &&
		minPrice === 0 &&
		maxPrice === Infinity &&
		!selectedPriceRange
	) {
		renderProducts(products);
		return;
	}

	// Filter products
	const filteredProducts = products.filter((product) => {
		// Search filter
		const matchesSearch =
			searchTerm === "" ||
			product.name.toLowerCase().includes(searchTerm) ||
			product.description.toLowerCase().includes(searchTerm);

		// Category filter
		const matchesCategory =
			selectedCategories.length === 0 ||
			selectedCategories.includes(product.category);

		// Price filter
		const productPrice = parseFloat(product.price);
		let matchesPrice = true;

		// Check price range radio first
		if (selectedPriceRange) {
			switch (selectedPriceRange.value) {
				case "0-100":
					matchesPrice = productPrice >= 0 && productPrice <= 100;
					break;
				case "100-500":
					matchesPrice = productPrice >= 100 && productPrice <= 500;
					break;
				case "500-1000":
					matchesPrice = productPrice >= 500 && productPrice <= 1000;
					break;
				case "1000+":
					matchesPrice = productPrice > 1000;
					break;
			}
		} else {
			// If no radio selected, use min/max price inputs
			matchesPrice = productPrice >= minPrice && productPrice <= maxPrice;
		}

		return matchesSearch && matchesCategory && matchesPrice;
	});

	// Render results
	if (filteredProducts.length === 0) {
		productsGrid.innerHTML = `
            <div class="col-span-5 text-center py-10">
                <h2 class="text-2xl font-bold text-gray-600 mb-4">
                    No Products Found
                </h2>
                <p class="text-gray-500">
                    Try adjusting your search or filter criteria.
                </p>
            </div>
        `;
	} else {
		renderProducts(filteredProducts);
	}
}

// Setup Filter Listeners
function setupFilterListeners() {
	// Checkbox category filters
	const categoryCheckboxes = document.querySelectorAll(
		'input[type="checkbox"]'
	);
	categoryCheckboxes.forEach((checkbox) => {
		checkbox.addEventListener("change", filterProducts);
	});

	// Price range radio buttons
	const priceRangeInputs = document.querySelectorAll(
		'input[name="priceRange"]'
	);
	priceRangeInputs.forEach((input) => {
		input.addEventListener("change", (e) => {
			// Clear min and max price inputs when radio is selected
			document.getElementById("minPrice").value = "";
			document.getElementById("maxPrice").value = "";

			filterProducts();
		});
	});

	// Price input fields
	const priceInputs = document.querySelectorAll("#minPrice, #maxPrice");
	priceInputs.forEach((input) => {
		input.addEventListener("input", () => {
			// Uncheck price range radio buttons when manually inputting
			const priceRangeInputs = document.querySelectorAll(
				'input[name="priceRange"]'
			);
			priceRangeInputs.forEach((radio) => (radio.checked = false));
			filterProducts();
		});
	});

	// Search input
	searchInput.addEventListener("input", filterProducts);
}

// Reset Filters Function
function resetFilters() {
	// Clear search input
	searchInput.value = "";

	// Uncheck all category checkboxes
	document.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
		cb.checked = false;
	});

	// Uncheck all price range radios
	document.querySelectorAll('input[name="priceRange"]').forEach((radio) => {
		radio.checked = false;
	});

	// Reset price inputs
	document.getElementById("minPrice").value = "";
	document.getElementById("maxPrice").value = "";

	// Render all products
	renderProducts(products);
}

// Optional: Add a reset button to your HTML
// <button onclick="resetFilters()" class="bg-gray-200 text-gray-700 px-4 py-2 rounded">Reset Filters</button>

// Fetch Products from Backend
async function fetchProducts() {
	try {
		const response = await fetch("http://localhost:3000/api/products", {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			const errorBody = await response.text();
			console.error("Server response:", errorBody);
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const rawProducts = await response.json();
		products = rawProducts
			.map((product) => {
				try {
					return {
						...product,
						specs:
							typeof product.specs === "string"
								? JSON.parse(product.specs)
								: product.specs,
						price: parseFloat(product.price),
					};
				} catch (parseError) {
					console.error("Error parsing product:", product, parseError);
					return null;
				}
			})
			.filter((product) => product !== null);

		if (products.length === 0) {
			throw new Error("No products found");
		}

		renderProducts();
	} catch (error) {
		console.error("Fetch error:", error);
		productsGrid.innerHTML = `
						<div class="col-span-5 text-center py-10">
							<h2 class="text-2xl font-bold text-gray-600 mb-4">
								Unable to Load Products
							</h2>
							<p class="text-gray-500">
								${error.message}
							</p>
							<p class="text-red-500 mt-2">
								Please check your backend connection and try again.
							</p>
						</div>
					`;
	}
}
// Function to add product to cart
async function addToCart(productId, quantity = 1) {
	// Ensure quantity is parsed as an integer
	quantity = parseInt(quantity, 10);

	// Check if user is logged in (assuming you store user info in localStorage)
	const userId = localStorage.getItem("userId");

	if (!userId) {
		// Show login prompt
		showCartMessage("Please log in to add items to cart", false);
		return;
	}

	try {
		const response = await fetch("http://localhost:3000/api/cart", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				user_id: userId,
				product_id: productId,
				quantity: quantity,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			alert(data.error || "Failed to add product to cart");
			throw new Error(data.error || "Failed to add product to cart");
		}

		// Show success message
		// showCartMessage(data.message, true);
		alert("Product added to cart successfully!");
		location.reload(); // Reload the page to reflect changes
	} catch (error) {
		alert("Failed to add product to cart");
		console.error("Add to Cart Error:", error);
		// showCartMessage(error.message, false);
	}
}

// Create a message display function
function showCartMessage(message, isSuccess) {
	// Create message element
	const messageDiv = document.createElement("div");
	messageDiv.style.position = "fixed";
	messageDiv.style.top = "20px";
	messageDiv.style.left = "50%";
	messageDiv.style.transform = "translateX(-50%)";
	messageDiv.style.padding = "15px";
	messageDiv.style.backgroundColor = isSuccess ? "#4CAF50" : "#f44336";
	messageDiv.style.color = "white";
	messageDiv.style.borderRadius = "5px";
	messageDiv.style.zIndex = "1000";
	messageDiv.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
	messageDiv.textContent = message;

	// Add to body
	document.body.appendChild(messageDiv);

	// Remove after 3 seconds
	setTimeout(() => {
		document.body.removeChild(messageDiv);
	}, 3000);
}

// Modify the Quick View Modal rendering to include Add to Cart functionality
function openQuickView(productId) {
	const product = products.find((p) => p.id === productId);
	const FALLBACK_IMAGE = "/PICTURES/no-image.jpg";
	const imageUrl = product.image || FALLBACK_IMAGE;
	if (product) {
		modalContent.innerHTML = `
            <div class="flex flex-col md:flex-row h-full items-stretch">
                <img 
                    src="${imageUrl}" 
                    alt="${product.name}" 
                    class="w-full md:w-1/2 h-auto object-cover rounded-lg border border-black"
					 onerror="
                                console.error('Image failed to load:', this.src); 
                                this.onerror=null; 
                                this.src='${FALLBACK_IMAGE}'
                            "
                >
                <div class="pl-4 md:pl-6 w-full md:w-1/2">
                    <h2 class="text-2xl font-bold mb-4">${product.name}</h2>
                    <p class="text-gray-600 mb-4">${product.fullDescription}</p>
                    
                   
                    
                    <div class="flex flex-col md:flex-row justify-between items-center mt-6">
                        <span class="text-2xl font-bold text-blue-600">
                            ₱${parseFloat(product.price).toFixed(2)}
                        </span>
                        <div class="flex items-center space-x-2 mt-2 md:mt-0">
                            <input 
                                type="number" 
                                min="1" 
                                value="1" 
                                id="quantityInput" 
                                class="w-16 px-2 py-1 border rounded"
                            >
                            <button 
                                onclick="addToCart(${
																	product.id
																}, document.getElementById('quantityInput').value)" 
                                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

		quickViewModal.classList.remove("hidden");
	}
}

function renderProducts(filteredProducts = products) {
	if (!productsGrid) {
		console.error("Products grid element not found");
		return;
	}
	const FALLBACK_IMAGE = "/PICTURES/no-image.jpg";

	productsGrid.innerHTML = filteredProducts
		.map((product) => {
			const imageUrl = product.image ? `${product.image}` : FALLBACK_IMAGE;
			return `

				  <div class="bg-white rounded-lg shadow-md border border-black w-60 flex flex-col">
                     <img 
                        src="${imageUrl}"
                        alt="${product.name}" 
                        class="w-full h-48 object-contain border border-blue-500"
						 onerror="
                                console.error('Image failed to load:', this.src); 
                                this.onerror=null; 
                                this.src='${FALLBACK_IMAGE}'
                            "
                    	>
                    <div class="p-4 border border-red-500 flex flex-col gap-1  ">
                        <h3 class="text-lg font-semibold">${product.name}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 ">${
													product.description
												}</p>

                        <span class="text-xl font-bold text-blue-600 ">₱${parseFloat(
													product.price
												).toFixed(2)}</span>
                        <div class="flex justify-between ">
                            <button 
                                onclick="openQuickView(${product.id})" 
                                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                View
                            </button>
                            <button 
                                onclick="buyNow(${product.id})" 
                                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Buy Now
                            </button>
                        </div>
                        
                    </div>
                </div>`;
		})
		.join("");
}

async function buyNow(productId) {
	// Find the product
	const product = products.find((p) => p.id === productId);
	if (!product) {
		alert("Product not found");
		return;
	}

	// Create confirmation modal
	const confirmationModal = document.createElement("div");
	confirmationModal.innerHTML = `
        <div id="confirmationOverlay" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 class="text-2xl font-bold mb-4">Confirm Purchase</h2>
                <div class="flex items-center mb-4">
                    <img 
                        src="${product.image}" 
                        alt="${product.name}" 
                        class="w-24 h-24 object-cover rounded-md mr-4"
                    >
                    <div>
                        <h3 class="text-lg font-semibold">${product.name}</h3>
                        <p class="text-gray-600">Price: $${parseFloat(
													product.price
												).toFixed(2)}</p>
                    </div>
                </div>
                <p class="mb-4 text-gray-700">Are you sure you want to purchase this item?</p>
                <div class="flex justify-between">
                    <button id="cancelPurchase" class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
                        Cancel
                    </button>
                    <button id="confirmPurchase" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                        Confirm Purchase
                    </button>
                </div>
            </div>
        </div>
    `;

	// Append modal to body
	document.body.appendChild(confirmationModal);

	// Get modal elements
	const overlay = document.getElementById("confirmationOverlay");
	const cancelButton = document.getElementById("cancelPurchase");
	const confirmButton = document.getElementById("confirmPurchase");

	// Create a promise to handle user's choice
	const userChoice = new Promise((resolve, reject) => {
		// Cancel button handler
		cancelButton.addEventListener("click", () => {
			overlay.remove();
			resolve(false);
		});

		// Confirm button handler
		confirmButton.addEventListener("click", async () => {
			// Disable confirm button to prevent multiple clicks
			confirmButton.disabled = true;
			confirmButton.textContent = "Processing...";

			try {
				// Get user ID from localStorage
				const userId = localStorage.getItem("userId");
				if (!userId) {
					throw new Error("User not logged in");
				}

				// Prepare order data
				const orderData = {
					userId: parseInt(userId),
					productId: product.id,
					quantity: 1, // Default to 1, can be modified if you want to support quantity selection
				};

				// Send order to backend
				const response = await fetch("http://localhost:3000/api/single-order", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(orderData),
				});

				// Check response
				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(
						`Order creation failed: ${response.status} ${errorText}`
					);
				}

				// Process successful order
				const orderConfirmation = await response.json();
				console.log("Order created successfully:", orderConfirmation);

				// Remove overlay
				overlay.remove();

				// Redirect to order confirmation page
				window.location.href = `order-confirmation.html?orderId=${orderConfirmation.id}`;

				resolve(true);
			} catch (error) {
				console.error("Buy Now Error:", error);

				// Show error in modal
				const errorDiv = document.createElement("div");
				errorDiv.className = "text-red-500 mt-4 text-center";
				errorDiv.textContent = `Error: ${error.message}`;
				overlay.querySelector(".bg-white").appendChild(errorDiv);

				// Re-enable confirm button
				confirmButton.disabled = false;
				confirmButton.textContent = "Confirm Purchase";

				resolve(false);
			}
		});

		// Allow closing modal by clicking outside
		overlay.addEventListener("click", (e) => {
			if (e.target === overlay) {
				overlay.remove();
				resolve(false);
			}
		});
	});

	// Wait for user's choice
	return userChoice;
}
// Initialize the application
function init() {
	fetchProducts()
		.then(() => {
			setupFilterListeners();
		})
		.catch((error) => {
			console.error("Initialization error:", error);
		});
}

// Call init when the page loads
document.addEventListener("DOMContentLoaded", init);
