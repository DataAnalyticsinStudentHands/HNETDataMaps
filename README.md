# DataMaps
Type in "meteor" in Terminal to start the program.

The map shows 5 locations in Houston with meteorology info. At the moment the info are hard-coded for each sites, but it is supposed to show the latest conditions.

The map also shows 15 locations surrounding Austin, this is done by taking advantages of mongoDB $near query. The idea of this is to show only a certain number (changeable) of stations closest to user's current location in order to reduce the load on the client side.

Click on the UH-Main campus marker will zoom the map into the Main Campus area, click on "Click here for details" will display detail info of the location.

Type in http://localhost:3000/history to open a page to query out historical data. Users will input location, date/time, and duration (24, 48 hours, or 1, 3 6 months...),  it will show the data over the chosen time. Since the dataset for 2014 is large (around 28 million records ~ 3.2GB), we can't push the whole database onto Github. However, it was tested on localhost using the existing 2014 dataset on TCAN migrated to mongoDB by using mongoimport, query results was displayed almost instantly (ensureIndex must be executed after import the data). 

