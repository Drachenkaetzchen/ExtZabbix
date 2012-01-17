<?php
namespace Zabbix;
use Zabbix\Util\Configuration;

Configuration::setOption("zabbix.database.dbname", "zabbix");
Configuration::setOption("zabbix.database.username", "zabbix");
Configuration::setOption("zabbix.database.password", "zabbix");
Configuration::setOption("zabbix.database.host", "localhost");
Configuration::setOption("zabbix.database.driver", "pdo_mysql");

Configuration::setOption("zabbix.frontend.autologin.username", "Admin");
Configuration::setOption("zabbix.frontend.autologin.password", "zabbix");

Configuration::setOption("zabbix.frontend.autologin.enabled", true);

/*Configuration::setOption("partkeepr.cronjobs.disablecheck", true);
Configuration::setOption("partkeepr.frontend.debug", true);*/
