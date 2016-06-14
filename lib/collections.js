Schemas = {};

// all air monitoring sites based on EPA listing + additional ones
Sites = new Mongo.Collection('sites');
// live data pushed to our server
LiveData = new Mongo.Collection('livedata');
// aggregated data produced by our server
AggrData = new Mongo.Collection('aggregatedata5min');
// collection used for charts only (aggregation of data in the right format)
DataSeries = new Mongo.Collection('dataSeries');
// collection used for charts only (composite data in the right format)
CompositeDataSeries = new Mongo.Collection('compositeDataSeries');
// collection used to show edited points for all sites in data management
EditedPoints = new Mongo.Collection('editedPoints');
// stored records for exported data
Exports = new Mongo.Collection('exports');
