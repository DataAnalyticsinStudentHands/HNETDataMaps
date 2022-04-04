# HNETDataMaps backendImport5minute Data

This is the backend to import data from atmospheric sensors who can monitor that doesn't need aggregationand. 

The documentation for end users can be found in the Wiki.

The following instructions are for developers who want to setup their own version. This is a simple Node based app. 


## Prerequisites

* Data Folder: The framework expects a certain data folder structure. `/hnet/incoming/current` + `/hnet/outgoing/current` should exist. Those locations are hard coded and need be changed if desired.

* We are running with a local [MongoDB](https://docs.mongodb.org/manual/installation/)

to install e.g on Mac OS install via [homebrew](http://brew.sh/):

`brew install mongodb`

* For pushing data out, the server is using [lftp](https://lftp.yar.ru/) which must be installed.


## Getting started

Clone and run: `npm install`


## Testing in local development environment

Define environment variables:

`MONGO_URL="mongodb://localhost:27017/DataMaps"`

`MONGO_NAME="DataMaps"`

`NODE_OPTIONS="--max_old_space_size=2048"`

Then run: `npm run start`


## For deployment with PM2

* Ensure that you have cloned it onto the server.
* `cd ~/bundle_backendImport5minuteData` and `npm install`
* generate a configuration file for PM2 (see example [gist](https://gist.github.com/fcbee3b520b4fdf97552.git)) outside of bundle
* run `pm2 start [your_pm2_conf_file] --node-args="--max_old_space_size=6144"`
