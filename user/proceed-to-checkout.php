<?php
// get-cart.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

// Get the user ID from the URL parameters
$userId = $_GET['userId'] ?? null;

// Log the action (optional)
error_log("Fetching cart for user: $userId");

// Validate input
if (!$userId) {
    echo json_encode(['error' => 'User  ID is required']);
    http_response_code(400);
    exit;
}

try {
    // Updated query to join with products to get full product details
    $query = "
        SELECT 
            c.product_id, 
            c.quantity, 
            p.name, 
            p.price, 
            p.image
        FROM 
            cart c
        JOIN 
            products p ON c.product_id = p.id
        WHERE 
            c.user_id = :userId
    ";

    $stmt = $conn->prepare($query);
    $stmt->bindParam(':userId', $userId, PDO::PARAM_INT);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // If no items in cart
    if (count($results) === 0) {
        echo json_encode([
            'message' => 'Cart is empty',
            'cartItems' => [],
            'totalItems' => 0,
            'totalValue' => 0,
        ]);
        http_response_code(200);
        exit;
    }

    // Calculate total cart value
    $totalValue = array_reduce($results, function($total, $item) {
        return $total + ($item['price'] * $item['quantity']);
    }, 0);

    echo json_encode([
        'cartItems' => $results,
        'totalItems' => count($results),
        'totalValue' => number_format($totalValue, 2), // Format to 2 decimal places
    ]);
    http_response_code(200);
} catch (PDOException $e) {
    // Handle any errors that occur during the query
    echo json_encode([
        'error' => 'Error fetching cart',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>