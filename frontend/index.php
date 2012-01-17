<?php
namespace Zabbix\Frontend;

use Zabbix\Zabbix;
use Zabbix\Util\Configuration;

include("../src/backend/Zabbix/Zabbix.php");

Zabbix::initialize();
Configuration::setOption("zabbix.frontend.debug", true);
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN"
        "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
		<title>Zabbix</title>
		
		<!-- Include the ExtJS CSS Theme -->
		<link rel="stylesheet" type="text/css" href="extjs/resources/css/ext-all.css"/>
		
		<link rel="stylesheet" type="text/css" href="js/Ext.ux/statusbar/css/statusbar.css"/>
		
		<link rel="stylesheet" type="text/css" href="css/Zabbix.css"/>
		
		<link rel="icon" href="favicon.ico"/>
		
		<!-- Include the ExtJS JavaScript Library -->
		<script type="text/javascript" src="extjs/bootstrap.js"></script> 
		
		<?php
		// @todo This is ugly, but how to fix?
			if (Configuration::getOption("zabbix.frontend.debug", false) === true) {
		?>
			<script type="text/javascript" src="extjs/ext-all-debug.js"></script>
			<script type="text/javascript" src="js/zabbix-debug.js"></script>
		<?php
			} else {
		?>
			<script type="text/javascript" src="extjs/ext-all.js"></script>
			<script type="text/javascript" src="js/zabbix.js"></script>
		<?php
			}
		?>
	</head>
<body>
<div id="loading"><span class="logo"></span></div>
<script type="text/javascript">
<?php 
if (Configuration::getOption("zabbix.frontend.autologin.enabled", false) === true) {
?>
window.autoLoginUsername = "<?php echo Configuration::getOption("zabbix.frontend.autologin.username"); ?>";
window.autoLoginPassword = "<?php echo Configuration::getOption("zabbix.frontend.autologin.password"); ?>";
<?php
}
?>
</script>
</body>
</html>