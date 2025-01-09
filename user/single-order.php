<?php
// single-order.php

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
if (!$userId || !$productId || !$quantity) {
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
    $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
    $stmt->execute();
    $productResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($productResults) === 0) {
        echo json_encode([
            'error' => 'Product not found',
            'details' => 'No product found with the given ID',
        ]);
        http_response_code(404);
        $conn->rollBack();
        exit;
    }

    $product = $productResults[0];
    $totalAmount = $product['price'] * $quantity;

    // Insert order
    $orderQuery = "INSERT INTO orders (user_id, order_date, total_amount) VALUES (:userId, NOW(), :totalAmount)";
    $stmt = $conn->prepare($orderQuery);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':totalAmount', $totalAmount, PDO::PARAM_STR);
    $stmt->execute();
    $orderId = $conn->lastInsertId();

    // Insert order items
    $itemQuery = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (:orderId, :productId, :quantity, :price)";
    $stmt = $conn->prepare($itemQuery);
    $stmt->bindParam(':orderId', $orderId, PDO::PARAM_INT);
    $stmt->bindParam(':productId', $productId, PDO::PARAM_INT);
    $stmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $stmt->bindParam(':price', $product['price'], PDO::PARAM_STR);
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
} catch (PDOException $e) {
    // Rollback the transaction in case of error
    $conn->rollBack();
    echo json_encode([
        'error' => 'Transaction failed',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>