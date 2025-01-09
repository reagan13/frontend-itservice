<?php
// add-to-cart.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Get the JSON input
$input = json_decode(file_get_contents('php://input'), true);
$user_id = $input['user_id'] ?? null;
$product_id = $input['product_id'] ?? null;
$quantity = $input['quantity'] ?? null;

// Basic validation
if (!$user_id || !$product_id || !$quantity) {
    echo json_encode(['error' => 'User  ID, Product ID, and Quantity are required']);
    http_response_code(400);
    exit;
}

try {
    // Check if the product already exists in the cart for the given user
    $checkQuery = "SELECT * FROM cart WHERE user_id = :user_id AND product_id = :product_id";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($results) > 0) {
        // If the product already exists in the cart, add the new quantity to the existing quantity
        $newQuantity = $results[0]['quantity'] + $quantity; // Increment the quantity

        $updateQuery = "UPDATE cart SET quantity = :quantity WHERE user_id = :user_id AND product_id = :product_id";
        $stmt = $conn->prepare($updateQuery);
        $stmt->bindParam(':quantity', $newQuantity, PDO::PARAM_INT);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'message' => 'Cart updated successfully',
            'cartItem' => [
                'user_id' => $user_id,
                'product_id' => $product_id,
                'quantity' => $newQuantity, // Return the updated quantity
            ],
        ]);
        http_response_code(200);
    } else {
        // If the product doesn't exist in the cart, add it with the specified quantity
        $insertQuery = "INSERT INTO cart (user_id, product_id, quantity) VALUES (:user_id, :product_id, :quantity)";
        $stmt = $conn->prepare($insertQuery);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':product_id', $product_id, PDO::PARAM_INT);
        $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode([
            'message' => 'Product added to cart successfully',
            'cartItem' => [
                'user_id' => $user_id,
                'product_id' => $product_id,
                'quantity' => $quantity,
            ],
        ]);
        http_response_code(200);
    }
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Database error',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>