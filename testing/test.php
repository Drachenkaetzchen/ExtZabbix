<?php
namespace Zabbix;

use Zabbix\Service\JSONRPCServiceAdapter;

use Zabbix\User\User;

include("../src/backend/Zabbix/Zabbix.php");

$cwd = getcwd();

chdir("/home/felicitus/public_html/zabbix/frontends/php");
require_once('include/config.inc.php');

Zabbix::initialize();

$jsonrpc = new JSONRPCServiceAdapter();
$jsonrpc->setService("template");
$jsonrpc->setMethod("get");

$jsonrpc->setParameter("output", "extend");
$jsonrpc->setParameter("selectGroups", "shorten");
$jsonrpc->setAuthToken("74b317f43e50ad1b6ae4e180c90053a6");

print_r($jsonrpc->call());