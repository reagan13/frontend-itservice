const products = [
	{
		id: 1,
		name: "Quantum X Pro Laptop",
		category: "Laptops",
		description:
			"Ultra-lightweight performance laptop with next-gen processing.",
		fullDescription:
			"Experience unparalleled performance with the Quantum X Pro. Featuring the latest 12th gen Intel processor, 16GB RAM, and a stunning 4K display, this laptop is designed for professionals and power users.",
		price: 1299.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-12700H",
			ram: "16GB DDR5",
			storage: "1TB NVMe SSD",
			display: '15.6" 4K OLED',
		},
	},
	{
		id: 2,
		name: "ZenBook 14 Ultra Slim",
		category: "Laptops",
		description: "Compact and powerful, designed for the modern professional.",
		fullDescription:
			"The ZenBook 14 is equipped with the latest Intel i5 processor, 8GB RAM, and a 14-inch Full HD display, making it perfect for both work and entertainment.",
		price: 899.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i5-1135G7",
			ram: "8GB",
			storage: "512GB SSD",
			display: '14" Full HD',
		},
	},
	{
		id: 3,
		name: "Razer Blade 15",
		category: "Laptops",
		description: "A powerful gaming laptop with a sleek design.",
		fullDescription:
			"The Razer Blade 15 comes with an Intel i7 processor, NVIDIA RTX 3060 GPU, and a 15.6-inch 144Hz display for smooth gaming and creative work.",
		price: 1799.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-11800H",
			ram: "16GB",
			storage: "1TB SSD",
			display: '15.6" Full HD 144Hz',
		},
	},
	{
		id: 4,
		name: "Apple MacBook Pro 16-inch",
		category: "Laptops",
		description:
			"High-performance laptop with advanced features for professionals.",
		fullDescription:
			"The MacBook Pro with Apple Silicon M1 Pro chip offers exceptional performance with a 16-inch Retina display, 16GB RAM, and a battery life that lasts all day.",
		price: 2399.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Apple M1 Pro Chip",
			ram: "16GB",
			storage: "512GB SSD",
			display: '16" Retina',
		},
	},
	{
		id: 5,
		name: "Dell XPS 13",
		category: "Laptops",
		description: "Premium ultrabook with exceptional performance and design.",
		fullDescription:
			"The Dell XPS 13 features the latest Intel i7 processor, 8GB RAM, and a 13.4-inch 4K display, offering both portability and power for any task.",
		price: 1399.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-1165G7",
			ram: "8GB",
			storage: "512GB SSD",
			display: '13.4" 4K',
		},
	},
	{
		id: 6,
		name: "HP Spectre x360",
		category: "Laptops",
		description:
			"Convertible laptop with a stunning 4K display and long battery life.",
		fullDescription:
			"The HP Spectre x360 is a versatile 2-in-1 laptop with a 13.3-inch 4K OLED touch display, Intel i7 processor, and up to 16GB of RAM.",
		price: 1599.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-1165G7",
			ram: "16GB",
			storage: "512GB SSD",
			display: '13.3" 4K OLED Touch',
		},
	},
	{
		id: 7,
		name: "Lenovo ThinkPad X1 Carbon",
		category: "Laptops",
		description: "Business laptop with a focus on portability and durability.",
		fullDescription:
			"The ThinkPad X1 Carbon is equipped with Intel Core i7 processors, 16GB RAM, and a 14-inch Full HD display, built to handle heavy workloads.",
		price: 1899.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-1165G7",
			ram: "16GB",
			storage: "512GB SSD",
			display: '14" Full HD',
		},
	},
	{
		id: 8,
		name: "Microsoft Surface Laptop 4",
		category: "Laptops",
		description:
			"Stylish laptop with excellent performance and high-resolution display.",
		fullDescription:
			"The Surface Laptop 4 features a 15-inch PixelSense display, Intel Core i7 processor, and 16GB RAM, making it perfect for both work and creative tasks.",
		price: 1499.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-1185G7",
			ram: "16GB",
			storage: "512GB SSD",
			display: '15" PixelSense',
		},
	},
	{
		id: 9,
		name: "MSI GF65 Thin",
		category: "Laptops",
		description:
			"A gaming laptop with solid performance at a competitive price.",
		fullDescription:
			"The MSI GF65 Thin comes with an Intel i7 processor, NVIDIA GTX 1660 Ti GPU, and a 15.6-inch Full HD display, delivering smooth gaming experiences.",
		price: 1099.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-10750H",
			ram: "16GB",
			storage: "512GB SSD",
			display: '15.6" Full HD 120Hz',
		},
	},
	{
		id: 10,
		name: "Acer Predator Helios 300",
		category: "Laptops",
		description: "A high-performance gaming laptop with advanced cooling.",
		fullDescription:
			"The Acer Predator Helios 300 is designed for gamers with its Intel i7 processor, NVIDIA RTX 3060 GPU, and a 15.6-inch 144Hz display.",
		price: 1799.99,
		image: "https://via.placeholder.com/300?text=Laptop",
		specs: {
			processor: "Intel Core i7-11800H",
			ram: "16GB",
			storage: "512GB SSD",
			display: '15.6" Full HD 144Hz',
		},
	},
];
