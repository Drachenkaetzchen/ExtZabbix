Ext.define("Zabbix.Template", {
	extend: "Ext.data.Model",
	fields: [
			{	name: 'available',			type: 'string'},
			{	name: 'disable_until',		type: 'string'},
			{	name: 'error',				type: 'string'},
			{	name: 'errors_from',		type: 'string'},
			{	name: 'host',				type: 'string'},
			{	name: 'hostid',				type: 'string'},
			{	name: 'ipmi_authtype',		type: 'string'},
			{	name: 'ipmi_available',		type: 'string'},
			{	name: 'ipmi_error',			type: 'string'},
			{	name: 'ipmi_errors_from',	type: 'string'},
			{	name: 'ipmi_password',		type: 'string'},
			{	name: 'ipmi_privilege',		type: 'string'},
			{	name: 'ipmi_username',		type: 'string'},
			{	name: 'jmx_available',		type: 'string'},
			{	name: 'jmx_disable_until',	type: 'string'},
			{	name: 'jmx_error',			type: 'string'},
			{	name: 'jmx_errors_from',	type: 'string'},
			{	name: 'lastaccess',			type: 'string'},
			{	name: 'maintenance_from',	type: 'string'},
			{	name: 'maintenance_status',	type: 'string'},
			{	name: 'maintenance_type',	type: 'string'},
			{	name: 'maintenance_id',		type: 'string'},
			{	name: 'name',				type: 'string'},
			{	name: 'proxy_hostid',		type: 'string'},
			{	name: 'snmp_available',		type: 'string'},
			{	name: 'snmp_disable_until',	type: 'string'},
			{	name: 'snmp_error',			type: 'string'},
			{	name: 'snmp_errors_from',	type: 'string'},
			{	name: 'status',				type: 'string'},
			{	name: 'templateid',			type: 'string'},
			
			// Several volatile properties for querying
			{	name: '_applications_count',type: 'int'},
			{	name: '_items_count',		type: 'int'},
			{	name: '_triggers_count',	type: 'int'},
			{	name: '_graphs_count',		type: 'int'},
			{	name: '_screens_count',		type: 'int'}
	         ],
	idProperty: 'templateid',
	proxy: Zabbix.getRESTProxy("Template"),
	getRecordName: function () {
		return this.get("name");
	}
});