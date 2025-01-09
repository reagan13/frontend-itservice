<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include your database connection file
require '../db.php';

// Get data from the request body
$data = json_decode(file_get_contents("php://input"));

// Extract input
$email = $data->email ?? null;
$password = $data->password ?? null;

// Validate input
if (!$email || !$password) {
    echo json_encode(['error' => 'Email and password are required']);
    exit;
}

// Check if the email exists
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

// Verify password
if ($user['password_hash'] !== $password) {
    echo json_encode(['error' => 'Invalid email or password']);
    exit;
}

// Return success message along with user data
echo json_encode([
    'message' => 'Login successful',
    'user' => $user
]);
?>
