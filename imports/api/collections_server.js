import { Mongo } from 'meteor/mongo';

// all air monitoring sites pushing to us
export const LiveSites = new Mongo.Collection('livesites');

// live data pushed to our server
export const LiveData = new Mongo.Collection('livedata');

// aggregated data produced by our server
export const AggrData = new Mongo.Collection('aggregatedata5min');

// stored records for exported data
export const Exports = new Mongo.Collection('exports');
