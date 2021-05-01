// global variables to be read from environment
//import { LiveSites } from '../../api/collections_server';

// Setting up directory in which this server expects incoming files (uses an environment variable)
//export const globalsite = LiveSites.findOne({ AQSID: `${process.env.aqsid}` });

// reading ftps password from environment
export const hnetsftp = process.env.hnetsftp;
