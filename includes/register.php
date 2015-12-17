<?php
session_start();

include("config.php");
if (isset($_SESSION['username'])) {
	$error = ['success' => False, 'redirect' => False, 'description' => 'User is already logged in!'];
	echo json_encode($error);
	die();
}

if(!checkParams()) {
	$error = ['success' => False, 'redirect' => False, 'description' => 'Username must be 4-34 characters long,<br/> password must be at least 4 characters'];
	echo json_encode($error);
	die();
}

$username = mysql_real_escape_string($_POST['username']);
$sql = mysql_fetch_array(mysql_query("SELECT * FROM User WHERE username = '$username'"));
if ($sql['username'] != '') {
	$error = ['success' => False, 'redirect' => True, 'description' => 'User already exists!'];	
	echo json_encode($error);
	die();
}

$password = sha1(mysql_real_escape_string($_POST['password']));

$sql = mysql_query("INSERT INTO `User`(`username`, `passhash`) VALUES('$username', '$password')");
if ($sql === true) {
	$ok = ['success' => True];
	echo json_encode($ok);
	die();
} else {
	$error = ['success' => False, 'description' => mysql_error()];
	echo json_encode($error);
	die();	
}
?>
