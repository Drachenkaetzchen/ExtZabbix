Ext.define('Zabbix.TemplateEditor', {
	extend: 'Zabbix.Editor',
	alias: 'widget.TemplateEditor',
	items: [{
		xtype: 'textfield',
		name: 'host',
		maxLength: 64,
		fieldLabel: i18n("Template name")
	},{
		xtype: 'textfield',
		name: 'name',
		maxLength: 64,
		fieldLabel: i18n("Visible name")
	}],
	saveText: i18n("Save Template")
});
