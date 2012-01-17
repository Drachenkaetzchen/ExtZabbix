<?php
namespace Zabbix\Template;

use Zabbix\Service\JSONRPCRestfulService;

class TemplateService extends JSONRPCRestfulService {
	protected $itemIdListParameter = "templateids";
	protected $itemIdUpdateParameter = "templateid";
	/*public function __construct () {
		parent::__construct();
		
		$this->setItemIdParameter("templateid");
	}*/
}