Schemas = {};

// all air monitoring sites based on EPA listing
Sites = new Mongo.Collection('sites');
// all air monitoring sites pushing to us
LiveSites = new Mongo.Collection('livesites');

// live data pushed to our server
LiveData = new Mongo.Collection('livedata');

// aggregated data produced by our server
AggrData = new Mongo.Collection('aggregatedata5min');

// collection used to show edited points for all live sites in data management
AggrEdits = new Mongo.Collection('aggregateEdits');

// collection used for charts only (aggregation of data in the right format)
DataSeries = new Mongo.Collection('dataSeries');

// collection used for charts only (composite data in the right format)
CompositeDataSeries = new Mongo.Collection('compositeDataSeries');

// collection used for charts only (public data in the right format)
PublicDataSeries = new Mongo.Collection('publicDataSeries');

// stored records for exported data
Exports = new Mongo.Collection('exports');
