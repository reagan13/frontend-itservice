// Function to fetch products
async function fetchProducts() {
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

		const products = await response.json();
		renderProducts(products);
	} catch (error) {
		console.error("Error:", error);
		alert(error.message);
	}
}

// Render Products Function
function renderProducts(products) {
	const productsGrid = document.getElementById("productsGrid");
	productsGrid.innerHTML = ""; // Clear existing products

	products.forEach((product) => {
		const productCard = document.createElement("div");
		productCard.className = "bg-white shadow-md rounded-lg overflow-hidden";
		productCard.innerHTML = `
<img 
    src="${product.image || "../PICTURES/no-image.jpg"}" 
    onerror="this.onerror=null; this.src='/PICTURES/no-image.jpg'"
    alt="${product.name}" 
    class="w-full h-48 object-cover"
/>
                    <div class="p-4 flex flex-col gap-2">
                        <h3 class="font-bold text-lg">${product.name}</h3>
                        <p class="text-gray-500">${product.category}</p>
                        <p class=" font-bold">₱${product.price}</p>
                        <div class="flex justify-between mt-4">
                            <button 
							
                                onclick="editProduct(${product.id})"
                                class="bg-blue-500 text-white px-3 py-1 rounded"
                            >
                                Edit
                            </button>
                            <button 
                                onclick="deleteProduct(${product.id})"
                                class="bg-red-500 text-white px-3 py-1 rounded"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                `;
		productsGrid.appendChild(productCard);
	});
}

async function deleteProduct(productId) {
	// Simple confirmation dialog
	if (!confirm("Are you sure you want to delete this product?")) {
		return; // Exit if user cancels
	}

	try {
		const response = await fetch(`${url}/api/products/delete/${productId}`, {
			method: "PUT", // Using soft delete method
		});

		// Check if response is not ok
		if (!response.ok) {
			throw new Error("Failed to delete product");
		}

		// Parse response
		const result = await response.json();

		// Refresh product list
		await fetchProducts();

		// Show success alert
		alert("Product deleted successfully");
	} catch (error) {
		// Show error alert
		console.error("Delete Product Error:", error);
		alert("Failed to delete product");
	}
}
const url =
	window.location.hostname === "localhost" ||
	window.location.hostname === "127.0.0.1"
		? "http://localhost:3000"
		: "https://backend-itservice.onrender.com";

// Show Add Product Modal
function showAddProductModal() {
	openModal("addProductModal");
}
// Show Edit Product Modal
function showEditProductModal() {
	openModal("editProductModal");
}
// Edit Product Function
function editProduct(productId) {
	// Open the edit modal and populate with product data
	openEditModal(productId);
}

// Utility Functions for Modals
function openModal(modalId) {
	document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
	document.getElementById(modalId).classList.add("hidden");
	// Reset form when closing
	if (modalId === "addProductModal") {
		document.getElementById("addProductForm").reset();
	} else if (modalId === "editProductModal") {
		document.getElementById("editProductForm").reset();
	}
}

// Add Product Handler
async function handleAddProduct(event) {
	event.preventDefault();

	// Gather form data
	const productData = {
		name: document.getElementById("addProductName").value,
		category: document.getElementById("addProductCategory").value,
		description: document.getElementById("addProductDescription").value,
		fullDescription: document.getElementById("addProductFullDescription").value,
		price: parseFloat(document.getElementById("addProductPrice").value),
		image: document.getElementById("addProductImage").value,
	};

	// Validate inputs
	if (!validateProductData(productData)) return;

	try {
		const response = await fetch(`${url}/api/products/add`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(productData),
		});
		// Try to get response text for more information
		const responseText = await response.text();
		console.log("Response text:", responseText);
		if (!response.ok) {
			alert("Failed to add product");
			throw new Error("Failed to add product");
		}

		const newProduct = JSON.parse(responseText);
		alert("Product added successfully");
		// Refresh product list
		fetchProducts();

		// Close modal
		closeModal("addProductModal");
	} catch (error) {
		console.error("Error:", error);
		alert(error.message);
	}
}

