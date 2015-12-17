<?php

$conn = mysql_connect('localhost', 'ppij', 'ppij');
mysql_select_db('ppij', $conn);

function checkParams() {
	if(!isset($_POST['username']) || !isset($_POST['password'])) {
		return false;
	}

	$username = $_POST['username'];
	$password = $_POST['password'];

	return mb_strlen($username) >= 2 && mb_strlen($username) <= 34 && mb_strlen($password) >= 4;
}
