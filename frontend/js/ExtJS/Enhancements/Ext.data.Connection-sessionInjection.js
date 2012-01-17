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