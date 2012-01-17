Ext.define("PartKeepr.JsonWithAssociations", {
	extend: 'Ext.data.writer.Json',
	alias: 'writer.jsonwithassociations',

	/**
	 * @cfg {Array} associations Which associations to include.
	 */
	associations: [],

	getRecordData: function(record) {
		var me = this, i, key, subStore,
		data = me.callParent(arguments);

		var storeName;
		
		Ext.apply(data, record.getAssociatedData());
		
		return data;
	}
});
function i18n (string) {
	return string;
}
Ext.namespace('Zabbix'); 
		
Ext.Loader.setPath({
    'Zabbix': 'js'
});

Zabbix.application = null;

Ext.application({
	/**
	 * Holds an instance of the session manager
	 */
	sessionManager: null,
	
    name: 'Zabbix',
    launch: function() {
    	Zabbix.application = this;
    	
    	this.sessionManager = new Zabbix.Session();
    	this.sessionManager.on("login", this.onLogin, this);
    	this.sessionManager.login(window.autoLoginUsername, window.autoLoginPassword);
    },
    /**
     * Returns the session manager
     * 
     * @returns SessionManager
     */
    getSessionManager: function () {
    	return this.sessionManager;
    },
    onLogin: function () {
    	var j = new Ext.Window({
    		layout: 'fit',
    		width: 800,
    		height: 600,
    		items: [
    		        Ext.create("Zabbix.TemplateEditorComponent")
    		        ]
    	});
    	
    	j.show();
    }
});

/**
 * <p>This static method returns a REST object definition for use with any models.</p>
 * <p>It automatically sets the session (if available) and the prefix for the given REST service.</p>
 * @param {string} service The REST service to call. Only use the base name, e.g. "Footprint" instead of "FootprintService".
 * @return {Object} The RESTProxy definition
*/
Zabbix.getRESTProxy = function (service) {
	var obj = {
		batchActions: false,
		url: Zabbix.getBasePath()+ '/'+service,
		extraParams: {
			debug: true,
			params: { 
				"output": "extend",
				"selectApplications" : "refer",
				"selectItems" : "refer",
				"selectTriggers" : "refer",
				"selectGraphs" : "refer",
				
				/*"selectTemplates" : "shorten",
				
				
				"selectScreens" : "shorten",
				"selectDiscovery" : "shorten",*/
			}
		},
		listeners: {
        	exception: function (proxy, response, operation) {
        		try {
                    var data = Ext.decode(response.responseText);
                    
                    Zabbix.ExceptionWindow.showException(data.exception);
                } catch (ex) {
                	var exception = {
                			message: i18n("Critical Error"),
                			detail: i18n("The server returned a response which we were not able to interpret."),
                			exception: "",
                			backtrace: response.responseText
                	};
                	
             	
                	Zabbix.ExceptionWindow.showException(exception);
                }
        	}
        },
		reader: {
            type: 'json',
            root: 'result',
            successProperty: "success",
            messageProperty: 'message',
            totalProperty  : 'totalCount'
        },
        writer: {
            type: 'jsonwithassociations',
            root: 'params'
        }
        
	};
	//Ext.data.AjaxProxy.superclass.constructor.apply(this, arguments);
	return new Ext.data.proxy.Rest(obj);
};

Zabbix.getApplication = function () {
	return Zabbix.application;
};

Zabbix.getBasePath = function () {
	return "rest.php";
};
/**
 * Defines the login dialog
 */
Ext.define('Zabbix.LoginDialog', {
	extend: 'Ext.Window',
	/* Various style settings */
	title: i18n("Zabbix: Login"),
	
	width: 400,
	height: 125,
	
	modal: true,
	resizable: false,
	
	layout: 'anchor',
	
	bodyStyle: 'padding: 5px;',
	
	/**
	 * Initializes the login dialog component 
	 */
	initComponent: function () {
		
		this.loginField = Ext.ComponentMgr.create({
	    	xtype: 'textfield',
	    	value: "",
	    	fieldLabel: i18n("Username"),
	    	anchor: '100%'
	    });

		this.passwordField = Ext.ComponentMgr.create({
        	xtype: 'textfield',
        	inputType: "password",
        	value: "",
        	fieldLabel: i18n("Password"),
        	anchor: '100%'
        });
		
		Ext.apply(this, {
			// Login when "enter" was hit
			keys: [{
				key: Ext.EventObject.ENTER,
				handler: this.login,
				scope: this
			}],
			items: [
			        	this.loginField,
			        	this.passwordField
			],
			dockedItems: [{
			       xtype: 'toolbar',
			       enableOverflow: true,
			       dock: 'bottom',
			       ui: 'footer',
			       pack: 'start',
			       defaults: {minWidth: 100},
			       items: [
			       	{
			       		text: i18n("Connect"),
			       		icon: 'resources/silkicons/connect.png',
			       		handler: Ext.bind(this.login, this)
			       	},{
			       		text: i18n("Close"),
			       		handler: Ext.bind(this.close, this),
			       		icon: 'resources/silkicons/cancel.png'
			       	}]
			}]
		});
		
		this.callParent(arguments);

		// Focus the login field on show
		this.on("show", function () { this.loginField.focus(); }, this);
	},
	/**
	 * Fires the "login" event
	 */
	login: function () {
		this.fireEvent("login", this.loginField.getValue(), this.passwordField.getValue());
	}

});
/**
 * This class extends a regular GridPanel with the following features:
 * 
 * - Buttons to add/delete items
 * - Enable/Disable the delete button if an item is selected
 * - Search field
 * - Paging Toolbar
 */
