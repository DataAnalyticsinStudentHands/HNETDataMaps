# Fork: DataMaps

This is a development fork of the DataMaps repository. It expects a certain data folder structure.

Since we are planning to deploy on our own server, we should also run this with a local MongoDB instance for testing:

## Prerequisites

* [MongoDB](https://docs.mongodb.org/manual/installation/)

On Mac OS install via [homebrew](http://brew.sh/):

`brew install mongodb`

* [meteor](https://www.meteor.com/install) 

On Mac OS or Linux:

`curl https://install.meteor.com/ | sh`

* Data Folder: `/hnet/incoming/2015`

## Testing in local development environment

`MONGO_URL=mongodb://localhost:27017/DataMaps meteor`

## Deployment with PM2

* change into the working directory and run `meteor build .` - this will generate a *.tar .gz file
* move the file to the install location nd extract it (you will end up with a `bundle` directory
* `cd bundle/programs/server/` and `npm install`
* generate a configuration file for PM2 (see example [gist](https://gist.github.com/fcbee3b520b4fdf97552.git)) outside of bundle
* run `pm2 start [your_pm2_conf_file]`
