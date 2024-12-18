document.addEventListener("DOMContentLoaded", () => {
	// Service Details
	const serviceDetails = {
		basicTechSupport: {
			title: "Basic Tech Support for Students",
			description:
				"Comprehensive device support to keep your academic technology running smoothly.",
			services: [
				{
					name: "Device Diagnostics",
					description: "Thorough check of laptop/tablet functionality",
					rate: "₱500 per diagnostic session",
				},
				{
					name: "Software Troubleshooting",
					description: "Resolve issues with academic software and tools",
					rate: "₱750 per session",
				},
				{
					name: "Emergency Repair",
					description: "Quick fixes for urgent tech problems",
					rate: "₱1,000 - ₱2,500 based on complexity",
				},
			],
		},
		peerMentorship: {
			title: "Student Peer Mentorship Program",
			description:
				"Connect with experienced tech peers for coding, career, and academic support.",
			services: [
				{
					name: "Code Review",
					description: "Professional review of programming assignments",
					rate: "₱300 per hour",
				},
				{
					name: "Tech Career Guidance",
					description: "One-on-one career path and skill development",
					rate: "₱500 per consultation",
				},
				{
					name: "Study Group Facilitation",
					description: "Organized tech and programming study sessions",
					rate: "₱200 per group session",
				},
				{
					name: "Portfolio Development",
					description: "Guidance on creating tech portfolios for internships",
					rate: "₱1,500 comprehensive package",
				},
			],
		},
		academicSupport: {
			title: "Academic Technology Support",
			description:
				"Technology-enhanced learning support for academic excellence.",
			services: [
				{
					name: "Software Training",
					description: "Workshops on academic and professional software",
					rate: "₱750 per specialized workshop",
				},
				{
					name: "Research Tool Guidance",
					description: "Support for academic research platforms and tools",
					rate: "₱500 per consultation",
				},
				{
					name: "Digital Learning Optimization",
					description: "Personalized tech setup for online learning",
					rate: "₱1,000 comprehensive setup",
				},
				{
					name: "Presentation Tech Support",
					description: "Technical assistance for academic presentations",
					rate: "₱300 per session",
				},
			],
		},
	};

	// Wait for DOM elements to be ready
	function waitForElement(selector) {
		return new Promise((resolve) => {
			const element = document.querySelector(selector);
			if (element) {
				resolve(element);
			} else {
				const observer = new MutationObserver(() => {
					const element = document.querySelector(selector);
					if (element) {
						observer.disconnect();
						resolve(element);
					}
				});

				observer.observe(document.body, {
					childList: true,
					subtree: true,
				});
			}
		});
	}

	// Modal Functionality
	async function initializeModalFunctionality() {
		try {
			const serviceModal = await waitForElement("#serviceModal");
			const modalContent = await waitForElement("#modalContent");
			const closeModalBtn = await waitForElement("#closeModal");
			const serviceButtons = document.querySelectorAll(".service-buttons");

			// Function to generate modal content
			function openServiceModal(serviceKey) {
				const service = serviceDetails[serviceKey];

				if (!service) {
					console.error(`Service ${serviceKey} not found`);
					return;
				}

				let servicesHTML = service.services
					.map(
						(serv, index) => `
                    <div class="w-full max-w-xl bg-white border border-gray-200 rounded-lg shadow-md p-6 space-y-6 transition-transform hover:scale-105">
                        <div class="flex items-center justify-between">
                            <h2 class="text-2xl font-bold text-gray-800">${serv.name}</h2>
                            <div class="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
                                ${serv.rate}
                            </div>
                        </div>
                        
                        <p class="text-gray-700 text-base leading-6">
                            ${serv.description}
                        </p>
                        
                        <button data-service-index="${index}" class="book-service-btn w-full bg-[#201e43] text-white py-3 rounded-lg text-base font-semibold hover:bg-blue-600 transition-colors">
                            Book Service
                        </button>
                    </div>
                `
					)
					.join("");

				modalContent.innerHTML = `
                <h2 class="text-3xl font-bold text-[#201e43] mb-4">${service.title}</h2>
                <p class="text-gray-600 mb-6">${service.description}</p>
                <div class="grid md:grid-cols-2 gap-4">
                    ${servicesHTML}
                </div>
            `;

				// Add event listeners to dynamically created book service buttons
				const bookServiceBtns =
					modalContent.querySelectorAll(".book-service-btn");
				bookServiceBtns.forEach((btn) => {
					btn.addEventListener("click", bookService);
				});

				serviceModal.classList.remove("hidden");
				serviceModal.classList.add("flex");
			}

			function bookService() {
				alert(`Service Booked!`);
				closeModal();
			}

			// Close modal functionality
			function closeModal() {
				serviceModal.classList.add("hidden");
				serviceModal.classList.remove("flex");
			}

			// Event Listeners
			if (closeModalBtn) {
				closeModalBtn.addEventListener("click", closeModal);
			}

			serviceModal.addEventListener("click", (e) => {
				if (e.target === serviceModal) {
					closeModal();
				}
			});

			// Service Buttons Event Listeners
			serviceButtons.forEach((button, index) => {
				button.addEventListener("click", () => {
					const serviceKeys = [
						"basicTechSupport",
						"peerMentorship",
						"academicSupport",
					];
					openServiceModal(serviceKeys[index]);
				});
			});
		} catch (error) {
			console.error("Error initializing modal functionality:", error);
		}
	}

	// Dynamically load HTML components
	async function loadComponents() {
		const components = [{ id: "navigationBar", path: "/components/nav.html" }];

		try {
			for (const component of components) {
				const response = await fetch(component.path);

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const html = await response.text();
				const container = document.getElementById(component.id);

				if (container) {
					container.innerHTML = html;
					executeInlineScripts(container);
				} else {
					console.error(`Container ${component.id} not found`);
				}
			}
		} catch (error) {
			console.error("Error loading components:", error);
		}
	}

	// Helper: Execute inline <script> tags of a loaded component
	function executeInlineScripts(element) {
		const scripts = element.querySelectorAll("script");
		scripts.forEach((script) => {
			const newScript = document.createElement("script");
			newScript.textContent = script.textContent;
			document.body.appendChild(newScript).remove();
		});
	}

	// Initialize everything
	async function init() {
		await loadComponents();
		await initializeModalFunctionality();
	}

	// Run initialization
	init();
});