Ext.define('Zabbix.EditorGrid', {
	extend: 'Ext.grid.Panel',
	alias: 'widget.EditorGrid',
	
	/**
     * @cfg {String} text The text for the "delete" button
     */
	deleteButtonText: i18n("Delete Item"),
	
	/**
     * @cfg {String} text The path to the 'delete' icon
     */
	deleteButtonIcon: 'resources/silkicons/delete.png',
	
	/**
     * @cfg {String} text The text for the "add" button
     */
	addButtonText: i18n("Add Item"),
	
	/**
     * @cfg {String} text The path to the 'add' icon
     */
	addButtonIcon: 'resources/silkicons/add.png',
	
	/**
     * @cfg {Boolean} boolean Specifies whether to enable the top toolbar or not
     */
	enableTopToolbar: true,
	
	/**
     * @cfg {String} text Defines if the "add"/"delete" buttons should show their text or icon only. If "hide", the
     * button text is hidden, anything else shows the text.
     */
	buttonTextMode: 'hide',
	
	initComponent: function () {
		
		this.addEvents(
				/**
	             * @event itemSelect
	             * Fires if a record was selected within the grid.
	             * @param {Object} record The selected record
	             */
				"itemSelect",
				
				/**
	             * @event itemDeselect
	             * Fires if a record was deselected within the grid.
	             * @param {Object} record The deselected record
	             */
				"itemDeselect",

				/**
				 * @event itemEdit
				 * Fires if a record should be edited.
				 * @param {Object} record The record to edit
				 */
				"itemEdit",
				
				/**
	             * @event itemDelete
	             * Fires if the delete button was clicked.
	             */
				"itemDelete",
				
				/**
	             * @event itemDelete
	             * Fires if the add button was clicked.
	             */
				"itemAdd");
		
		
		this.getSelectionModel().on("select", 	this._onItemSelect, 	this);
		this.getSelectionModel().on("deselect", this._onItemDeselect, 	this);
		
		this.on("itemclick", this._onItemEdit, this);

		this.deleteButton = Ext.create("Ext.button.Button", {
			text: (this.buttonTextMode !== "hide") ? this.deleteButtonText : '',
			tooltip: this.deleteButtonText,
			icon: this.deleteButtonIcon,
        	handler: Ext.bind(function () {
        		this.fireEvent("itemDelete");
        	}, this),
        	disabled: true
		});
		
		this.addButton = Ext.create("Ext.button.Button", {
			text: (this.buttonTextMode !== "hide") ? this.addButtonText : '',
        	tooltip: this.addButtonText,
        	icon: this.addButtonIcon,
        	handler: Ext.bind(function () {
        		this.fireEvent("itemAdd");
        	}, this)
		});
		
		this.searchField = Ext.create("Ext.ux.form.SearchField",{
				store: this.store
			});
		
		this.topToolbar = Ext.create("Ext.toolbar.Toolbar",{
			dock: 'top',
			enableOverflow: true,
			items: [
			        this.addButton,
			        this.deleteButton,
			        { xtype: 'tbfill' },
			        this.searchField]
		});
		
		this.bottomToolbar = Ext.create("Ext.toolbar.Paging", {
			store: this.store,
			enableOverflow: true,
			dock: 'bottom',
			displayInfo: false
		});
		
		this.dockedItems = new Array();
		
		this.dockedItems.push(this.bottomToolbar);
	
		if (this.enableTopToolbar) {
			this.dockedItems.push(this.topToolbar);	
		}
		
		this.callParent();
	},
	syncChanges: function (record) {
		// Simply reload the store for now
		this.store.load();
	},
	/**
	 * Called when an item was selected. Enables/disables the delete button. 
	 */
	_updateDeleteButton: function (selectionModel, record) {
		/* Right now, we support delete on a single record only */
		if (this.getSelectionModel().getCount() == 1) {
			this.deleteButton.enable();
		} else {
			this.deleteButton.disable();
		}
	},
	
	/**
	 * Called when an item should be edited
	 */
	_onItemEdit: function (view, record) {
		this.fireEvent("itemEdit", record.getId());
	},
	/**
	 * Called when an item was selected
	 */
	_onItemSelect: function (selectionModel, record) {
		this._updateDeleteButton(selectionModel, record);
		this.fireEvent("itemSelect", record);
	},
	/**
	 * Called when an item was deselected
	 */
	_onItemDeselect: function (selectionModel, record) {
		this._updateDeleteButton(selectionModel, record);
		this.fireEvent("itemDeselect", record);
	}
});
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
Ext.define('Zabbix.Editor', {
	extend: 'Ext.form.Panel',
	alias: 'widget.Editor',
	trackResetOnLoad: true,
	bodyStyle: 'background:#DBDBDB;padding: 10px;',
	record: null,		// The record which is currently edited
	saveText: i18n("Save"),
	cancelText: i18n("Cancel"),
	model: null,
	layout: 'anchor',
	change: false,
	autoScroll: true,
    defaults: {
        anchor: '100%',
        labelWidth: 150
    },
    enableButtons: true,
    
    // If false, determinates if we should sync via the store or the record itself.
    // If true, always syncs the record via it's own proxy.
    syncDirect: false,
    
    onFieldChange: function () {
    	return;
    	
    	// @todo Finish implementing the dirty flag later
    	/*if (this.change == false) {
    		this.setTitle(this.record.getRecordName() + "*");
    	}
    	
    	this.change = true;*/
    },
	initComponent: function () {
		if (this.enableButtons) {
			this.saveButton = Ext.create("Ext.button.Button", {
				text: this.saveText,
				icon: 'resources/fugue-icons/icons/disk.png',
				handler: Ext.bind(this.onItemSave, this)
			});
			
			this.cancelButton = Ext.create("Ext.button.Button", {
				text: this.cancelText,
				icon: 'resources/silkicons/cancel.png',
				handler: Ext.bind(this.onCancelEdit, this)
			});
			
			this.bottomToolbar = Ext.create("Ext.toolbar.Toolbar", {
				enableOverflow: true,
				margin: '10px',
				defaults: {minWidth: 100},
				dock: 'bottom',
				ui: 'footer',
				items: [ this.saveButton, this.cancelButton ]
			});
			
			Ext.apply(this, {
				dockedItems: [ this.bottomToolbar ]});
		}
		
		
		
		
		this.on("dirtychange", function (form, dirty) {
			// @todo Check dirty flag
			// Waiting for reply on http://www.sencha.com/forum/showthread.php?135142-Ext.form.Basic.loadRecord-causes-form-to-be-dirty&p=607588#post607588
		});
		
		this.addEvents("editorClose", "startEdit", "itemSaved");
		
		this.defaults.listeners = {
        	"change": Ext.bind(this.onFieldChange, this)
        };
		
		this.callParent();
	},
	onCancelEdit: function () {
		this.fireEvent("editorClose", this);
	},
	newItem: function (defaults) {
		Ext.apply(defaults, {});
		var j = Ext.create(this.model, defaults);
		this.editItem(j);
	},
	editItem: function (record) {
		this.record = record;
		this.getForm().loadRecord(this.record);
		this.show();
		if (this.record.getRecordName() !== "") {
			this._setTitle(this.record.getRecordName());
		}
		
		this.change = false;
		this.fireEvent("startEdit", this);
	},
	getRecordId: function () {
		if (this.record) {
			return this.record.getId();
		} else {
			return null;
		}
	},
	onItemSave: function () {
		// Disable the save button to indicate progress
		if (this.enableButtons) {
			this.saveButton.disable();

			// Sanity: If the save process fails, re-enable the button after 30 seconds
			Ext.defer(function () { this.saveButton.enable(); }, 30000, this);
		}
		
		this.getForm().updateRecord(this.record);
		this.record.save({
				callback: this._onSave,
				scope: this
		});
	},
	_onSave: function (record, response) {
		if (this.enableButtons) {
			// Re-enable the save button
			this.saveButton.enable();
		}
		
		if (response.success === true) {
			this.record = record;
			this.fireEvent("itemSaved", this.record);			
		}
	},
	_setTitle: function (title) {
		this.setTitle(title);
	}
});

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

/**
 * @class Zabbix.EditorComponent

 * <p>The EditorComponent encapsulates an editing workflow. In general, we have four actions
 * for each object: create, update, delete, view. These actions stay exactly the same for each
 * distinct object.</p>
 * <p>The EditorComponent is a border layout, which has a navigation and an editor area.</p>
 * @todo Document the editor system a bit better 
 */
