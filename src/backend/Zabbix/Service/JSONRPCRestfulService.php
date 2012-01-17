<?php
namespace Zabbix\Service;

class JSONRPCRestfulService extends RestfulService {
	protected $jsonRPCCall;
	
	public function getList () {
		$this->jsonRPCCall = new JSONRPCGetListCall();
		
		if ($this->request->hasParameter("start")) {
			$this->jsonRPCCall->setStart($this->request->getParameter("start"));
		}
		
		if ($this->request->hasParameter("limit")) {
			$this->jsonRPCCall->setLimit($this->request->getParameter("limit"));
		}
		
		if ($this->request->hasParameter("sort")) {
			$aSort = json_decode($this->request->getParameter("sort"), true);
			$aSortData = $aSort[0];
		
			$this->jsonRPCCall->setParameter("sortfield", $aSortData["property"]);
			$this->jsonRPCCall->setParameter("sortorder", $aSortData["direction"]);
		}
		
		$this->_decodeParameters();
		
		$this->jsonRPCCall->setMethod("get");
		$this->applyJSONRPCDefaults();
		return $this->jsonRPCCall->call();
	}
	
	public function getItem () {
		$this->jsonRPCCall = new JSONRPCServiceAdapter();
		$this->applyJSONRPCDefaults();
		$this->jsonRPCCall->setMethod("get");
		$this->jsonRPCCall->setParameter($this->itemIdListParameter, $this->request->id);
		return $this->jsonRPCCall->call();
		
	}
	
	// This needs urgent refactoring.
	protected function _decodeParameters () {
		foreach ($this->request->getParameters() as $parameter => $value) {
			if (substr($parameter, 0,7) == "params_") {
				$paramChunks = explode("_", $parameter);
				
				switch (count($paramChunks)) {
					case 0:
					case 1:
						break;
					case 2:
						$this->jsonRPCCall->setParameter($paramChunks[1], $value);
						break;
					case 3:
						if ($this->jsonRPCCall->hasParameter($paramChunks[1])) {
							$tmpValue = $this->jsonRPCCall->getParameter($paramChunks[1]);
							
							if (is_array($tmpValue)) {
								$tmpValue[$paramChunks[2]] = $value;
							} else {
								$tmpValue = array($paramChunks[2] => $tmpValue);
							}
							
							$this->jsonRPCCall->setParameter($tmpValue);
						} else {
							$this->jsonRPCCall->setParameter($paramChunks[1], array($paramChunks[2] => $value));
						}
						break;
				}
			}
		}
	}
	
	
	public function create () {
		$this->jsonRPCCall = new JSONRPCServiceAdapter();
		$this->applyJSONRPCDefaults();
		$this->jsonRPCCall->setMethod("create");
		return $this->jsonRPCCall->call();
	}
	
	public function update () {
		//print_r($this->request->getParameters());
		$this->jsonRPCCall = new JSONRPCServiceAdapter();
		$this->applyJSONRPCDefaults();
		$this->jsonRPCCall->setMethod("update");
		$this->jsonRPCCall->setParameter($this->itemIdUpdateParameter, $this->request->id);
		return $this->jsonRPCCall->call();
	}
	
	public function destroy () {
		
	}
	
	protected function applyJSONRPCDefaults () {
		$this->jsonRPCCall->setService(strtolower($this->request->getService()));
		
		if ($this->request->hasParameter("callId")) {
			$this->jsonRPCCall->setCallId($this->request->getParameter("callId"));
		}
		
		if ($this->request->hasParameter("auth")) {
			$this->jsonRPCCall->setAuthToken($this->request->getParameter("auth"));
		}
		
		if ($this->request->hasHeader("auth")) {
			$this->jsonRPCCall->setAuthToken($this->request->getHeader("auth"));
		}
		
		if ($this->request->hasParameter("params")) {
			if (is_array($this->request->getParameter("params"))) {
				$params = $this->request->getParameter("params");
			} else {
				$params = json_decode($this->request->getParameter("params"), true);
			}
			
			foreach ($params as $key => $value) {
				$this->jsonRPCCall->setParameter($key, $value);
			}
		}
	}
}