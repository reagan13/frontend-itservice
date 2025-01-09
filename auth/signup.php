<?php
// signup.php
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

require '../db.php'; // Include your database connection file

// Debugging - Check if $conn is properly set
if (!$conn) {
    echo json_encode(['error' => 'Database connection failed']);
    http_response_code(500); // Internal Server Error
    exit;
}

try {
    // Extract input
    $data = json_decode(file_get_contents("php://input"));
    $first_name = $data->first_name ?? null;
    $last_name = $data->last_name ?? null;
    $email = $data->email ?? null;
    $password = $data->password ?? null;
    $confirm_password = $data->confirm_password ?? null;

    // Validate input
    if (!$first_name || !$last_name || !$email || !$password || !$confirm_password) {
        echo json_encode(['error' => 'All fields are required']);
        http_response_code(400); // Bad Request
        exit;
    }

    if ($password !== $confirm_password) {
        echo json_encode(['error' => 'Passwords do not match']);
        http_response_code(400); // Bad Request
        exit;
    }

    // Check for existing email
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        echo json_encode(['error' => 'Email already in use']);
        http_response_code(409); // Conflict
        exit;
    }

    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)");
    $stmt->execute([$first_name, $last_name, $email, $password]); // Store password in plain text

    echo json_encode(['message' => 'User  successfully created', 'userId' => $conn->lastInsertId()]);
    http_response_code(201); // Created
} catch (Exception $e) {
    echo json_encode(['error' => 'An unexpected error occurred: ' . $e->getMessage()]);
    http_response_code(500); // Internal Server Error
}
?>