Ext.define('Zabbix.EditorComponent', {
	extend: 'Ext.panel.Panel',
	alias: 'widget.EditorComponent',
	
	/**
	 * Misc layout settings
	 */
	layout: 'border',
	padding: 5,
	border: false,
	
	/**
	 * Specifies the class name of the navigation. The navigation is placed in the "west" region
	 * and needs to fire the event "itemSelect". The component listens on that event and
	 * creates an editor based on the selected record.
	 */
	navigationClass: null,
	
	/**
	 * Specifies the class name of the editor.
	 */
	editorClass: null,
	
	/**
	 * Contains the store for the item overview.
	 */
	store: null,
	
	/**
	 * Contains the associated model to load a record for.
	 */
	model: null,
	
	/**
	 * Some default text messages. Can be overridden by sub classes.
	 */
	deleteMessage: i18n("Do you really wish to delete the item %s?"),
	deleteTitle: i18n("Delete Item"),
	newItemText: i18n("New Item"),
	
	/**
	 * Additional parameters when loading a model. Must be an object.
	 */
	loadParameters: {},
	
	initComponent: function () {
		
		/**
		 * Create the navigation panel
		 */
		this.navigation = Ext.create(this.navigationClass, {
			region: 'west',
			width: 265,
			split: true,
			store: this.store
		});
		
		this.navigation.on("itemAdd", 		this.newRecord, 	this);
		this.navigation.on("itemDelete", 	this.confirmDelete, this);
		this.navigation.on("itemEdit", 		this.startEdit, 	this);
		
		/**
		 * Create the editor panel
		 */
		this.editorTabPanel = Ext.create("Ext.tab.Panel", {
			region: "center",
			layout: 'fit',
			plugins: Ext.create('Ext.ux.TabCloseMenu')
		});
		
		this.items = [ this.navigation, this.editorTabPanel ];
		
		this.callParent();
	},
	/**
	 * Creates a new record. Creates a new instance of the editor.
	 */
	newRecord: function (defaults) {
		Ext.apply(defaults, {});
		
		var editor = this.createEditor(this.newItemText);
		editor.newItem(defaults);
		this.editorTabPanel.add(editor).show();
	},
	/**
	 * Instructs the component to edit a new record.
	 * @param {Record} record The record to edit
	 */
	startEdit: function (id) {
		/* Search for an open editor for the current record. If we
		 * already have an editor, show the editor instead of loading
		 * a new record.
		 */
		var editor = this.findEditor(id);
		
		if (editor !== null) {
			editor.show();
			return;
		}
		
		// Still here? OK, we don't have an editor open. Create a new one
		var model = Ext.ModelManager.getModel(this.model);
		
		model.load(id, {
			scope: this,
			params: this.loadParameters,
		    success: function(record, operation) {
		    	editor = this.createEditor(record.getRecordName());
				editor.editItem(record);
				this.editorTabPanel.add(editor).show();
		    }
		});
	},
	findEditor: function (id) {
		for (var i=0;i<this.editorTabPanel.items.getCount();i++) {
			if (this.editorTabPanel.items.getAt(i).getRecordId() == id) {
				return this.editorTabPanel.items.getAt(i);
			}
		}
		
		return null;
	},
	createEditor: function (title) {
		var editor = Ext.create(this.editorClass, {
			store: this.store,
			title: title,
			model: this.model,
			closable: true,
			listeners: {
				editorClose: Ext.bind(function (m) {
					this.editorTabPanel.remove(m);
				}, this)
			}
		});
		
		editor.on("itemSaved", this.onItemSaved, this);
		return editor;
	},
	confirmDelete: function () {
		var r = this.navigation.getSelectionModel().getLastSelected();
		var recordName;
		
		if (r.getRecordName) {
			recordName = r.getRecordName();
		} else {
			recordName = r.get("name");
		}
		
		Ext.Msg.confirm(
				this.deleteTitle,
				sprintf(this.deleteMessage, recordName),
				function (but) {
					if (but == "yes") {
						this.deleteRecord(r);
					}
				},this);
	},
	deleteRecord: function (r) {
		var editor = this.findEditor(r.get("id"));
		
		if (editor !== null) {
			this.editorTabPanel.remove(editor);
		}
		
		r.destroy();
		this.store.load();
	},
	// Creates a store. To be called from child's initComponent
	createStore: function (config) {
		
		Ext.Object.merge(config, {
				autoLoad: true,
				model: this.model,
				autoSync: false, // Do not change. If true, new (empty) records would be immediately commited to the database.
				remoteFilter: true,
				remoteSort: true,
				pageSize: 15});
		
		this.store = Ext.create('Ext.data.Store', config);
		
		// Workaround for bug http://www.sencha.com/forum/showthread.php?133767-Store.sync()-does-not-update-dirty-flag&p=607093#post607093
		this.store.on('write', function(store, operation) {
	        var success=operation.wasSuccessful();
	        if (success) {
	            Ext.each(operation.records, function(record){
	                if (record.dirty) {
	                    record.commit();
	                }
	            });
	        }
		});
	},
	getStore: function () {
		return this.store;
	},
	onItemSaved: function (record) {
		this.navigation.syncChanges(record);	
	}
});
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
/**
 * Represents a session against the Zabbix Server.
 */
Ext.define("Zabbix.Session", {
	extend: 'Ext.util.Observable',
	 
	/**
	 * Holds the current session ID, or null if no session is active
	 * 
	 * @var string
	 */
	session: null,
	
	/**
	 * Holds an instance of the login dialog, or "null" if no login dialog is active.
	 * 
	 * @var object
	 */
	loginDialog: null,
	
	
	/**
	 * Constructs a new SessionManager.
	 * 
	 * @param config Optional: Specifies a configuration object
	 */
	constructor: function(config){
		this.addEvents({
			"login": true
		});
		
		this.callParent(arguments);
	},
	/**
	 * Creates and shows the login dialog, as well as setting up any event handlers.
	 */
	login: function (username, password) {
		this.loginDialog = Ext.create("Zabbix.LoginDialog");
		
		if (username && password) {
			this.onLogin(username, password);
		} else {
			this.loginDialog.on("login", this.onLogin, this);
			this.loginDialog.show();
		}
	},
	/**
	 * Callback from the login dialog when the "login" button was clicked.
	 * 
	 * @param username The username, as entered in the login dialog
	 * @param password The password, as entered
	 */
	onLogin: function (username, password) {
		var k = new Zabbix.ServiceCall("User", "authenticate");
		k.setParameter("user", username);
		k.setParameter("password", password);
		k.setParameter("foo", { 
			megadoll: {
				foo: "bla"
			}
		});
		
		k.enableAnonymous();
		k.setHandler(Ext.bind(this.onAfterLogin, this));
		k.doCall();
	},
	/**
	 * Callback when the service call is complete.
	 * 
	 * @param response The session ID
	 */
	onAfterLogin: function (response) {
		this.session = response;
		this.loginDialog.destroy();
		
		this.fireEvent("login");
	},
	/**
	 * Returns the current session
	 * 
	 * @returns the session, or null if no session is available
	 */
	getSession: function () {
		return this.session;
	}
});
Ext.define('Ext.ux.form.SearchField', {
    extend: 'Ext.form.field.Trigger',
    
    alias: 'widget.searchfield',
    
    trigger1Cls: Ext.baseCSSPrefix + 'form-clear-trigger',
    
    trigger2Cls: Ext.baseCSSPrefix + 'form-search-trigger',
    
    hasSearch : false,
    paramName : "params.search.host",
    
    initComponent: function(){
        this.callParent(arguments);
        this.on('specialkey', function(f, e){
            if(e.getKey() == e.ENTER){
                this.onTrigger2Click();
            }
        }, this);
    },
    
    afterRender: function(){
        this.callParent();
        this.triggerEl.item(0).setDisplayed('none');
        this.doComponentLayout();
    },
    
    onTrigger1Click : function(){
        var me = this,
            store = me.store,
            proxy = store.getProxy(),
            val;
            
        if (me.hasSearch) {
            me.setValue('');
            proxy.extraParams[me.paramName] = '';
            store.currentPage = 1;
            store.load({ start: 0 });
            me.hasSearch = false;
            
            me.triggerEl.item(0).setDisplayed('none');
            me.doComponentLayout();
        }
    },

    onTrigger2Click : function(){
        var me = this,
            store = me.store,
            proxy = store.getProxy(),
            value = me.getValue();
            
        if (value.length < 1) {
            me.onTrigger1Click();
            return;
        }
        proxy.extraParams[me.paramName] = value;
        store.currentPage = 1;
        store.load({ start: 0 });
        
        me.hasSearch = true;
        me.triggerEl.item(0).setDisplayed('block');
        me.doComponentLayout();
    }
});
// vim: sw=2:ts=2:nu:nospell:fdc=2:expandtab
/**
* @class Ext.ux.SimpleIFrame
* @extends Ext.Panel
*
* A simple ExtJS 4 implementaton of an iframe providing basic functionality.
* For example:
*
* var panel=Ext.create('Ext.ux.SimpleIFrame', {
*   border: false,
*   src: 'http://localhost'
* });
* panel.setSrc('http://www.sencha.com');
* panel.reset();
* panel.reload();
* panel.getSrc();
* panel.update('<div><b>Some Content....</b></div>');
* panel.destroy();
*
* @author    Conor Armstrong
* @copyright (c) 2011 Conor Armstrong
* @date      12 April 2011
* @version   0.1
*
* @license Ext.ux.SimpleIFrame.js is licensed under the terms of the Open Source
* LGPL 3.0 license. Commercial use is permitted to the extent that the 
* code/component(s) do NOT become part of another Open Source or Commercially
* licensed development library or toolkit without explicit permission.
* 
* <p>License details: <a href="http://www.gnu.org/licenses/lgpl.html"
* target="_blank">http://www.gnu.org/licenses/lgpl.html</a></p>
*
*/

