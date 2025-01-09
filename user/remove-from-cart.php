<?php
// remove-from-cart.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the JSON input
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$productId = $input['productId'] ?? null;

// Log the action (optional)
error_log("Removing item from cart: User ID: $userId, Product ID: $productId");

// Validate input
if (!$userId || !$productId) {
    echo json_encode(['error' => 'User  ID and Product ID are required']);
    http_response_code(400);
    exit;
}

try {
    // Prepare the delete query
    $removeQuery = "DELETE FROM cart WHERE user_id = :userId AND product_id = :productId";
    $stmt = $conn->prepare($removeQuery);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
    $stmt->execute();

    // Check if any rows were actually deleted
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Item not found in cart']);
        http_response_code(404);
        exit;
    }

    // Successfully removed item from cart
    echo json_encode([
        'message' => 'Item removed from cart successfully',
        'deletedRows' => $stmt->rowCount(),
    ]);
    http_response_code(200);
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Database error',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>