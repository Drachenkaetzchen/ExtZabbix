<?php
namespace Zabbix\Service;

abstract class RestfulService extends Service {
	
	/**
	 * Overridden _doCall method which extracts the method from
	 * the CRUD method (POST, GET, PUT, DELETE).
	 * 
	 * @throws \Exception
	 */
	public function _doCall () {
		if ($this->request->getAction() != "") {
			return parent::_doCall();
		}
		
		switch (strtoupper($this->request->getMethod())) {
			case "POST":
				return $this->_executeCall("create");
				break;
			case "GET":
				if ($this->request->id) {
					return $this->_executeCall("getItem");
				} else {
					return $this->_executeCall("getList");
				}
				break;
			case "PUT":
				return $this->_executeCall("update");
				break;
			case "DELETE":
				return $this->_executeCall("destroy");
				break;
			default:
				throw new \Exception("I'm confused, don't know what to do with the method ".$request->getMethod());
				break;
		}
	}
	
	abstract public function getItem ();
	abstract public function getList ();
	abstract public function create ();
	abstract public function update ();
	abstract public function destroy ();
}