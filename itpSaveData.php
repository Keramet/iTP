<?php
 	header("Access-Control-Allow-Origin: *");
	header("Content-Type: application/json; charset=UTF-8");

	if ( isset($_POST['itpData']) ) {

		$f = fopen("itpData.txt", "w");
		fwrite($f, $_POST['itpData']);
		fclose($f);

		echo 'Данные сохранены на сервере';
	}

	if ( isset($_POST['itpAppData']) ) {

		$f = fopen("itpData.txt", "w");
		fwrite($f, $_POST['itpAppData']);
		fclose($f);

		echo 'Данные сохранены на сервере!';
	}
?>