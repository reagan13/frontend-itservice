<?php
// update-cart-quantity.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the JSON input
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$productId = $input['productId'] ?? null;
$quantity = $input['quantity'] ?? null;

// Validate input
if (!$userId || !$productId || $quantity === null) {
    echo json_encode(['error' => 'User  ID, Product ID, and Quantity are required']);
    http_response_code(400);
    exit;
}

// Validate quantity
$parsedQuantity = intval($quantity);
if ($parsedQuantity < 1) {
    echo json_encode(['error' => 'Quantity must be a positive number']);
    http_response_code(400);
    exit;
}

try {
    // Update query to modify the quantity for a specific cart item
    $updateQuery = "
        UPDATE cart 
        SET quantity = :quantity 
        WHERE user_id = :userId AND product_id = :productId
    ";

    $stmt = $conn->prepare($updateQuery);
    $stmt->bindParam(':quantity', $parsedQuantity, PDO::PARAM_INT);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
    $stmt->execute();

    // Check if any rows were actually updated
    if ($stmt->rowCount() === 0) {
        echo json_encode(['error' => 'Cart item not found']);
        http_response_code(404);
        exit;
    }

    echo json_encode([
        'message' => 'Cart item quantity updated successfully',
        'updatedQuantity' => $parsedQuantity,
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