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