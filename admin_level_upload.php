<?
	// Ultra secret password to access upload
	$password = "123123";

	if ($_SERVER['QUERY_STRING'] != $password) {
		echo "No access.";
		die();
	}
?>

<html>
<head>Admin Level Upload</head>
<body>
	<form method="POST">
		<label>JSON code for level</label></br>
		<textarea cols='50' rows='5' name="level"></textarea></br>
		<input type="submit">
	</form>
</body>
</html>

<?php
//include("includes/config.php");

$level = $_POST['level'];
if ($level != null) {
	include('includes/config.php')
	$sql = mysql_query("INSERT INTO `Level`(`level`) VALUES('$level')");

	if (true === $sql) {
		echo '<script>alert("Success!");</script>';
	}
}
?>
