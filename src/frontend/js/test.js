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