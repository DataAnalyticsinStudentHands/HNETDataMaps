// collection used to show edited points for all live sites in data management
export const AggrEdits = new Mongo.Collection('aggregateEdits');

// collection used for charts only (aggregation of data in the right format)
export const DataSeries = new Mongo.Collection('dataSeries');

// collection used for bc2 charts only (aggregation of data in the right format)
export const Bc2DataSeries = new Mongo.Collection('bc2DataSeries');

// collection used for charts only (composite data in the right format)
export const CompositeDataSeries = new Mongo.Collection('compositeDataSeries');

// collection used for charts only (composite data in the right format)
export const CompositeCampusDataSeries = new Mongo.Collection('compositeCampusDataSeries');

// collection used for charts only (composite group data in the right format)
export const CompositeGroupDataSeries = new Mongo.Collection('compositeGroupDataSeries');

// collection used for charts only (public data in the right format)
export const PublicDataSeries = new Mongo.Collection('publicDataSeries');

// placeholder for EditPoints in modal
export const EditPoints = new Mongo.Collection(null);
