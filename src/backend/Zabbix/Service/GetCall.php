<?php

use Zabbix\Service\JSONRPCServiceAdapter;

class GetCall extends JSONRPCServiceAdapter {
	public function setFilterName ($name) {
		$this->filterName = $name;
	}
}