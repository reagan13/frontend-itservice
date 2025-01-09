<?php
// update-product.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the product ID from the URL parameters
$productId = $_GET['id'] ?? null; // Use $_GET for URL parameters in PHP

// Check if product ID is provided
if (!$productId) {
    echo json_encode(['error' => 'Product ID is required']);
    http_response_code(400);
    exit;
}

// Get the JSON input
$data = json_decode(file_get_contents("php://input"), true);
$name = $data['name'] ?? null;
$category = $data['category'] ?? null;
$description = $data['description'] ?? null;
$fullDescription = $data['fullDescription'] ?? null;
$price = $data['price'] ?? null;
$image = $data['image'] ?? null;

// Prepare the SQL update query
$query = "
    UPDATE products 
    SET 
        name = ?, 
        category = ?, 
        description = ?, 
        fullDescription = ?, 
        price = ?, 
        image = ?
    WHERE id = ?
";

$values = [
    $name,
    $category,
    $description,
    $fullDescription,
    $price,
    $image,
    $productId,
];

try {
    // Prepare and execute the query
    $stmt = $conn->prepare($query);
    $stmt->execute($values);

    // Check if any rows were affected
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Product not found']);
        http_response_code(404);
        exit;
    }

    // Success response
    echo json_encode([
        'message' => 'Product updated successfully',
        'productId' => $productId,
    ]);
    http_response_code(200);
} catch (PDOException $e) {
    // Handle any errors that occur during the query
    echo json_encode([
        'error' => 'Failed to update product',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>