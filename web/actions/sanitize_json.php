<?php 
$json = json_encode($_REQUEST["json"]);
header('Content-Type: application/json');
echo $json;
?>