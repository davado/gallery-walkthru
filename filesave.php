<?php

/*
  Sources: 
  http://stackoverflow.com/questions/10955017/sending-json-to-php-using-ajax
  http://www.w3schools.com/php/php_file_create.asp
  http://stackoverflow.com/questions/3921520/writing-json-object-to-json-file-on-server

*/
$saved_file = "saved_register.json";

if(isset($_POST['regData'])){
  $obj = $_POST['regData'];

  if(json_decode($obj) != null) {
    $myfile = fopen($saved_file, "w") or die("Unable to open file!");
    fwrite($myfile, $obj);
    fclose($myfile);  
  } else {
    // emit error, $obj was stringified JSON.
  }

} else if( file_exists( $saved_file ) ) {
  
  echo file_get_contents($saved_file);
}

?>
