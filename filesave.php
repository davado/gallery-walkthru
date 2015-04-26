<?php

// Source: http://stackoverflow.com/questions/10955017/sending-json-to-php-using-ajax
if(isset($_POST['regData'])){
$obj = $_POST['regData'];

 //Source: http://www.w3schools.com/php/php_file_create.asp
$myfile = fopen("saved_register.json", "w") or die("Unable to open file!");
fwrite($myfile, $obj);
fclose($myfile);

}

?>
