<?php
session_start();

include("config.php");
if (isset($_SESSION['username'])) {
	$error = ['succes' => False, 'redirect' => True, 'description' => 'User is already logged in!'];
	echo json_encode($error);
	die();
}

if(!checkParams()) {
	$error = ['success' => False, 'redirect' => False, 'description' => 'Username must be 4-34 characters long,<br/> password must be at least 4 characters'];
	echo json_encode($error);
	die();
}

$username = mysql_real_escape_string($_POST['username']);
$password = sha1(mysql_real_escape_string($_POST['password']));

$sql = mysql_query("SELECT * FROM User WHERE username = '$username' AND passhash = '$password'");
$result = mysql_fetch_array($sql);

if ($result['username'] !== $username) {
	$error = ['success' => False, 'redirect' => False, 'description' => 'User entered wrong login info!'];
	echo json_encode($error);
	die();
} else {
	$_SESSION['username'] = $username;
	$_SESSION['userId'] = $result['id'];

	$ok = ['success' => True, 'result' => 'ok'];
	echo json_encode($ok);
}
