<?php

// Открыть текстовый файл
// $f = fopen("textfile.txt", "w");

// Записать строку текста
// fwrite($f, "PHP is fun!"); 

// Закрыть текстовый файл
// fclose($f);


/* 
если Ajax отправляли POST то на PHP читается вот так:
$_POST['some_json_parameter_name'];

 // Открыть текстовый файл
 $f = fopen("textfile.txt", "w");

 // Записать строку текста
 fwrite($f, $_POST['some_json_parameter_name'];);
*/

 	header("Access-Control-Allow-Origin: *");
//	header("Content-Type: application/json; charset=UTF-8");


//	

	if ( isset($_POST['itpData']) ) {

		echo $_POST['itpData'];

	//	$f = fopen("itpData.txt", "w");
	//	fwrite($f, $_POST['itpData'];)
	//	fclose($f)

	}



?>