// collection used to show edited points for all live sites in data management
export const AggrEdits = new Mongo.Collection('aggregateEdits');

// collection used for charts only (aggregation of data in the right format)
export const DataSeries = new Mongo.Collection('dataSeries');

// collection used for charts only (composite data in the right format)
export const CompositeDataSeries = new Mongo.Collection('compositeDataSeries');

// collection used for charts only (composite data in the right format)
export const CompositeCampusDataSeries = new Mongo.Collection('compositeCampusDataSeries');

// collection used for charts only (public data in the right format)
export const PublicDataSeries = new Mongo.Collection('publicDataSeries');