Ext.require([
	'Ext.panel.*'
]);

Ext.define('Ext.ux.SimpleIFrame', {
  extend: 'Ext.Panel',
  alias: 'widget.simpleiframe',
  src: 'about:blank',
  loadingText: 'Loading ...',
  initComponent: function(){
    this.updateHTML();
    this.callParent(arguments);
  },
  updateHTML: function() {
    this.html='<iframe id="iframe-'+this.id+'"'+
        ' style="overflow:auto;width:100%;height:100%;"'+
        ' frameborder="0" '+
        ' src="'+this.src+'"'+
        '></iframe>';
  },
  reload: function() {
    this.setSrc(this.src);
  },
  reset: function() {
    var iframe=this.getDOM();
    var iframeParent=iframe.parentNode;
    if (iframe && iframeParent) {
      iframe.src='about:blank';
      iframe.parentNode.removeChild(iframe);
    }

    iframe=document.createElement('iframe');
    iframe.frameBorder=0;
    iframe.src=this.src;
    iframe.id='iframe-'+this.id;
    iframe.style.overflow='auto';
    iframe.style.width='100%';
    iframe.style.height='100%';
    iframeParent.appendChild(iframe);
  },
  setSrc: function(src, loadingText) {
    this.src=src;
    var iframe=this.getDOM();
    if (iframe) {
      iframe.src=src;
    }
  },
  getSrc: function() {
    return this.src;
  },
  getDOM: function() {
    return document.getElementById('iframe-'+this.id);
  },
  getDocument: function() {
    var iframe=this.getDOM();
    iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
    return iframe.document;
  },
  destroy: function() {
    var iframe=this.getDOM();
    if (iframe && iframe.parentNode) {
      iframe.src='about:blank';
      iframe.parentNode.removeChild(iframe);
    }
    this.callParent(arguments);
  },
  update: function(content) {
	var doc;
	  
    this.setSrc('about:blank');
    try {
      doc=this.getDocument();
      doc.open();
      doc.write(content);
      doc.close();
    } catch(err) {
      // reset if any permission issues
      this.reset();
      doc=this.getDocument();
      doc.open();
      doc.write(content);
      doc.close();
    }
  }
});
Ext.define('Ext.ux.ClearableComboBox', {
	extend: "Ext.form.ComboBox",
	alias: "widget.clearcombo",
    initComponent: function() {
        this.triggerConfig = {
            tag:'span', cls:'x-form-twin-triggers', cn:[
            {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger x-form-clear-trigger"},
            {tag: "img", src: Ext.BLANK_IMAGE_URL, cls: "x-form-trigger"}
        ]};
        
        this.callParent();
    },
    onTrigger1Click : function()
    {
        this.collapse();
        this.setValue('');
        this.fireEvent('cleared');
    },
    setValue : function(v){
	Ext.form.ClearableComboBox.superclass.setValue.call(this, v);
	if (this.rendered) {
		this.triggers[0][!Ext.isEmpty(v) ? 'show': 'hide']();
	}
    },
    onDestroy: function(){
        Ext.destroy(this.triggers);
        Ext.form.ClearableComboBox.superclass.onDestroy.apply(this, arguments);
    }
});

Ext.override(Ext.data.Connection, {
/**
     * Sets various options such as the url, params for the request
     * @param {Object} options The initial options
     * @param {Object} scope The scope to execute in
     * @return {Object} The params for the request
     */
    setOptions: function(options, scope){
        var me =  this,
            params = options.params || {},
            extraParams = me.extraParams,
            urlParams = options.urlParams,
            url = options.url || me.url,
            jsonData = options.jsonData,
            method,
            disableCache,
            data;


        // allow params to be a method that returns the params object
        if (Ext.isFunction(params)) {
            params = params.call(scope, options);
        }

        // allow url to be a method that returns the actual url
        if (Ext.isFunction(url)) {
            url = url.call(scope, options);
        }

        url = this.setupUrl(options, url);

        //<debug>
        if (!url) {
            Ext.Error.raise({
                options: options,
                msg: 'No URL specified'
            });
        }
        //</debug>

        // check for xml or json data, and make sure json data is encoded
        data = options.rawData || options.xmlData || jsonData || null;
        if (jsonData && !Ext.isPrimitive(jsonData)) {
            data = Ext.encode(data);
        }

        // make sure params are a url encoded string and include any extraParams if specified
        if (Ext.isObject(params)) {
            params = Ext.Object.toQueryString(params);
        }

        if (Ext.isObject(extraParams)) {
            extraParams = Ext.Object.toQueryString(extraParams);
        }

        params = params + ((extraParams) ? ((params) ? '&' : '') + extraParams : '');

        urlParams = Ext.isObject(urlParams) ? Ext.Object.toQueryString(urlParams) : urlParams;

        console.log(params);
        params = this.setupParams(options, params);

        // decide the proper method for this request
        method = (options.method || me.method || ((params || data) ? 'POST' : 'GET')).toUpperCase();
        this.setupMethod(options, method);


        disableCache = options.disableCaching !== false ? (options.disableCaching || me.disableCaching) : false;
        // if the method is get append date to prevent caching
        if (method === 'GET' && disableCache) {
            url = Ext.urlAppend(url, (options.disableCachingParam || me.disableCachingParam) + '=' + (new Date().getTime()));
        }

        // if the method is get or there is json/xml data append the params to the url
        if ((method == 'GET' || data) && params) {
            url = Ext.urlAppend(url, params);
            params = null;
        }

        // allow params to be forced into the url
        if (urlParams) {
            url = Ext.urlAppend(url, urlParams);
        }

        return {
            url: url,
            method: method,
            data: data || params || null
        };
    }
});
/**
 * Enhancements for Ext.data.Connection:
 * 
 * Inject the session automatically on each request if a
 * session is available.
 */
Ext.override(Ext.data.Connection, {
	/**
	 * Inject session header. I haven't found a better way to do
	 * it :(
	 */
	setupHeaders: function (xhr, options, data, params) {
		console.log("BLA");
		var session;
		
		if (!options.headers) {
			options.headers = {};
		}
		
		if (Zabbix.getApplication() !== null) {
			session = Zabbix.getApplication().getSessionManager().getSession();
			if (session !== null) {
				options.headers.auth = session;
			}
		}
		
		var headers = this.callOverridden(arguments);
		
		return headers;
	}
});

Ext.Ajax.on("beforerequest", function (obj, options) {
	console.log(options);
	if (options.params) {
		for (var j in options.params) {
			if (typeof(options.params[j]) == 'object') {
				options.params[j] = Ext.encode(options.params[j]);
			}
		}
	}
});
Ext.define('Zabbix.ExceptionWindow', {
    extend: 'Ext.window.Window',
    autoScroll: true,
    resizable: true,
    layout: 'anchor',
    width: 500,
    height: 300,
    cls: Ext.baseCSSPrefix + 'message-box',
    initComponent: function () {
    	
    	this.iconComponent = Ext.create('Ext.Component', {
            cls: 'ext-mb-icon',
            width: 40,
            height: 35,
            style: {
                'float': 'left'
            }
        });
    	
    	this.messageDiv = Ext.create('Ext.Component', {                            autoEl: { tag: 'div' },
            cls: 'ext-mb-text',
            style: 'margin-left: 40px;'
        });
    	
    	this.detailDiv = Ext.create('Ext.Component', {                            autoEl: { tag: 'div' },
            cls: 'ext-mb-text',
            style: 'margin-left: 40px; margin-top: 20px;'
        });
    	
    	this.exceptionDiv = Ext.create('Ext.Component', {                            autoEl: { tag: 'div' },
            cls: 'ext-mb-text',
            style: 'overflow: auto'
        });
    	
    	this.traceDiv = Ext.create('Ext.Component', {                            autoEl: { tag: 'div' },
            cls: 'ext-mb-text'
        });
    		
    	this.exceptionDetails = Ext.create('Ext.form.FieldSet', {
			style: 'margin-left: 40px; margin-top: 20px',
			title: 'Exception Details',
			collapsible: true,
			collapsed: true,
			items: this.exceptionDiv
        });
    	
    	this.backtraceDetails = Ext.create('Ext.form.FieldSet', {
			style: 'margin-left: 40px',
			title: 'Backtrace',
			collapsible: true,
			collapsed: true,
			items: this.traceDiv
    	});
    	
    	this.topContainer = Ext.create("Ext.container.Container", {
    		xtype: 'container',
    		style: 'padding: 10px',
    		layout: 'anchor',
    		anchor: '100% 100%',
    		items: [this.iconComponent, this.messageDiv, this.detailDiv, 
    		        this.exceptionDetails, this.backtraceDetails]
    	});
    	
    	this.items = this.topContainer;
    	
    	this.dockedItems = [{
            xtype: 'toolbar',
            dock: 'bottom',
            ui: 'footer',
            defaults: {minWidth: 80},
            layout: {
                pack: 'center'
            },
            items: [
                { xtype: 'button', text: 'OK', handler: Ext.bind(function () { this.hide(); }, this) }
                //{ xtype: 'button', text: 'Details >>', handler: Ext.bind(function () { this.showDetails(); }, this) }
            ]
        }];
    	
    	this.callParent();
    },
    setIcon : function(icon) {
        this.iconComponent.removeCls(this.iconCls);
        
        if (icon) {
            this.iconComponent.show();
            this.iconComponent.addCls(Ext.baseCSSPrefix + 'dlg-icon');
            this.iconComponent.addCls(icon);
        } else {
            this.iconComponent.removeCls(Ext.baseCSSPrefix + 'dlg-icon');
            this.iconComponent.hide();
        }
    },
    _showException: function (exception) {
    	this.setIcon(Ext.MessageBox.ERROR);
    	
    	this.messageDiv.update(exception.message);
    	this.setTitle(exception.message);
    	
    	if (exception.detail) {
    		this.detailDiv.update(exception.detail);
    	} else {
    		this.detailDiv.update("");
    	}
    	
    	
    	if (exception.exception) {
    		this.exceptionDiv.update(exception.exception);
    	} else {
    		this.exceptionDiv.update("No information available");
    	}
    	
    	if (exception.backtrace) {
    		this.traceDiv.update(nl2br('<code>'+exception.backtrace+'</code>'));
    	} else {
    		this.traceDiv.update("No backtrace available");
    	}
    	
    	this.show();
    	
    },
    
    statics: {
    	showException: function (exception) {
    		if (!Zabbix.ExceptionWindow.activeInstance) {
        		Zabbix.ExceptionWindow.activeInstance = new Zabbix.ExceptionWindow();
        	}
    		
    		Zabbix.ExceptionWindow.activeInstance._showException(exception);
    	}
    	
    }
});
Ext.define('Zabbix.ServiceCall', {
	extend: 'Ext.util.Observable',
	
	service: null,
	call: null,
	
	sHandler: null,
	parameters: {},
	loadMessage: null,
	anonymous: false,

	constructor: function (service,call) {
		this.setService(service);
		this.setCall(call);
		this.parameters = {};
	},
	
	/**
	 * <p>This method activates anonymous mode.</p>
	 * <p>Anonymous mode defines that the service is called without passing a valid session. Usually, the only anonymous call is to authenticate a user.</p>
	*/
	enableAnonymous: function () {
		this.anonymous = true;
	},
	/**
	 * <p>This method deactivates anonymous mode.</p>
 	*/
	disableAnonymous: function () {
		this.anonymous = false;
	},
	setService: function (service) {
		this.service = service;
	},
	setCall: function (call) {
		this.call = call;
	},
	setParameter: function (parameter, value) {
		this.parameters[parameter] = value;
	},
	setParameters: function (obj) {
		Ext.apply(this.parameters, obj);
	},
	setLoadMessage: function (message) {
		this.loadMessage = message;
	},
	setHandler: function (handler) {
		this.sHandler = handler;
	},
	doCall: function () {
		/* Update the status bar to indicate that the call is in progress. */
		//Zabbix.getApplication().getStatusbar().startLoad(this.loadMessage);
		
		var callDefinition = { params: Ext.encode(this.parameters) };
		
		var headers = {};
		
		if (!this.anonymous) {
			callDefinition.auth = Zabbix.getApplication().getSessionManager().getSession();
		}
		
		Ext.Ajax.request({
			url: Zabbix.getBasePath() + '/' + this.service + "/"+this.call,
			success: Ext.bind(this.onSuccess, this),
			failure: Ext.bind(this.onError, this),
			method: "GET",
			params: callDefinition,
			headers: headers
		});
	},
	onSuccess: function (responseObj) {
		//Zabbix.getApplication().getStatusbar().endLoad();
		
		try {
			var response = Ext.decode(responseObj.responseText);	
		} catch (ex) {
			var exception = {
        			message: i18n("Critical Error"),
        			detail: i18n("The server returned a response which we were not able to interpret."),
        			exception: "",
        			backtrace: responseObj.responseText
        	};
        	
     	
        	Zabbix.ExceptionWindow.showException(exception);
        	return;
		}
		
				
		/* Check the status */
		if (response.error) {
			this.displayError(response.error);
			/*Zabbix.getApplication().getStatusbar().setStatus({
				text: this.getErrorMessage(response.exception),
				iconCls: 'x-status-error',
				clear: {
					useDefaults: true,
					anim: false
				}
			});*/
			return;
		}
		
		if (this.sHandler) { 
			this.sHandler(response.result);
		}
	},
	onError: function (response) {
		try {
            var data = Ext.decode(response.responseText);
            
        	Zabbix.ExceptionWindow.showException(data.exception);
        } catch (ex) {
        	var exception = {
        			message: i18n("Critical Error"),
        			detail: i18n("The server returned a response which we were not able to interpret."),
        			exception: "",
        			backtrace: response.responseText
        	};
        	
        	Zabbix.ExceptionWindow.showException(exception);
        	
        	
        }
        
		Zabbix.getApplication().getStatusbar().endLoad();
	},
	displayError: function (obj) {
		Ext.Msg.show({
			title: i18n("Error"),
			msg: this.getErrorMessage(obj),
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR
			
		});
	},
	getErrorMessage: function (obj) {
		return obj.data;
	},
	displaySystemError: function (obj) {
		var errorMsg;

		errorMsg = "Error Message: " + obj.message+"<br>";
		errorMsg += "Exception:"+obj.exception+"<br>";
		errorMsg += "Backtrace:<br>"+str_replace("\n", "<br>", obj.backtrace);
		
		Ext.Msg.maxWidth = 800;
		
		Ext.Msg.show({
			title: i18n("System Error"),
			msg: errorMsg,
			buttons: Ext.MessageBox.OK,
			icon: Ext.MessageBox.ERROR
			
		});
	}
	
});

function nl2br (str, is_xhtml) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Philip Peterson
    // +   improved by: Onno Marsman
    // +   improved by: Atli Þór
    // +   bugfixed by: Onno Marsman
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   improved by: Maximusya
    // *     example 1: nl2br('Kevin\nvan\nZonneveld');
    // *     returns 1: 'Kevin<br />\nvan<br />\nZonneveld'
    // *     example 2: nl2br("\nOne\nTwo\n\nThree\n", false);
    // *     returns 2: '<br>\nOne<br>\nTwo<br>\n<br>\nThree<br>\n'
    // *     example 3: nl2br("\nOne\nTwo\n\nThree\n", true);
    // *     returns 3: '<br />\nOne<br />\nTwo<br />\n<br />\nThree<br />\n'
    var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';

    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}
