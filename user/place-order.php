<?php
// place-order.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the JSON input
$input = json_decode(file_get_contents('php://input'), true);
$userId = $input['userId'] ?? null;
$items = $input['items'] ?? null;

// Validate input
if (!$userId || !$items || count($items) === 0) {
    echo json_encode(['error' => 'User  ID and items are required']);
    http_response_code(400);
    exit;
}

// Start a transaction
try {
    $conn->beginTransaction();

    // Calculate total amount
    $totalAmount = array_reduce($items, function($total, $item) {
        return $total + ($item['price'] * $item['quantity']);
    }, 0);

    // Insert order
    $orderQuery = "INSERT INTO orders (user_id, order_date, total_amount) VALUES (:userId, NOW(), :totalAmount)";
    $stmt = $conn->prepare($orderQuery);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->bindParam(':totalAmount', $totalAmount, PDO::PARAM_STR);
    $stmt->execute();
    $orderId = $conn->lastInsertId();

    // Prepare order items
    $orderItemsQuery = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($orderItemsQuery);

    foreach ($items as $item) {
        $stmt->execute([$orderId, $item['id'], $item['quantity'], $item['price']]);
    }

    // Remove items from cart
    $removeCartQuery = "DELETE FROM cart WHERE user_id = :userId";
    $stmt = $conn->prepare($removeCartQuery);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();

    // Commit the transaction
    $conn->commit();

    // Successfully placed order
    echo json_encode([
        'message' => 'Order placed successfully',
        'orderId' => $orderId,
    ]);
    http_response_code(200);
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