<?php
namespace Zabbix\User;

use Zabbix\Service\JSONRPCServiceAdapter;

use Zabbix\Service\JSONRPCRestfulService;

use Zabbix\Service\RestfulService;

class UserService extends JSONRPCRestfulService {
	protected $itemIdParameter = "userid";
	
	public function authenticate () {
		$this->jsonRPCCall = new JSONRPCServiceAdapter();
		$this->applyJSONRPCDefaults();
		$this->jsonRPCCall->setMethod("authenticate");
		return $this->jsonRPCCall->call();
	}
}