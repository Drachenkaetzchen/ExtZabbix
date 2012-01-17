Ext.override(Ext.data.proxy.Rest, {
	buildUrl: function(request) {
        var me        = this,
            operation = request.operation,
            records   = operation.records || [],
            record    = records[0],
            format    = me.format,
            url       = me.getUrl(request),
            id        = record ? record.getId() : operation.id;
        
            console.log(record);
        if (me.appendId && id) {
            if (!url.match(/\/$/)) {
                url += '/';
            }
            
            url += id;
        }
        
        if (format) {
            if (!url.match(/\.$/)) {
                url += '.';
            }
            
            url += format;
        }
        
        request.url = url;
        
        return me.callParent(arguments);
    }
});