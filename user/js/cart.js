class CartManager {
	constructor() {
		this.userId = null;
		this.cartItems = [];
	}

	async fetchCartDetails() {
		try {
			const storedUserId = localStorage.getItem("userId");
			if (!storedUserId) {
				console.error("No user ID found");
				alert("User not found. Please log in again.");
				return [];
			}

			this.userId = storedUserId;
			const url =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1"
					? "http://localhost:3000/api"
					: "https://backend-itservice.onrender.com/api";

			const response = await fetch(`${url}/cart/${this.userId}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				const errorBody = await response.text();
				console.error("Error response:", errorBody);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			this.cartItems = data.cartItems || [];
			return this.cartItems;
		} catch (error) {
			console.error("Error fetching cart details:", error);
			alert("Failed to load cart items");
			return [];
		}
	}

	async renderCart() {
		try {
			const cartItems = await this.fetchCartDetails();
			const cartContainer = document.querySelector("#cartItemsContainer");

			if (!cartContainer) {
				console.error("Cart container not found");
				return;
			}

			cartContainer.innerHTML = "";

			if (cartItems.length === 0) {
				cartContainer.innerHTML = `
                    <div class="text-center text-gray-500 py-10">
                        <p class="text-xl">Your cart is empty</p>
                        <a href="products.html" class="text-blue-600 hover:underline mt-4 inline-block">
                            Continue Shopping
                        </a>
                    </div>
                `;
				this.updateTotals(0, 0);

				// Optional: You can explicitly hide the order summary element
				const orderSummaryContainer = document.getElementById(
					"orderSummaryContainer"
				);
				if (orderSummaryContainer) {
					orderSummaryContainer.classList.add("hidden");
				}
				return;
			}

			// Group cart items by product
			const groupedItems = this.groupCartItems(cartItems);

			// Render grouped items
			groupedItems.forEach((groupedItem) => {
				try {
					const cartItemElement =
						this.createGroupedCartItemElement(groupedItem);
					cartContainer.appendChild(cartItemElement);
				} catch (itemError) {
					console.error("Error rendering cart item:", itemError, groupedItem);
				}
			});

			const totalQuantity = groupedItems.reduce(
				(total, item) => total + item.totalQuantity,
				0
			);
			const totalValue = groupedItems.reduce(
				(total, item) => total + (Number(item.price) || 0) * item.totalQuantity,
				0
			);

			this.updateTotals(totalQuantity, totalValue);
			this.attachCartEventListeners();
		} catch (error) {
			console.error("Error rendering cart:", error);
			const cartContainer = document.querySelector("#cartItemsContainer");
			if (cartContainer) {
				cartContainer.innerHTML = `
                    <div class="text-center text-red-500 py-10">
                        <p>Failed to load cart. Please try again later.</p>
                    </div>
                `;
			}
		}
	}

	groupCartItems(cartItems) {
		const groupedItems = {};

		cartItems.forEach((item) => {
			const key = item.product_id;
			if (!groupedItems[key]) {
				groupedItems[key] = {
					...item,
					totalQuantity: item.quantity,
					orders: [item],
				};
			} else {
				groupedItems[key].totalQuantity += item.quantity;
				groupedItems[key].orders.push(item);
			}
		});

		return Object.values(groupedItems);
	}
	createGroupedCartItemElement(groupedItem) {
		const price = Number(groupedItem.price || 0);
		const totalQuantity = Number(groupedItem.totalQuantity || 0);
		const productId = groupedItem.product_id || "unknown";
		const name = groupedItem.name || "Unnamed Product";

		const FALLBACK_IMAGE = "../../PICTURES/no-image.jpg";
		const imageUrl = groupedItem.image || FALLBACK_IMAGE;

		const itemElement = document.createElement("div");
		itemElement.classList.add(
			"flex",
			"items-center",
			"bg-white",
			"p-4",
			"rounded-lg",
			"shadow-md",
			"mb-4"
		);

		// Calculate subtotal
		const subtotal = price * totalQuantity;

		// Create orders list
		const ordersListHTML = groupedItem.orders
			.map(
				(order) => `
            
        `
			)
			.join("");

		itemElement.innerHTML = `
    <div class="flex flex-col sm:flex-row items-center w-full">
        <img 
            src="${imageUrl}" 
            alt="${name}" 
            class="w-24 h-24 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4"
            onerror="
                                console.error('Image failed to load:', this.src); 
                                this.onerror=null; 
                                this.src='${FALLBACK_IMAGE}'
                            "
        >
        <div class="flex-grow w-full">
            <div class="flex flex-col sm:flex-row justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">${name}</h3>
                <p class="text-gray-600">Price: ₱${price.toFixed(2)}</p>
            </div>
            
            <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div class="flex items-center space-x-2">
                    <button 
                        class="decrease-quantity bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors" 
                        data-product-id="${productId}"
                    >
                        -
                    </button>
                    <input 
                        type="text" 
                        value="${totalQuantity}" 
                        readonly 
                        class="w-16 text-center border border-gray-300 rounded-md py-1 quantity-input bg-gray-100 cursor-not-allowed"
                        data-product-id="${productId}"
                    >
                    <button 
                        class="increase-quantity bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors" 
                        data-product-id="${productId}"
                    >
                        +
                    </button>
                </div>
                
                <div class="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-4">
                    <p class="text-sm text-gray-600">
                        Total Quantity: <span class="total-quantity">${totalQuantity}</span>
                    </p>
                    <p class="font-bold text-blue-600 subtotal-display">
                        Subtotal: ₱${subtotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
        
        <button 
            class="remove-item text-red-500 hover:text-red-700 mt-2 sm:mt-0 sm:ml-4"
            data-product-id="${productId}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    </div>
`;

		return itemElement;
	}
	updateTotals(totalItems, totalValue) {
		try {
			const subtotalElement = document.querySelector("#subtotalDisplay");
			const taxElement = document.querySelector("#taxDisplay");
			const totalElement = document.querySelector("#totalDisplay");
			const cartItemCountElement = document.querySelector("#cart-item-count");

			if (subtotalElement) {
				subtotalElement.textContent = `₱${totalValue.toFixed(2)}`;
			}

			if (taxElement) {
				const tax = totalValue * 0.1;
				taxElement.textContent = `₱${tax.toFixed(2)}`;
			}

			if (totalElement) {
				const total = totalValue * 1.1;
				totalElement.textContent = `₱${total.toFixed(2)}`;
			}

			if (cartItemCountElement) {
				cartItemCountElement.textContent = totalItems.toString();
			}
		} catch (error) {
			console.error("Error updating totals:", error);
		}
	}

	async updateCartItemQuantity(productId, quantity) {
		try {
			const response = await fetch(
				`${this.apiBaseUrl}/cart/${this.userId}/update`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ productId, quantity }),
				}
			);

			if (!response.ok) {
				const errorBody = await response.text();
				console.error("Error updating cart item:", errorBody);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			this.renderCart();
		} catch (error) {
			console.error("Error updating cart item quantity:", error);
		}
	}

	async removeCartItem(productId) {
		// Use native confirm dialog
		const confirmRemove = confirm(
			"Remove Item\n\nAre you sure you want to remove this item from your cart?"
		);
		const url =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
				? "http://localhost:3000/api"
				: "https://backend-itservice.onrender.com/api";

		if (confirmRemove) {
			try {
				const response = await fetch(`${url}/cart/remove`, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						userId: this.userId,
						productId,
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to remove item from cart");
				}

				const data = await response.json();

				// Use alert for success message
				alert(`Item removed from cart: ${data.message}`);
				window.location.reload();
				console.log("Item removed from cart:", data.message);

				// Optional: Refresh cart or update UI
				// this.updateCartDisplay();
			} catch (error) {
				alert("Failed to remove item from cart");
				console.error("Error removing item from cart:", error);
			}
		}
	}

	// In attachCartEventListeners method
	attachCartEventListeners() {
		// Existing code...

		const removeButtons = document.querySelectorAll(".remove-item");
		removeButtons.forEach((button) => {
			button.addEventListener("click", (e) => {
				// Find the closest button or parent element with the product ID
				const removeButton = e.target.closest("[data-product-id]");
				if (removeButton) {
					const productId = removeButton.dataset.productId;
					this.removeCartItem(productId);
				}
			});
		});
	}

	async proceedToCheckout() {
		try {
			const url =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1"
					? "http://localhost:3000/api"
					: "https://backend-itservice.onrender.com/api";

			// Fetch current cart items
			const cartResponse = await fetch(`${url}/cart/${this.userId}`);
			if (!cartResponse.ok) {
				throw new Error("Failed to fetch cart items");
			}
			const cartData = await cartResponse.json();

			// Validate cart
			if (cartData.cartItems.length === 0) {
				alert("Your cart is empty");
				// this.showErrorMessage("Your cart is empty");
				return;
			}

			// Prepare order data
			const orderData = {
				userId: this.userId,
				items: cartData.cartItems.map((item) => ({
					id: item.product_id,
					name: item.name,
					quantity: item.quantity,
					price: item.price,
				})),
				totalAmount: cartData.totalValue,
			};

			// Place order
			const orderResponse = await fetch(`${url}/orders/place`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(orderData),
			});

			if (!orderResponse.ok) {
				const errorData = await orderResponse.json();
				alert("Order placement failed");
				throw new Error(errorData.error || "Order placement failed");
			}

			const orderResult = await orderResponse.json();

			alert("Order placed successfully!");
			// Show success message and redirect
			// this.showSuccessMessage("Order placed successfully!");
			alert(`Order ID: ${orderResult.orderId}`);

			window.location.href = `order-confirmation.html?orderId=${orderResult.orderId}`;
		} catch (error) {
			console.error("Checkout Error:", error);
			alert("Failed to proceed to checkout");
			// this.showErrorMessage(error.message);
		}
	}

	createCartItemElement(item) {
		const price = Number(item.price || 0);
		const productId = item.product_id || "unknown";
		const name = item.name || "Unnamed Product";
		const FALLBACK_IMAGE = "../../PICTURES/no-image.jpg";
		const imageUrl = item.image ? `${item.image}` : FALLBACK_IMAGE;
		// Calculate total quantity for this product
		const totalQuantity = this.cartItems
			.filter((cartItem) => cartItem.product_id === productId)
			.reduce((total, cartItem) => total + cartItem.quantity, 0);

		const itemElement = document.createElement("div");
		itemElement.classList.add(
			"flex",
			"items-center",
			"bg-white",
			"p-4",
			"rounded-lg",
			"shadow-md",
			"mb-4"
		);

		// Calculate subtotal
		const subtotal = price * totalQuantity;

		itemElement.innerHTML = `
        <img 
            src="${imageUrl}" 
            alt="${name}" 
            class="w-24 h-24 object-cover rounded-md mr-4"
         
			 onerror="
                                console.error('Image failed to load:', this.src); 
                                this.onerror=null; 
                                this.src='${FALLBACK_IMAGE}'
                            "
        >
        <div class="flex-grow">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-lg font-semibold text-gray-800">${name}</h3>
                <p class="text-gray-600">Price: ₱${price.toFixed(2)}</p>
            </div>
            <div class="flex items-center space-x-2 mb-2">
                <button 
                    class="decrease-quantity bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors" 
                    data-product-id="${productId}"
                >
                    -
                </button>
                <input 
                    type="number" 
                    value="${totalQuantity}" 
                    min="1" 
                    max="10" 
                    class="w-16 text-center border border-gray-300 rounded-md py-1 quantity-input"
                    data-product-id="${productId}"
                >
                <button 
                    class="increase-quantity bg-gray-200 text-gray-700 px-2 py-1 rounded-md hover:bg-gray-300 transition-colors" 
                    data-product-id="${productId}"
                >
                    +
                </button>
            </div>
            <p class="text-sm text-gray-600 mb-2">
                Total Quantity in Cart: <span class="total-quantity">${totalQuantity}</span>
            </p>
            <p class="font-bold text-blue-600 subtotal-display">
                Subtotal: ₱${subtotal.toFixed(2)}
            </p>
        </div>
        <button 
            class="remove-item text-red-500 hover:text-red-700 ml-4"
            data-product-id="${productId}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
        </button>
    `;

		return itemElement;
	}
	async updateCartItemQuantity(productId, quantity) {
		try {
			const url =
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1"
					? "http://localhost:3000/api"
					: "https://backend-itservice.onrender.com/api";
			const response = await fetch(`${url}/cart/update-quantity`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId: this.userId,
					productId,
					quantity: parseInt(quantity, 10),
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(
					errorData.error || "Failed to update cart item quantity"
				);
			}

			const data = await response.json();
			console.log("Cart item quantity updated:", data.message);

			// Optionally, re-render the cart or update the UI
			await this.renderCart();
		} catch (error) {
			console.error("Error updating cart item quantity:", error);
			alert("Failed to update cart item quantity");
		}
	}

	// Updated attachCartEventListeners method
	attachCartEventListeners() {
		const decreaseButtons = document.querySelectorAll(".decrease-quantity");
		const increaseButtons = document.querySelectorAll(".increase-quantity");

		decreaseButtons.forEach((button) => {
			button.addEventListener("click", (e) => {
				const productId = e.target.dataset.productId;
				const input = document.querySelector(
					`input[data-product-id="${productId}"]`
				);

				// Ensure input value doesn't go below 1
				const currentQuantity = parseInt(input.value);
				if (currentQuantity > 1) {
					const newQuantity = currentQuantity - 1;

					// Update UI
					input.value = newQuantity;

					// Update subtotal display
					const priceElement = input
						.closest(".flex-grow")
						.querySelector('p[class*="text-gray-600"]');
					const price = parseFloat(
						priceElement.textContent.replace("Price: $", "")
					);
					const subtotalDisplay = input
						.closest(".flex-grow")
						.querySelector(".subtotal-display");

					const newSubtotal = price * newQuantity;
					subtotalDisplay.textContent = `Subtotal: ₱${newSubtotal.toFixed(2)}`;

					// Update backend
					this.updateCartItemQuantity(productId, newQuantity);
				}
			});
		});

		increaseButtons.forEach((button) => {
			button.addEventListener("click", (e) => {
				const productId = e.target.dataset.productId;
				const input = document.querySelector(
					`input[data-product-id="${productId}"]`
				);

				const totalQuantitySpan = input
					.closest(".flex-grow")
					.querySelector(".total-quantity");
				const totalQuantity = parseInt(totalQuantitySpan.textContent);

				const currentQuantity = parseInt(input.value);

				// Allow incrementing up to a maximum of 10 or the total quantity

				const newQuantity = currentQuantity + 1;

				// Update UI
				input.value = newQuantity;

				// Update subtotal display
				const priceElement = input
					.closest(".flex-grow")
					.querySelector('p[class*="text-gray-600"]');
				const price = parseFloat(
					priceElement.textContent.replace("Price: ₱", "")
				);
				const subtotalDisplay = input
					.closest(".flex-grow")
					.querySelector(".subtotal-display");

				const newSubtotal = price * newQuantity;
				subtotalDisplay.textContent = `Subtotal: ₱${newSubtotal.toFixed(2)}`;

				// Update backend
				this.updateCartItemQuantity(productId, newQuantity);
			});
		});

		// Remove item listeners (as in your previous code)
		const removeButtons = document.querySelectorAll(".remove-item");
		removeButtons.forEach((button) => {
			button.addEventListener("click", (e) => {
				const productId = e.target.closest(".remove-item").dataset.productId;
				this.removeCartItem(productId);
			});
		});
	}

	removeExistingEventListeners() {
		// Logic to remove existing event listeners if necessary
	}
}

// Initialize cart manager
document.addEventListener("DOMContentLoaded", () => {
	const checkoutButton = document.getElementById("checkoutButton");

	const cartManager = new CartManager();
	cartManager.renderCart();
	if (checkoutButton) {
		checkoutButton.addEventListener("click", (e) => {
			e.preventDefault();
			cartManager.proceedToCheckout();
		});
	}
});