// Edit Product Handler
async function handleEditProduct(event) {
	event.preventDefault();

	// Gather form data
	const productData = {
		id: document.getElementById("editProductId").value,
		name: document.getElementById("editProductName").value,
		category: document.getElementById("editProductCategory").value,
		description: document.getElementById("editProductDescription").value,
		fullDescription: document.getElementById("editProductFullDescription")
			.value,
		price: parseFloat(document.getElementById("editProductPrice").value),
		image: document.getElementById("editProductImage").value,
	};

	// Validate inputs
	if (!validateProductData(productData)) return;

	try {
		const response = await fetch(
			`${url}/api/products/update/${productData.id}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(productData),
			}
		);

		if (!response.ok) {
			throw new Error("Failed to update product");
		}

		const updatedProduct = await response.json();

		alert("Product updated successfully");
		// Refresh product list
		fetchProducts();

		// Close modal
		closeModal("editProductModal");
	} catch (error) {
		console.error("Error:", error);
		alert(error.message);
	}
}

// Product Data Validation
function validateProductData(productData) {
	// Validate each field
	const validations = [
		{ field: "name", message: "Please enter a product name" },
		{ field: "category", message: "Please select a category" },
		{ field: "description", message: "Please enter a short description" },
		{ field: "fullDescription", message: "Please enter a full description" },
		{ field: "image", message: "Please enter an image URL" },
	];

	for (let validation of validations) {
		if (
			!productData[validation.field] ||
			productData[validation.field] === ""
		) {
			alert(validation.message);
			return false;
		}
	}

	// Validate price
	if (productData.price <= 0) {
		alert("Please enter a valid price");
		return false;
	}

	return true;
}

// Open Edit Modal and Populate Data
async function openEditModal(productId) {
	try {
		// Fetch product details
		const response = await fetch(`${url}/api/products/${productId}`);

		if (!response.ok) {
			throw new Error("Failed to fetch product details");
		}

		const product = await response.json();
		console.log("Product:", product.image);

		// Populate edit form
		document.getElementById("editProductId").value = product.id;
		document.getElementById("editProductName").value = product.name;
		document.getElementById("editProductCategory").value = product.category;
		document.getElementById("editProductDescription").value =
			product.description;
		document.getElementById("editProductFullDescription").value =
			product.fullDescription;
		document.getElementById("editProductPrice").value = product.price;
		document.getElementById("editProductImage").value = product.image;

		// Open modal
		openModal("editProductModal");
	} catch (error) {
		console.error("Error:", error);
		alert(error.message);
	}
}
// Search and Filter Function
// Updated Search and Filter Function
function filterProducts() {
	const searchInput = document.getElementById("searchInput");
	const categoryFilter = document.getElementById("categoryFilter");

	const searchTerm = searchInput.value.toLowerCase();
	const categoryTerm = categoryFilter.value.toLowerCase();

	fetch(
		window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
			? "http://localhost:3000/api/products"
			: "https://backend-itservice.onrender.com/api/products"
	)
		.then((response) => response.json())
		.then((products) => {
			const filteredProducts = products.filter(
				(product) =>
					// Search by name
					product.name.toLowerCase().includes(searchTerm) &&
					// Filter by category (if selected)
					(categoryTerm === "" ||
						product.category.toLowerCase() === categoryTerm)
			);

			renderProducts(filteredProducts);
		})
		.catch((error) => {
			console.error("Error:", error);
			alert("Failed to filter products");
		});
}

// // Logout Function
// function logout() {
// 	const confirmLogout = confirm("Are you sure you want to log out?");
// 	if (confirmLogout) {
// 		// Implement logout logic (e.g., clear token, redirect)
// 		window.location.href = "../auth/sign-in.html";
// 	}
// }

// Event Listeners
// Modify the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
	const searchInput = document.getElementById("searchInput");
	const categoryFilter = document.getElementById("categoryFilter");
	// const logoutBtn = document.getElementById("logoutBtn");

	// Populate categories before adding event listeners
	populateCategories();

	searchInput.addEventListener("input", filterProducts);
	categoryFilter.addEventListener("change", filterProducts);
	// logoutBtn.addEventListener("click", logout);

	// Add Product Form Submission
	const addProductForm = document.getElementById("addProductForm");
	if (addProductForm) {
		addProductForm.addEventListener("submit", handleAddProduct);
	}

	// Edit Product Form Submission
	const editProductForm = document.getElementById("editProductForm");
	if (editProductForm) {
		editProductForm.addEventListener("submit", handleEditProduct);
	}

	// Initial fetch of products
	fetchProducts();
});
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

		const products = await response.json();

		// Get unique categories
		const categories = [
			...new Set(products.map((product) => product.category)),
		];

		// Populate category filter dropdown
		const categoryFilter = document.getElementById("categoryFilter");

		// Clear existing options except the first "All Categories"
		categoryFilter.innerHTML = '<option value="">All Categories</option>';

		// Add categories dynamically
		categories.forEach((category) => {
			const option = document.createElement("option");
			option.value = category.toLowerCase();
			option.textContent = category;
			categoryFilter.appendChild(option);
		});
	} catch (error) {
		console.error("Error populating categories:", error);
	}
}
