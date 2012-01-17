<?php
namespace Zabbix\Service;

use Zabbix\REST\Request;

class Service {
	/**
	 * The request used to call the service
	 * @var Request
	 */
	protected $request;
	
	public function __construct (Request $request) {
		$this->request = $request;
	}
	
	public function sendHeaders () {
		header("Content-Type: text/html; charset=UTF-8");
		header("Cache-Control: no-cache, must-revalidate");
		header("Access-Control-Allow-Origin: *");
	}
	/**
	 * Does the service call, as specified by the request.
	 * 
	 */
	public function _doCall () {
		return $this->_executeCall($this->request->getAction());
	}
	
	/**
	 * Executes the specified callname. Checks if the implementation is there.
	 * 
	 * @param string $callName The call name
	 * @throws \Exception If the specified call doesn't exist. 
	 */
	public function _executeCall ($callName) {
		if (!method_exists(get_called_class(), $callName)) {
			throw new \Exception(sprintf("The service %s doesn't implement %s", get_called_class(), $callName));
		}
		
		$this->sendHeaders();
		return $this->$callName();
	}
}