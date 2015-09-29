
Meteor.publish("LiveFeeds", function () {
        var now = new Date();
        var adayAgo = now.getTime()/1000 - 24*3600;
        console.log('timestamp: ' + adayAgo);
        return LiveFeedMonitors.find({'epoch': {$gt: adayAgo}}, 
									 {sort: {'epoch': -1}});
    });

var chokidar = Meteor.npmRequire('chokidar');
var _ = Meteor.npmRequire('underscore');
var fs = Meteor.npmRequire('fs');
var MongoClient = Meteor.npmRequire('mongodb').MongoClient;

//using winston.log instead of console.log
var winston = Meteor.npmRequire('winston');

winston.add(winston.transports.DailyRotateFile, { 
  filename: 'datamaps.log',
  dirname: '/home/hthoang6/datamapsLog/'
});
//starting watcher
var watcher = chokidar.watch('/hnet/incoming/2015/', {
  ignored: /[\/\\]\./,
  ignoreInitial: true,
  persistent: true
});
 
watcher
  .on('add', function(path) { 
   winston.log('info', "File", path, "has been added");
   watcher.add(path);
  })
  .on('change', function(path) { 
    winston.log('info', "File", path, "has been changed"); 
    processFile(path.toString());
  
  })   
  .on('addDir', function(path) { 
    winston.log('info', "Directory", path, "has been added");  
  })  
  .on('error', function(error) { winston.log('error', 'Error happened', error); })
  .on('ready', function() { winston.log('info', "Initial scan complete. Ready for changes."); })
 // .on('raw', function(event, path, details) { winston.log('Raw event info:', event, path, details); })

// Function to process a file
function processFile(file) {
  var jsonarray = [];
  MongoClient.connect('mongodb://127.0.0.1:27017/DataMaps', function(err, db) {    
    if (err) { 
    	winston.log('error', "Error connecting to mongodb", err);
    	throw err;
    };
    winston.log('info', "Connected to mongodb");
    winston.log('info', "Starting processing file ", file);
    var recordArray = fs.readFileSync(file).toString().split("\r\n");
            for (i in recordArray) {
                    recordArray[i] = recordArray[i].split(",");
            };
            var key = recordArray[0];
            recordArray.splice(0,1); recordArray.splice(recordArray.length-1);
            
      for (i in recordArray) {
            var tempRecord = _.object(key, recordArray[i]);
            var temp = file.split('/');
            tempRecord['siteRef'] = temp[temp.length-2];
            tempRecord['epoch'] = parseInt((tempRecord['TheTime'] - 25569) * 86400) + 6*3600;
		  			
		  			//categorizing record type
		  			if (tempRecord.epoch % 300 <= 9) {
						//report2TCEQ(tempRecord);  // report before adding type
						  db.collection('LiveData5min').update({'siteRef': tempRecord.siteRef, 'epoch': tempRecord.epoch}, {$setOnInsert: tempRecord}, {upsert: true}, function(err) {
                //if (err) console.log(err); 
              });
					  } ;						
            jsonarray.push(tempRecord);
            };
      // Adding json array into the database      
      for (i in jsonarray) {
        db.collection('LiveData').update({'siteRef': jsonarray[i].siteRef, 'epoch': jsonarray[i].epoch}, {$setOnInsert: jsonarray[i]}, {upsert: true}, function(err) {
                  //if (err) console.log(err); 
        });    
      };
    winston.log('info',"Done! Closing mongodb...");
    db.close();
    winston.log('info', "mognodb closed!");
  });
};
 
function report2TCEQ(aRecord) {
	var tempString;
	for (var attrib in aRecord) {
		tempString += aRecord[attrib];
		tempString += ','
	}
	tempString.slice(0, -1);
	tempString+= '\n';
	
	fs.appendFile('/home/hthoang6/TCEQreport/sampleReport.txt', tempString, 'utf8', function(err) {
		if (err) {
			winston.log('error', "Something wrong, can't append to file!");
			throw err;
		}
		winston.log('info', "data has been appended to a file");
	})
};
