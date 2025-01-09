<?php
// get-orders.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the user ID from the query parameters
$userId = $_GET['userId'] ?? null;

// Validate input
if (!$userId) {
    echo json_encode(['error' => 'User  ID is required']);
    http_response_code(400);
    exit;
}

try {
    // First, get the orders
    $ordersQuery = "
        SELECT 
            o.id AS order_id, 
            o.order_date, 
            o.total_amount
        FROM orders o
        WHERE o.user_id = :userId
        ORDER BY o.order_date DESC
    ";

    $stmt = $conn->prepare($ordersQuery);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $orderResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no orders found, return empty array
    if (count($orderResults) === 0) {
        echo json_encode([]);
        http_response_code(200);
        exit;
    }

    // Prepare to fetch items for each order
    $orderIds = array_column($orderResults, 'order_id');

    // Get order items for all orders in one query
    $itemsQuery = "
        SELECT 
            oi.order_id,
            oi.product_id,
            p.name,
            oi.price,
            oi.quantity,
            p.image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id IN (" . implode(',', array_fill(0, count($orderIds), '?')) . ")
    ";

    $stmt = $conn->prepare($itemsQuery);
    $stmt->execute($orderIds);
    $itemResults = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group items by order
    $orderItemsMap = [];
    foreach ($itemResults as $item) {
        if (!isset($orderItemsMap[$item['order_id']])) {
            $orderItemsMap[$item['order_id']] = [];
        }
        $orderItemsMap[$item['order_id']][] = [
            'product_id' => $item['product_id'],
            'name' => $item['name'],
            'price' => floatval($item['price']),
            'quantity' => $item['quantity'],
            'image' => $item['image'],
        ];
    }

    // Combine orders with their items
    $processedOrders = [];
    foreach ($orderResults as $order) {
        $processedOrders[] = [
            'id' => "ORD-{$order['order_id']}",
            'date' => (new DateTime($order['order_date']))->format('Y-m-d'), // Format date as needed
            'total' => floatval($order['total_amount']),
            'items' => $orderItemsMap[$order['order_id']] ?? [],
        ];
    }

    // Return the processed orders
    echo json_encode($processedOrders);
    http_response_code(200);
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Failed to retrieve orders',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>