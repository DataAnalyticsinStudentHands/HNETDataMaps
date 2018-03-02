// collection used to show edited points for all live sites in data management
AggrEdits = new Mongo.Collection('aggregateEdits');

// collection used for charts only (aggregation of data in the right format)
DataSeries = new Mongo.Collection('dataSeries');

// collection used for charts only (composite data in the right format)
CompositeDataSeries = new Mongo.Collection('compositeDataSeries');

// collection used for charts only (public data in the right format)
PublicDataSeries = new Mongo.Collection('publicDataSeries');
