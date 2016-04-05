//pushing data to TCEQ via sftp
import {FTPS} from 'ftps';

var hnetsftp = process.env.hnetsftp;
if (typeof(hnetsftp) === 'undefined') {
  // hnetsftp environment variables doesn't exists
  logger.error("No password found for hnet sftp.");
} else {
    var ftps = new FTPS({
  host: 'domain.com', // required 
  username: 'Test', // required 
  password: hnetsftp, // required 
  protocol: 'sftp', // optional, values : 'ftp', 'sftp', 'ftps',... default is 'ftp' 
  // protocol is added on beginning of host, ex : sftp://domain.com in this case 
  port: 22, // optional 
  // port is added to the end of the host, ex: sftp://domain.com:22 in this case 
  escape: true, // optional, used for escaping shell characters (space, $, etc.), default: true 
  retries: 2, // Optional, defaults to 1 (1 = no retries, 0 = unlimited retries) 
  timeout: 10,
  requiresPassword: true, // Optional, defaults to true 
  autoConfirm: true, // Optional, is used to auto confirm ssl questions on sftp or fish protocols, defaults to false 
  cwd: '' // Optional, defaults to the directory from where the script is executed 
});

//ftps.cd('some_directory').addFile(__dirname + '/test.txt').exec(logger.info);
}


