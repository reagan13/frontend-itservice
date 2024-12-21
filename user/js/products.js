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
// Update filterProducts function to work with select
function filterProducts() {
	// Get search term
	const searchTerm = searchInput.value.trim().toLowerCase();

	// Get selected category
	const categoryFilter = document.getElementById("categoryFilter");
	const selectedCategory = categoryFilter.value.toLowerCase();

	// If everything is reset, show all products
	if (searchTerm === "" && selectedCategory === "") {
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
			selectedCategory === "" ||
			product.category.toLowerCase() === selectedCategory;

		return matchesSearch && matchesCategory;
	});

	// Render results
	if (filteredProducts.length === 0) {
		productsGrid.innerHTML = `
            <div class="col-span-5 text-center py-10">
                <h2 class="text-2xl font-bold text-[#201e43] mb-4">
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

// Modify resetFilters to handle select reset
function resetFilters() {
	// Clear search input
	searchInput.value = "";

	// Reset category filter to default
	const categoryFilter = document.getElementById("categoryFilter");
	categoryFilter.selectedIndex = 0;

	// Render all products
	renderProducts(products);
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
		const url =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
				? "http://localhost:3000/api/products"
				: "https://backend-itservice.onrender.com/api/products";

		const response = await fetch(url, {
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
		alert("Failed to load products. Please try again later.");
		productsGrid.innerHTML = `
						<div class="col-span-5 text-center py-10">
							<h2 class="text-2xl font-bold text-gray-600 mb-4">
								Unable to Load Products
							</h2>
							
						</div>
					`;
		// <p class="text-gray-500">
		// 						${error.message}
		// 					</p>
		// 					<p class="text-red-500 mt-2">
		// 						Please check your backend connection and try again.
		// 					</p>
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
		alert("Please log in to add items to cart");
		// Redirect to login page
		window.location.href = "../../auth/sign-in.html";
		return;
	}

	const url =
		window.location.hostname === "localhost" ||
		window.location.hostname === "127.0.0.1"
			? "http://localhost:3000/api/cart"
			: "https://backend-itservice.onrender.com/api/cart";
	try {
		const response = await fetch(url, {
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

// Modify the Quick View Modal rendering to include Add to Cart functionality
function openQuickView(productId) {
	const product = products.find((p) => p.id === productId);
	const FALLBACK_IMAGE = "../../PICTURES/no-image.jpg";
	const imageUrl = product.image || FALLBACK_IMAGE;
	if (product) {
		modalContent.innerHTML = `
            <div class="flex flex-col md:flex-row h-full items-stretch">
                <img 
                    src="${imageUrl}" 
                    alt="${product.name}" 
                    class="w-full md:w-1/2 h-auto object-cover rounded-lg "
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
							<span class="text-2xl font-bold text-[#201e4]">
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
	const FALLBACK_IMAGE = "../../PICTURES/no-image.jpg";

	productsGrid.innerHTML = filteredProducts
		.map((product) => {
			const imageUrl = product.image ? `${product.image}` : FALLBACK_IMAGE;
			return `

				  <div class="bg-white rounded-lg shadow-md w-60 flex flex-col">
                     <img 
                        src="${imageUrl}"
                        alt="${product.name}" 
                        class="w-full h-48 object-contain "
						 onerror="
                                console.error('Image failed to load:', this.src); 
                                this.onerror=null; 
                                this.src='${FALLBACK_IMAGE}'
                            "
                    	>
                    <div class="p-4  flex flex-col gap-1  ">
                        <h3 class="text-lg font-semibold">${product.name}</h3>
                        <p class="text-gray-600 text-sm line-clamp-2 ">${
													product.description
												}</p>

                        <span class="text-xl font-bold text-[#201e4] ">₱${parseFloat(
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
		return false;
	}

	// Use confirm dialog
	const isConfirmed = confirm(`
Confirm Purchase:
Product: ${product.name}
Price: ₱${parseFloat(product.price).toFixed(2)}

Are you sure you want to purchase this item?
`);

	// If user cancels
	if (!isConfirmed) {
		alert("Purchase cancelled.");
		return false;
	}

	try {
		// Get user ID from localStorage
		const userId = localStorage.getItem("userId");
		if (!userId) {
			alert("Please log in to make a purchase");
			return false;
		}

		// Prepare order data
		const orderData = {
			userId: parseInt(userId),
			productId: product.id,
			quantity: 1, // Default to 1, can be modified if you want to support quantity selection
		};
		const url =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
				? "http://localhost:3000/api/single-order"
				: "https://backend-itservice.onrender.com/api/single-order";

		// Send order to backend
		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(orderData),
		});

		// Check response
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Order creation failed: ${response.status} ${errorText}`);
		}

		// Process successful order
		const orderConfirmation = await response.json();

		console.log("Order created successfully:", orderConfirmation);

		// Show success message
		alert(`Purchase successful! Order ID: ${orderConfirmation.id}`);

		// Redirect to order confirmation page
		window.location.href = `order-confirmation.html?orderId=${orderConfirmation.id}`;

		return true;
	} catch (error) {
		console.error("Buy Now Error:", error);

		// Show error to user
		alert(`Purchase failed: ${error.message}`);

		return false;
	}
}
// Initialize the application
// Modify init function
function init() {
	fetchProducts()
		.then(() => {
			populateCategories();
			setupFilterListeners();
		})
		.catch((error) => {
			console.error("Initialization error:", error);
		});
}

// Call init when the page loads
document.addEventListener("DOMContentLoaded", init);

// Function to fetch and populate categories
async function populateCategories() {
	try {
		const url =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
				? "http://localhost:3000/api/products"
				: "https://backend-itservice.onrender.com/api/products";

		const response = await fetch(url);

		if (!response.ok) {
			throw new Error("Failed to fetch products");
		}

		const rawProducts = await response.json();

		// Get unique categories
		const categories = [
			...new Set(rawProducts.map((product) => product.category)),
		];

		// Populate category select
		const categorySelect = document.getElementById("categoryFilter");

		// Clear existing options except the first "All Categories"
		categorySelect.innerHTML = '<option value="">All Categories</option>';

		// Add categories dynamically
		categories.forEach((category) => {
			const option = document.createElement("option");
			option.value = category.toLowerCase();
			option.textContent = category;
			categorySelect.appendChild(option);
		});

		// Add event listener for filtering
		categorySelect.addEventListener("change", filterProducts);
	} catch (error) {
		console.error("Error populating categories:", error);
	}
}
