Ext.define("Zabbix.User", {
	extend: "Ext.data.Model",
	fields: [
	         {	id: 'id', name: 'id',			type: 'int' },
	         {	name: 'username',	type: 'string'},
	         {	name: 'password',	type: 'string'}
	         ],
	//proxy: Z.getRESTProxy("User"),
	getRecordName: function () {
		return this.get("username");
	}
});