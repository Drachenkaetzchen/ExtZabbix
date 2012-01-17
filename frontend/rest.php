<?php
namespace Zabbix;

use Zabbix\REST\Request;
use Zabbix\Service\JSONRPCServiceAdapter;

define('ZBX_RPC_REQUEST', 1);

include("../src/backend/Zabbix/Zabbix.php");

Zabbix::initialize();

$cwd = getcwd();

chdir("/home/felicitus/public_html/zabbix/frontends/php");
require_once('include/config.inc.php');
//chdir($cwd);



$request = new Request(array('restful' => true));
$service = $request->getService();

$className = "Zabbix\\".$service."\\".$service."Service";

$service = new $className($request);
$decodedResponse = $service->_doCall();


if (array_key_exists("error", $decodedResponse)) {
	header('HTTP/1.0 400 Exception', false, 400);
	$decodedResponse["success"] = false;
} else {
	$decodedResponse["success"] = true;
}


echo json_encode($decodedResponse);