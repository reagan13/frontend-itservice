<?php
// single-order.php

// Include the database connection
require 'db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the JSON input
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$productId = $input['productId'] ?? null;
$quantity = $input['quantity'] ?? null;

// Validate input
if (!isset($userId) || !isset($productId) || !isset($quantity)) {
    echo json_encode([
        'error' => 'Invalid order data',
        'details' => 'User  ID, Product ID, and Quantity are required',
    ]);
    http_response_code(400);
    exit;
}

// Start a database transaction
try {
    $conn->beginTransaction();

    // First, get the product details
    $productQuery = "SELECT id, name, price, image FROM products WHERE id = :productId";
    $stmt = $conn->prepare($productQuery);
    $stmt->bindParam(':productId', $productId);
    $stmt->execute();
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        echo json_encode([
            'error' => 'Product not found',
        ]);
        http_response_code(404);
        $conn->rollBack();
        exit;
    }

    $totalAmount = $product['price'] * $quantity;

    // Insert order
    $orderQuery = "INSERT INTO orders (user_id, order_date, total_amount) VALUES (:userId, NOW(), :totalAmount)";
    $stmt = $conn->prepare($orderQuery);
    $stmt->bindParam(':userId', $userId);
    $stmt->bindParam(':totalAmount', $totalAmount);
    $stmt->execute();
    $orderId = $conn->lastInsertId();

    // Insert order items
    $itemQuery = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (:orderId, :productId, :quantity, :price)";
    $stmt = $conn->prepare($itemQuery);
    $stmt->bindParam(':orderId', $orderId);
    $stmt->bindParam(':productId', $productId);
    $stmt->bindParam(':quantity', $quantity);
    $stmt->bindParam(':price', $product['price']);
    $stmt->execute();

    // Commit the transaction
    $conn->commit();

    // Successfully created order
    echo json_encode([
        'id' => "ORD-$orderId",
        'userId' => $userId,
        'productId' => $productId,
        'quantity' => $quantity,
        'totalAmount' => $totalAmount,
        'orderDate' => (new DateTime())->format(DateTime::ISO8601),
        'productDetails' => [
            'name' => $product['name'],
            'image' => $product['image'],
        ],
    ]);
    http_response_code(201);
} catch (Exception $e) {
    // Rollback the transaction in case of error
    $conn->rollBack();
    echo json_encode([
        'error' => 'Failed to create order',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>