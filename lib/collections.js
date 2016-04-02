Schemas = {};

//all air monitoring sites based on EPA listing + additional ones
Sites = new Mongo.Collection('sites');
//live data pushed to our server
LiveData = new Mongo.Collection('livedata');
//aggregated data produced by our server
AggrData = new Mongo.Collection('aggregatedata5min');
//collection used for charts only (aggregation of data in the right format)
DataSeries = new Mongo.Collection('dataSeries');

//schema for the Sites collection, used in admin UI
SitesSchema = new SimpleSchema({
    AQSID: {
        type: String,
        label: 'AQSID:',
        max: 10
    },
    parameters: {
        type: Array
    },
    "parameters.$": {
        type: Object
    },
    "parameters.$.parameter name": {
        type: String,
        label: 'Parameter Name:'
    },
    "loc.type": {
        type: String,
        autoValue: function () {
            return 'Point';
        }
    },
    "loc.coordinates": {
        type: [Number],
        decimal: true,
        label: 'Coordinates array'
    },
    "GMT offset": {
        type: String
    },
    "site code": {
        type: String
    },
    "site name": {
        type: String,
        label: 'Site Name:',
        max: 100
    },
    "agencyID": {
        type: String
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    elevation: {
        type: String
    },
    status: {
        type: String,
        max: 10,
        autoform: {
            options: [
                {
                    label: "Active",
                    value: "Active"
                },
                {
                    label: "Inactive",
                    value: "Inactive"
                }
      ]
        }
    }
});

Sites.attachSchema(SitesSchema);