/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.ux.StatusBar
 * <p>Basic status bar component that can be used as the bottom toolbar of any {@link Ext.Panel}.  In addition to
 * supporting the standard {@link Ext.toolbar.Toolbar} interface for adding buttons, menus and other items, the StatusBar
 * provides a greedy status element that can be aligned to either side and has convenient methods for setting the
 * status text and icon.  You can also indicate that something is processing using the {@link #showBusy} method.</p>
 * <pre><code>
Ext.create('Ext.Panel', {
    title: 'StatusBar',
    // etc.
    bbar: Ext.create('Ext.ux.StatusBar', {
        id: 'my-status',

        // defaults to use when the status is cleared:
        defaultText: 'Default status text',
        defaultIconCls: 'default-icon',

        // values to set initially:
        text: 'Ready',
        iconCls: 'ready-icon',

        // any standard Toolbar items:
        items: [{
            text: 'A Button'
        }, '-', 'Plain Text']
    })
});

// Update the status bar later in code:
var sb = Ext.getCmp('my-status');
sb.setStatus({
    text: 'OK',
    iconCls: 'ok-icon',
    clear: true // auto-clear after a set interval
});

// Set the status bar to show that something is processing:
sb.showBusy();

// processing....

sb.clearStatus(); // once completeed
</code></pre>
 * @extends Ext.toolbar.Toolbar
 * @constructor
 * Creates a new StatusBar
 * @param {Object/Array} config A config object
 */
Ext.define('Ext.ux.statusbar.StatusBar', {
    extend: 'Ext.toolbar.Toolbar',
    alternateClassName: 'Ext.ux.StatusBar',
    alias: 'widget.statusbar',
    requires: ['Ext.toolbar.TextItem'],
    /**
     * @cfg {String} statusAlign
     * The alignment of the status element within the overall StatusBar layout.  When the StatusBar is rendered,
     * it creates an internal div containing the status text and icon.  Any additional Toolbar items added in the
     * StatusBar's {@link #items} config, or added via {@link #add} or any of the supported add* methods, will be
     * rendered, in added order, to the opposite side.  The status element is greedy, so it will automatically
     * expand to take up all sapce left over by any other items.  Example usage:
     * <pre><code>
// Create a left-aligned status bar containing a button,
// separator and text item that will be right-aligned (default):
Ext.create('Ext.Panel', {
    title: 'StatusBar',
    // etc.
    bbar: Ext.create('Ext.ux.StatusBar', {
        defaultText: 'Default status text',
        id: 'status-id',
        items: [{
            text: 'A Button'
        }, '-', 'Plain Text']
    })
});

// By adding the statusAlign config, this will create the
// exact same toolbar, except the status and toolbar item
// layout will be reversed from the previous example:
Ext.create('Ext.Panel', {
    title: 'StatusBar',
    // etc.
    bbar: Ext.create('Ext.ux.StatusBar', {
        defaultText: 'Default status text',
        id: 'status-id',
        statusAlign: 'right',
        items: [{
            text: 'A Button'
        }, '-', 'Plain Text']
    })
});
</code></pre>
     */
    /**
     * @cfg {String} defaultText
     * The default {@link #text} value.  This will be used anytime the status bar is cleared with the
     * <tt>useDefaults:true</tt> option (defaults to '').
     */
    /**
     * @cfg {String} defaultIconCls
     * The default {@link #iconCls} value (see the iconCls docs for additional details about customizing the icon).
     * This will be used anytime the status bar is cleared with the <tt>useDefaults:true</tt> option (defaults to '').
     */
    /**
     * @cfg {String} text
     * A string that will be <b>initially</b> set as the status message.  This string
     * will be set as innerHTML (html tags are accepted) for the toolbar item.
     * If not specified, the value set for <code>{@link #defaultText}</code>
     * will be used.
     */
    /**
     * @cfg {String} iconCls
     * A CSS class that will be <b>initially</b> set as the status bar icon and is
     * expected to provide a background image (defaults to '').
     * Example usage:<pre><code>
// Example CSS rule:
.x-statusbar .x-status-custom {
    padding-left: 25px;
    background: transparent url(images/custom-icon.gif) no-repeat 3px 2px;
}

// Setting a default icon:
var sb = Ext.create('Ext.ux.StatusBar', {
    defaultIconCls: 'x-status-custom'
});

// Changing the icon:
sb.setStatus({
    text: 'New status',
    iconCls: 'x-status-custom'
});
</code></pre>
     */

    /**
     * @cfg {String} cls
     * The base class applied to the containing element for this component on render (defaults to 'x-statusbar')
     */
    cls : 'x-statusbar',
    /**
     * @cfg {String} busyIconCls
     * The default <code>{@link #iconCls}</code> applied when calling
     * <code>{@link #showBusy}</code> (defaults to <tt>'x-status-busy'</tt>).
     * It can be overridden at any time by passing the <code>iconCls</code>
     * argument into <code>{@link #showBusy}</code>.
     */
    busyIconCls : 'x-status-busy',
    /**
     * @cfg {String} busyText
     * The default <code>{@link #text}</code> applied when calling
     * <code>{@link #showBusy}</code> (defaults to <tt>'Loading...'</tt>).
     * It can be overridden at any time by passing the <code>text</code>
     * argument into <code>{@link #showBusy}</code>.
     */
    busyText : 'Loading...',
    /**
     * @cfg {Number} autoClear
     * The number of milliseconds to wait after setting the status via
     * <code>{@link #setStatus}</code> before automatically clearing the status
     * text and icon (defaults to <tt>5000</tt>).  Note that this only applies
     * when passing the <tt>clear</tt> argument to <code>{@link #setStatus}</code>
     * since that is the only way to defer clearing the status.  This can
     * be overridden by specifying a different <tt>wait</tt> value in
     * <code>{@link #setStatus}</code>. Calls to <code>{@link #clearStatus}</code>
     * always clear the status bar immediately and ignore this value.
     */
    autoClear : 5000,

    /**
     * @cfg {String} emptyText
     * The text string to use if no text has been set.  Defaults to
     * <tt>'&nbsp;'</tt>).  If there are no other items in the toolbar using
     * an empty string (<tt>''</tt>) for this value would end up in the toolbar
     * height collapsing since the empty string will not maintain the toolbar
     * height.  Use <tt>''</tt> if the toolbar should collapse in height
     * vertically when no text is specified and there are no other items in
     * the toolbar.
     */
    emptyText : '&nbsp;',

    // private
    activeThreadId : 0,

    // private
    initComponent : function(){
        if (this.statusAlign === 'right') {
            this.cls += ' x-status-right';
        }
        this.callParent(arguments);
    },

    // private
    afterRender : function(){
        this.callParent(arguments);

        var right = this.statusAlign === 'right';
        this.currIconCls = this.iconCls || this.defaultIconCls;
        this.statusEl = Ext.create('Ext.toolbar.TextItem', {
            cls: 'x-status-text ' + (this.currIconCls || ''),
            text: this.text || this.defaultText || ''
        });

        if (right) {
            this.add('->');
            this.add(this.statusEl);
        } else {
            this.insert(0, this.statusEl);
            this.insert(1, '->');
        }
        this.height = 27;
        this.doLayout();
    },

    /**
     * Sets the status {@link #text} and/or {@link #iconCls}. Also supports automatically clearing the
     * status that was set after a specified interval.
     * @param {Object/String} config A config object specifying what status to set, or a string assumed
     * to be the status text (and all other options are defaulted as explained below). A config
     * object containing any or all of the following properties can be passed:<ul>
     * <li><tt>text</tt> {String} : (optional) The status text to display.  If not specified, any current
     * status text will remain unchanged.</li>
     * <li><tt>iconCls</tt> {String} : (optional) The CSS class used to customize the status icon (see
     * {@link #iconCls} for details). If not specified, any current iconCls will remain unchanged.</li>
     * <li><tt>clear</tt> {Boolean/Number/Object} : (optional) Allows you to set an internal callback that will
     * automatically clear the status text and iconCls after a specified amount of time has passed. If clear is not
     * specified, the new status will not be auto-cleared and will stay until updated again or cleared using
     * {@link #clearStatus}. If <tt>true</tt> is passed, the status will be cleared using {@link #autoClear},
     * {@link #defaultText} and {@link #defaultIconCls} via a fade out animation. If a numeric value is passed,
     * it will be used as the callback interval (in milliseconds), overriding the {@link #autoClear} value.
     * All other options will be defaulted as with the boolean option.  To customize any other options,
     * you can pass an object in the format:<ul>
     *    <li><tt>wait</tt> {Number} : (optional) The number of milliseconds to wait before clearing
     *    (defaults to {@link #autoClear}).</li>
     *    <li><tt>anim</tt> {Number} : (optional) False to clear the status immediately once the callback
     *    executes (defaults to true which fades the status out).</li>
     *    <li><tt>useDefaults</tt> {Number} : (optional) False to completely clear the status text and iconCls
     *    (defaults to true which uses {@link #defaultText} and {@link #defaultIconCls}).</li>
     * </ul></li></ul>
     * Example usage:<pre><code>
// Simple call to update the text
statusBar.setStatus('New status');

// Set the status and icon, auto-clearing with default options:
statusBar.setStatus({
    text: 'New status',
    iconCls: 'x-status-custom',
    clear: true
});

// Auto-clear with custom options:
statusBar.setStatus({
    text: 'New status',
    iconCls: 'x-status-custom',
    clear: {
        wait: 8000,
        anim: false,
        useDefaults: false
    }
});
</code></pre>
     * @return {Ext.ux.StatusBar} this
     */
    setStatus : function(o) {
        o = o || {};

        if (Ext.isString(o)) {
            o = {text:o};
        }
        if (o.text !== undefined) {
            this.setText(o.text);
        }
        if (o.iconCls !== undefined) {
            this.setIcon(o.iconCls);
        }

        if (o.clear) {
            var c = o.clear,
                wait = this.autoClear,
                defaults = {useDefaults: true, anim: true};

            if (Ext.isObject(c)) {
                c = Ext.applyIf(c, defaults);
                if (c.wait) {
                    wait = c.wait;
                }
            } else if (Ext.isNumber(c)) {
                wait = c;
                c = defaults;
            } else if (Ext.isBoolean(c)) {
                c = defaults;
            }

            c.threadId = this.activeThreadId;
            Ext.defer(this.clearStatus, wait, this, [c]);
        }
        this.doLayout();
        return this;
    },

    /**
     * Clears the status {@link #text} and {@link #iconCls}. Also supports clearing via an optional fade out animation.
     * @param {Object} config (optional) A config object containing any or all of the following properties.  If this
     * object is not specified the status will be cleared using the defaults below:<ul>
     * <li><tt>anim</tt> {Boolean} : (optional) True to clear the status by fading out the status element (defaults
     * to false which clears immediately).</li>
     * <li><tt>useDefaults</tt> {Boolean} : (optional) True to reset the text and icon using {@link #defaultText} and
     * {@link #defaultIconCls} (defaults to false which sets the text to '' and removes any existing icon class).</li>
     * </ul>
     * @return {Ext.ux.StatusBar} this
     */
    clearStatus : function(o) {
        o = o || {};

        if (o.threadId && o.threadId !== this.activeThreadId) {
            // this means the current call was made internally, but a newer
            // thread has set a message since this call was deferred.  Since
            // we don't want to overwrite a newer message just ignore.
            return this;
        }

        var text = o.useDefaults ? this.defaultText : this.emptyText,
            iconCls = o.useDefaults ? (this.defaultIconCls ? this.defaultIconCls : '') : '';

        if (o.anim) {
            // animate the statusEl Ext.Element
            this.statusEl.el.puff({
                remove: false,
                useDisplay: true,
                scope: this,
                callback: function(){
                    this.setStatus({
                     text: text,
                     iconCls: iconCls
                 });

                    this.statusEl.el.show();
                }
            });
        } else {
            // hide/show the el to avoid jumpy text or icon
             this.statusEl.hide();
             this.setStatus({
                 text: text,
                 iconCls: iconCls
             });
             this.statusEl.show();
        }
        this.doLayout();
        return this;
    },

    /**
     * Convenience method for setting the status text directly.  For more flexible options see {@link #setStatus}.
     * @param {String} text (optional) The text to set (defaults to '')
     * @return {Ext.ux.StatusBar} this
     */
    setText : function(text){
        this.activeThreadId++;
        this.text = text || '';
        if (this.rendered) {
            this.statusEl.setText(this.text);
        }
        return this;
    },

    /**
     * Returns the current status text.
     * @return {String} The status text
     */
    getText : function(){
        return this.text;
    },

    /**
     * Convenience method for setting the status icon directly.  For more flexible options see {@link #setStatus}.
     * See {@link #iconCls} for complete details about customizing the icon.
     * @param {String} iconCls (optional) The icon class to set (defaults to '', and any current icon class is removed)
     * @return {Ext.ux.StatusBar} this
     */
    setIcon : function(cls){
        this.activeThreadId++;
        cls = cls || '';

        if (this.rendered) {
         if (this.currIconCls) {
             this.statusEl.removeCls(this.currIconCls);
             this.currIconCls = null;
         }
         if (cls.length > 0) {
             this.statusEl.addCls(cls);
             this.currIconCls = cls;
         }
        } else {
            this.currIconCls = cls;
        }
        return this;
    },

    /**
     * Convenience method for setting the status text and icon to special values that are pre-configured to indicate
     * a "busy" state, usually for loading or processing activities.
     * @param {Object/String} config (optional) A config object in the same format supported by {@link #setStatus}, or a
     * string to use as the status text (in which case all other options for setStatus will be defaulted).  Use the
     * <tt>text</tt> and/or <tt>iconCls</tt> properties on the config to override the default {@link #busyText}
     * and {@link #busyIconCls} settings. If the config argument is not specified, {@link #busyText} and
     * {@link #busyIconCls} will be used in conjunction with all of the default options for {@link #setStatus}.
     * @return {Ext.ux.StatusBar} this
     */
    showBusy : function(o){
        if (Ext.isString(o)) {
            o = { text: o };
        }
        o = Ext.applyIf(o || {}, {
            text: this.busyText,
            iconCls: this.busyIconCls
        });
        return this.setStatus(o);
    }
});


/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
/**
 * @class Ext.ux.TabCloseMenu
 * Plugin (ptype = 'tabclosemenu') for adding a close context menu to tabs. Note that the menu respects
 * the closable configuration on the tab. As such, commands like remove others and remove all will not
 * remove items that are not closable.
 *
 * @constructor
 * @param {Object} config The configuration options
 * @ptype tabclosemenu
 */
Ext.define('Ext.tab.TabCloseMenu', {
    alias: 'plugin.tabclosemenu',
    alternateClassName: 'Ext.ux.TabCloseMenu',

    mixins: {
        observable: 'Ext.util.Observable'
    },

    /**
     * @cfg {String} closeTabText
     * The text for closing the current tab. Defaults to <tt>'Close Tab'</tt>.
     */
    closeTabText: 'Close Tab',

    /**
     * @cfg {Boolean} showCloseOthers
     * Indicates whether to show the 'Close Others' option. Defaults to <tt>true</tt>.
     */
    showCloseOthers: true,

    /**
     * @cfg {String} closeOtherTabsText
     * The text for closing all tabs except the current one. Defaults to <tt>'Close Other Tabs'</tt>.
     */
    closeOthersTabsText: 'Close Other Tabs',

    /**
     * @cfg {Boolean} showCloseAll
     * Indicates whether to show the 'Close All' option. Defaults to <tt>true</tt>.
     */
    showCloseAll: true,

    /**
     * @cfg {String} closeAllTabsText
     * <p>The text for closing all tabs. Defaults to <tt>'Close All Tabs'</tt>.
     */
    closeAllTabsText: 'Close All Tabs',

    /**
     * @cfg {Array} extraItemsHead
     * An array of additional context menu items to add to the front of the context menu.
     */
    extraItemsHead: null,

    /**
     * @cfg {Array} extraItemsTail
     * An array of additional context menu items to add to the end of the context menu.
     */
    extraItemsTail: null,

    //public
    constructor: function (config) {
        this.addEvents(
            'aftermenu',
            'beforemenu');

        this.mixins.observable.constructor.call(this, config);
    },

    init : function(tabpanel){
        this.tabPanel = tabpanel;
        this.tabBar = tabpanel.down("tabbar");

        this.mon(this.tabPanel, {
            scope: this,
            afterlayout: this.onAfterLayout,
            single: true
        });
    },

    onAfterLayout: function() {
        this.mon(this.tabBar.el, {
            scope: this,
            contextmenu: this.onContextMenu,
            delegate: 'div.x-tab'
        });
    },

    onBeforeDestroy : function(){
        Ext.destroy(this.menu);
        this.callParent(arguments);
    },

    // private
    onContextMenu : function(event, target){
        var me = this,
            menu = me.createMenu(),
            disableAll = true,
            disableOthers = true,
            tab = me.tabBar.getChildByElement(target),
            index = me.tabBar.items.indexOf(tab);

        me.item = me.tabPanel.getComponent(index);
        menu.child('*[text="' + me.closeTabText + '"]').setDisabled(!me.item.closable);

        if (me.showCloseAll || me.showCloseOthers) {
            me.tabPanel.items.each(function(item) {
                if (item.closable) {
                    disableAll = false;
                    if (item != me.item) {
                        disableOthers = false;
                        return false;
                    }
                }
                return true;
            });

            if (me.showCloseAll) {
                menu.child('*[text="' + me.closeAllTabsText + '"]').setDisabled(disableAll);
            }

            if (me.showCloseOthers) {
                menu.child('*[text="' + me.closeOthersTabsText + '"]').setDisabled(disableOthers);
            }
        }

        event.preventDefault();
        me.fireEvent('beforemenu', menu, me.item, me);

        menu.showAt(event.getXY());
    },

    createMenu : function() {
        var me = this;

        if (!me.menu) {
            var items = [{
                text: me.closeTabText,
                scope: me,
                handler: me.onClose
            }];

            if (me.showCloseAll || me.showCloseOthers) {
                items.push('-');
            }

            if (me.showCloseOthers) {
                items.push({
                    text: me.closeOthersTabsText,
                    scope: me,
                    handler: me.onCloseOthers
                });
            }

            if (me.showCloseAll) {
                items.push({
                    text: me.closeAllTabsText,
                    scope: me,
                    handler: me.onCloseAll
                });
            }

            if (me.extraItemsHead) {
                items = me.extraItemsHead.concat(items);
            }

            if (me.extraItemsTail) {
                items = items.concat(me.extraItemsTail);
            }

            me.menu = Ext.create('Ext.menu.Menu', {
                items: items,
                listeners: {
                    hide: me.onHideMenu,
                    scope: me
                }
            });
        }

        return me.menu;
    },

    onHideMenu: function () {
        var me = this;

        me.item = null;
        me.fireEvent('aftermenu', me.menu, me);
    },

    onClose : function(){
        this.tabPanel.remove(this.item);
    },

    onCloseOthers : function(){
        this.doClose(true);
    },

    onCloseAll : function(){
        this.doClose(false);
    },

    doClose : function(excludeActive){
        var items = [];

        this.tabPanel.items.each(function(item){
            if(item.closable){
                if(!excludeActive || item != this.item){
                    items.push(item);
                }
            }
        }, this);

        Ext.each(items, function(item){
            this.tabPanel.remove(item);
        }, this);
    }
});


