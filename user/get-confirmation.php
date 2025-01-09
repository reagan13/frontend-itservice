<?php
// get-confirmation.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the order ID and user ID from the query parameters
$orderId = $_GET['orderId'] ?? null;
$userId = $_GET['userId'] ?? null;

// Validate input
if (!$userId || !$orderId) {
    echo json_encode(['error' => 'User  ID and Order ID are required']);
    http_response_code(400);
    exit;
}

// Extract numeric ID from formatted order ID
$numericOrderId = str_replace("ORD-", "", $orderId);

// First, get the order details
$orderQuery = "
    SELECT 
        o.id AS order_id, 
        o.order_date, 
        o.total_amount
    FROM orders o
    WHERE o.id = :orderId AND o.user_id = :userId
";

try {
    $stmt = $conn->prepare($orderQuery);
    $stmt->bindParam(':orderId', $numericOrderId, PDO::PARAM_INT);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $orderResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($orderResults) === 0) {
        echo json_encode(['error' => 'Order not found']);
        http_response_code(404);
        exit;
    }

    // Get order items
    $itemsQuery = "
        SELECT 
            oi.product_id,
            p.name,
            oi.price,
            oi.quantity,
            p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = :orderId
    ";

    $stmt = $conn->prepare($itemsQuery);
    $stmt->bindParam(':orderId', $numericOrderId, PDO::PARAM_INT);
    $stmt->execute();
    $itemResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare the response
    $order = $orderResults[0];
    $processedOrder = [
        'id' => $order['order_id'],
        'date' => (new DateTime($order['order_date']))->format('Y-m-d'), // Format date as needed
        'total' => floatval($order['total_amount']),
        'items' => array_map(function($item) {
            return [
                'product_id' => $item['product_id'],
                'name' => $item['name'],
                'price' => floatval($item['price']),
                'quantity' => $item['quantity'],
                'image' => $item['image'],
            ];
        }, $itemResults),
    ];

    // Return the processed order
    echo json_encode($processedOrder);
    http_response_code(200);
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Failed to retrieve order details',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>