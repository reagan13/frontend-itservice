<?php
// get-products.php

// Include the database connection
require '../db.php'; // Make sure the path is correct

// Set content type to JSON
header('Content-Type: application/json');

try {
    // Query to get all products that are not deleted
    $query = "SELECT * FROM products WHERE is_deleted = FALSE";

    $stmt = $conn->prepare($query);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Log the number of products retrieved
    error_log("Retrieved " . count($results) . " products");

    // Optional: Log the first product for debugging
    if (count($results) > 0) {
        error_log("First Product: " . json_encode($results[0]));
    }

    // Return the results as JSON
    echo json_encode($results);
    http_response_code(200);
} catch (PDOException $e) {
    // Handle any errors that occur during the query
    echo json_encode([
        'error' => 'Error retrieving products',
        'details' => $e->getMessage(),
    ]);
    http_response_code(500);
}
?>