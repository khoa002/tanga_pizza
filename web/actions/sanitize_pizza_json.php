<?php 
foreach($_REQUEST["json"] as $i => $o) {
    if(isset($_REQUEST["json"][$i]["name"])) $_REQUEST["json"][$i]["name"] = strip_tags($o["name"]);
    if(isset($_REQUEST["json"][$i]["description"])) $_REQUEST["json"][$i]["description"] = strip_tags($o["description"]);
}
header('Content-Type: application/json');
echo json_encode($_REQUEST["json"]);
?>