<?php
// add-product.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Get the JSON input
    $data = json_decode(file_get_contents("php://input"), true);
    $name = $data['name'] ?? null;
    $category = $data['category'] ?? null;
    $description = $data['description'] ?? null;
    $fullDescription = $data['fullDescription'] ?? null;
    $price = $data['price'] ?? null;
    $image = $data['image'] ?? null;

    // Validate required fields
    if (!$name || !$category || !$price) {
        echo json_encode([
            'error' => 'Missing required fields: name, category, and price are required.',
        ]);
        http_response_code(400);
        exit;
    }

    // Prepare the insert query
    $insertQuery = "
        INSERT INTO products 
        (name, category, description, fullDescription, price, image) 
        VALUES (?, ?, ?, ?, ?, ?)
    ";

    $values = [
        $name,
        $category,
        $description ?? null,
        $fullDescription ?? null,
        $price,
        $image ?? null,
    ];

    // Execute the insert query
    $stmt = $conn->prepare($insertQuery);
    $stmt->execute($values);

    // Respond with the newly created product ID
    echo json_encode([
        'message' => 'Product added successfully',
        'productId' => $conn->lastInsertId(),
    ]);
    http_response_code(201);
    echo "Product added successfully";
} catch (PDOException $e) {
    // Handle database errors
    echo json_encode([
        'error' => 'Failed to add product',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
} catch (Exception $e) {
    // Handle other errors
    echo json_encode([
        'error' => 'Internal server error',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>