Ext.define('Zabbix.TemplateGrid', {
	extend: 'Zabbix.EditorGrid',
	alias: 'widget.TemplateGrid',
	columns: [
	          {header: i18n("Template"),  dataIndex: 'name', flex: 1},
	          {header: i18n("Applications"), dataIndex: '_applications_count', width: 50, sortable: false, hidden: true },
	          {header: i18n("Items"), dataIndex: '_items_count', width: 50, sortable: false, hidden: true },
	          {header: i18n("Triggers"), dataIndex: '_triggers_count', width: 50, sortable: false, hidden: true },
	          {header: i18n("Graphs"), dataIndex: '_graphs_count', width: 50, sortable: false, hidden: true },
	          {header: i18n("Screens"), dataIndex: '_screens_count', width: 50, sortable: false, hidden: true }
	          ],
	addButtonText: i18n("Add Template"),
	addButtonIcon: 'resources/fugue-icons/icons/blue-document--plus.png',
    deleteButtonText: i18n("Delete Template"),
    deleteButtonIcon: 'resources/fugue-icons/icons/blue-document--minus.png'
});