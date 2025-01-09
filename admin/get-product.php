<?php
// get-product.php

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

try {
    // Prepare the SQL query
    $query = "SELECT * FROM products WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$productId]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Check if any product was found
    if (count($results) === 0) {
        echo json_encode(['error' => 'Product not found']);
        http_response_code(404);
        exit;
    }

    // Process the product (parse specifications if needed)
    $product = $results[0];
    if (isset($product['specifications'])) {
        try {
            $product['specifications'] = json_decode($product['specifications'], true);
        } catch (Exception $parseError) {
            error_log("Failed to parse specifications: " . $parseError->getMessage());
            $product['specifications'] = null; // Set to null if parsing fails
        }
    }

    // Return the product details
    echo json_encode($product);
    http_response_code(200);
} catch (PDOException $e) {
    // Handle any errors that occur during the query
    echo json_encode([
        'error' => 'Failed to fetch product',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>