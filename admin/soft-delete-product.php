<?php
// soft-delete-product.php

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
    // Prepare the soft delete query
    $query = "UPDATE products SET is_deleted = TRUE WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$productId]);

    // Check if any rows were affected
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Product not found']);
        http_response_code(404);
        exit;
    }

    // Success response
    echo json_encode([
        'message' => 'Product marked as deleted',
        'productId' => $productId,
    ]);
    http_response_code(200);
} catch (PDOException $e) {
    // Handle any errors that occur during the query
    echo json_encode([
        'error' => 'Failed to delete product',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>