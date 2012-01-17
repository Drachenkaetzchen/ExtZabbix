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