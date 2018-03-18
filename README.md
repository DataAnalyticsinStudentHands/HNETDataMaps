# HNETDataMaps Client

This is the web frontend for a data processing framework for atmospheric sensors who can monitor and edit their data.

The documentation for end users can be found in the Wiki.

The following instructions are for developers who want to setup their own version. This is a [meteor](https://www.meteor.com/) based framework.

## Prerequisites

* Data Folder: The framework expects a certain data folder structure. `/hnet/incoming/current` + `/hnet/outgoing/current` should exist. Those locations are hard coded and need be changed if desired.

* We are running with a local [MongoDB](https://docs.mongodb.org/manual/installation/)

to install e.g on Mac OS install via [homebrew](http://brew.sh/):

`brew install mongodb`

* [meteor](https://www.meteor.com/install)

to install e.g. on Mac OS or Linux:

`curl https://install.meteor.com/ | sh`

* For pushing data out, the server is using [lftp](https://lftp.yar.ru/) which must be installed.


## Getting started

Clone and run: `meteor npm install`


## Testing in local development environment

`MONGO_URL=mongodb://localhost:27017/DataMaps meteor`

For debugging with node inspector run `MONGO_URL=mongodb://localhost:27017/DataMaps meteor debug` and open the app in Chrome with the port listed once the app has started.

## Deployment with PM2

* change into the working directory and run `meteor build ..` - this will generate a *.tar .gz file
* move the file to the install location and extract it (you will end up with a `bundle` directory
* `cd bundle/programs/server/` and `npm install`
* generate a configuration file for PM2 (see example [gist](https://gist.github.com/fcbee3b520b4fdf97552.git)) outside of bundle
* run `pm2 start [your_pm2_conf_file] --node-args="--max_old_space_size=6144"`
