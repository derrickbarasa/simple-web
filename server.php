<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST["name"];
    $outfit = $_POST["outfit"];
    $comment = $_POST["comment"];

    $data = "Name: $name | Outfit: $outfit | Comment: $comment\n";

    file_put_contents("feedback.txt", $data, FILE_APPEND);

    echo "<h2>Thank you, " . htmlspecialchars($name, ENT_QUOTES, 'UTF-8') . "! Your feedback has been received.</h2>";
}