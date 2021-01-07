import { SimpleSchema } from 'meteor/aldeed:simple-schema';

// all air monitoring sites pushing to us
export const LiveSites = new Mongo.Collection('livesites');

// schema for the LiveSites collection, used in admin UI
const SitesSchema = new SimpleSchema({
  siteName: {
    type: String,
    label: 'Site Name',
    max: 100
  },
  siteGroup: {
    type: String,
    label: 'Site Group',
    max: 10,
    autoform: {
      options: [
        {
          label: 'HNET',
          value: 'HNET'
        }, {
          label: 'BC2',
          value: 'BC2'
        }
      ]
    }
  },
  AQSID: {
    type: String,
    label: 'AQSID',
    max: 10
  },
  Channels: {
    type: Array
  },
  'Channels.$': {
    type: Object,
    optional: true
  },
  'Channels.$.Header': {
    type: String,
    optional: true,
    label: 'Channel Header (instrument):'
  },
  'Channels.$.Name': {
    type: String,
    optional: true,
    label: 'Channel Name (measurement):'
  },
  'Channels.$.Status': {
    type: String,
    optional: true,
    label: 'Channel Status:',
    max: 10,
    autoform: {
      options: [
        {
          label: 'Active',
          value: 'Active'
        }, {
          label: 'Inactive',
          value: 'Inactive'
        }
      ]
    }
  },
  'Channels.$.Threshold.Bounds': {
    type: String,
    optional: true,
    label: 'Lesser or greater:',
    autoform: {
      options: [
        {
          label: '<',
          value: 'Lesser'
        }, {
          label: '>',
          value: 'Greater'
        }
      ]
    }
  },
  'Channels.$.Threshold.Value': {
    type: String,
    optional: true,
    label: 'Threshold:'
  },
  TAPInstruments: {
    type: Array,
    optional: true,
    maxCount: 1,
    minCount: 1
  },
  'TAPInstruments.$': {
    type: Object,
    optional: true
  },
  'TAPInstruments.$.TAP01': {
    type: String,
    optional: true,
    label: 'Serial for TAP01:'
  },
  'TAPInstruments.$.TAP02': {
    type: String,
    optional: true,
    label: 'Serial for TAP02:'
  },
  'loc.type': {
    type: String,
    autoValue: function() {
      return 'Point';
    }
  },
  'loc.coordinates': {
    type: [Number],
    decimal: true,
    label: 'Coordinates array'
  },
  'GMT offset': {
    optional: true,
    type: String
  },
  'site code': {
    optional: true,
    type: String
  },
  agencyID: {
    optional: true,
    type: String
  },
  country: {
    optional: true,
    type: String
  },
  state: {
    optional: true,
    type: String
  },
  city: {
    label: 'City',
    type: String,
    optional: true
  },
  elevation: {
    type: String,
    optional: true
  },
  'externalLink.href': {
    optional: true,
    type: String,
    label: 'href, e.g. http://site.com/page'
  },
  'externalLink.name': {
    optional: true,
    type: String,
    label: 'Label'
  },
  status: {
    type: String,
    max: 10,
    autoform: {
      options: [
        {
          label: 'Active',
          value: 'Active'
        }, {
          label: 'Inactive',
          value: 'Inactive'
        }
      ]
    }
  },
  TCEQPushing: {
    type: String,
    max: 10,
    autoform: {
      options: [
        {
          label: 'Active',
          value: 'Active'
        }, {
          label: 'Inactive',
          value: 'Inactive'
        }
      ]
    }
  },
  statusCheckInterval: {
    label: 'Status Check Interval [minutes]',
    type: Number
  },
  incoming: {
    type: String
  },
  lastPushEpoch: {
    optional: true,
    type: SimpleSchema.Integer
  },
  lastUpdateEpoch: {
    optional: true,
    type: SimpleSchema.Integer
  },
  lastManualPushEpoch: {
    optional: true,
    type: SimpleSchema.Integer
  },
  footerText: {
    label: 'Footer Text',
    optional: true,
    type: String
  },
  compositeColor: {
    label: 'Color used in Composite Plot [#HEX]',
    type: String
  }
});

LiveSites.attachSchema(SitesSchema);

// live data pushed to our server
export const LiveData = new Mongo.Collection('livedata');

// aggregated data produced by our server
export const AggrData = new Mongo.Collection('aggregatedata5min');

// stored records for exported data
export const Exports = new Mongo.Collection('exports');
