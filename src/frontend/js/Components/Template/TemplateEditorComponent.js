Ext.define('Zabbix.TemplateEditorComponent', {
	extend: 'Zabbix.EditorComponent',
	alias: 'widget.TemplateEditorComponent',
	navigationClass: 'Zabbix.TemplateGrid',
	editorClass: 'Zabbix.TemplateEditor',
	newItemText: i18n("New Template"),
	model: 'Zabbix.Template',
	loadParameters: {
		params: {
			selectGroups: "extend",
			selectMacros: "extend",
			selectHosts: "extend",
			output: "extend"
		}
	},
	queryParameters: {
		params: {
			selectApplications: "shorten"
		}
	},
	initComponent: function () {
		this.createStore({
			proxy: Zabbix.getRESTProxy("Template"),
			sorters: [{
	              property: 'host',
	              direction:'ASC'
	          }]
		});
		
		this.callParent();
	}
});