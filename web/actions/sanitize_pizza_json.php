<?php 
if(!isset($_REQUEST) || !isset($_REQUEST["json"]) || empty($_REQUEST["json"])) {
    header('Content-Type: application/json');
    echo json_encode([]);
    die();
}
if(!is_array($_REQUEST["json"])) $_REQUEST["json"] = (array) json_decode($_REQUEST["json"], true);
foreach($_REQUEST["json"] as $i => $o) {
    if(is_array($_REQUEST["json"])) {
        if(!empty($_REQUEST["json"][$i]["name"])) $_REQUEST["json"][$i]["name"] = strip_tags($o["name"]);
        if(!empty($_REQUEST["json"][$i]["description"])) $_REQUEST["json"][$i]["description"] = strip_tags($o["description"]);
    }
}
header('Content-Type: application/json');
echo json_encode($_REQUEST["json"]);
?>