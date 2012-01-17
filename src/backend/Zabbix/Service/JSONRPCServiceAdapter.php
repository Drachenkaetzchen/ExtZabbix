<?php
namespace Zabbix\Service;

class JSONRPCServiceAdapter {
	const JSON_RPC_VERSION = "2.0";
	
	/**
	 * An ID which is returned as-is by the Zabbix JSON-RPC API to identify calls. This ID can be null; in that case,
	 * the service adapter will create an unique ID.
	 *  
	 * @var string
	 */
	private $callId = null;
	
	/**
	 * The service to call.
	 * @var string
	 */
	private $service;
	
	/**
	 * The method to call.
	 * @var string
	 */
	private $method;
	
	/**
	 * The auth token for authentification against the Zabbix API. Can be null; in that case, no auth token will
	 * be passed at all.
	 * 
	 * @var string
	 */
	private $authToken = null;
	
	/**
	 * Holds all defined parameters to the JSON-RPC API
	 * @var array
	 */
	private $parameters = array();
	
	public $debug = true;
	
	/**
	 * Executes a call against the Zabbix JSON-RPC API.
	 * 
	 * @param none
	 * @return array an array with the result set
	 */
	public function call () {
		$aData = $this->prepareParameters();
		
		$jsonRpc = new \CJSONrpc(json_encode($aData));
		
		$data = json_decode($jsonRpc->execute(), true);
		
		if ($this->debug) {
			$data["debug"] = $aData;
		}
		
		return $data;
	}
	
	/**
	 * Prepares the parameters array for use with the CJSONrpc class
	 * 
	 * @param none
	 * @return array An array with the prepared parameters
	 */
	private function prepareParameters () {
		$aData = array();
		
		$aData["jsonrpc"] = self::JSON_RPC_VERSION;
		
		// Inject a generated call id if none was explicitely set
		if ($this->getCallId() === null) {
			$aData["id"] = uniqid();
		} else {
			$aData["id"] = $this->getCallId();
		}
		
		if ($this->getAuthToken() !== null) {
			$aData["auth"] = $this->getAuthToken();
		}
		
		$aData["method"] = $this->getService() . "." . $this->getMethod();
		$aData["params"] = $this->parameters;
		
		return $aData;
	}
	
	/**
	 * Sets an unique call ID. The call id will be returned as-is by the Zabbix JSON-RPC API to identify calls.
	 *  
	 * @param string $id
	 */
	public function setCallId ($id) {
		$this->callId = $id;
	}
	
	/**
	 * Returns the call ID
	 * 
	 * @return string The call ID, or null if none was set.
	 */
	public function getCallId () {
		return $this->callId;
	}
	
	/**
	 * Sets the service to call
	 * @param string $service
	 */
	public function setService ($service) {
		$this->service = $service;
	}
	
	/**
	 * Returns the service to be called
	 * @return string The service to be called
	 */
	public function getService () {
		return $this->service;
	}
	
	/**
	 * Sets the method to call
	 * @param string $method
	 */
	public function setMethod ($method) {
		$this->method = $method;
	}
	
	/**
	 * Returns the method to be called
	 * @return string The method to be called
	 */
	public function getMethod () {
		return $this->method;
	}
	
	/**
	 * Sets the auth token for authenticating against the Zabbix API
	 * 
	 * @param string $authToken The auth token, or null to disable passing the auth token at all
	 */
	public function setAuthToken ($authToken) {
		$this->authToken = $authToken;
	}
	
	/**
	 * Returns the auth token.
	 * 
	 * @return string
	 */
	public function getAuthToken () {
		return $this->authToken;
	}
	
	/**
	 * Sets a specific parameter to a specific value
	 * @param string $parameter
	 * @param mixed $value
	 */
	public function setParameter ($parameter, $value) {
		$this->parameters[$parameter] = $value;
	}
	
	/**
	 * Returns the value for a specific parameter
	 * @param mixed $parameter The parameter, or null if the parameter doesn't exist
	 */
	public function getParameter ($parameter) {
		if (array_key_exists($parameter, $this->parameters)) {
			return $this->parameters[$parameter];
		} else {
			return null;
		}
	}
	
	/**
	 * Checks if a specific parameter exists
	 * @param string $parameter The parameter to check
	 * @return boolean true if the parameter exists, false otherwise
	 */
	public function hasParameter ($parameter) {
		if (array_key_exists($parameter, $this->parameters)) {
			return true;
		}
		
		return false;
	}
	
}