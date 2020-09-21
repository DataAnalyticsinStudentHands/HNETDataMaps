import chokidar from 'chokidar';
import pathModule from 'path';
import { logger } from 'meteor/votercircle:winston';
import { globalsite } from '../startup/server/startup';
import { readFile } from './commonFunctions';

const liveWatcher = chokidar.watch(`/hnet/incoming/current/${globalsite.incoming}`, {
  ignored: /[\/\\]\./,
  ignoreInitial: true,
  usePolling: true,
  persistent: true
});

liveWatcher.on('add', (path) => {
  logger.info('File ', path, ' has been added.');
  const pathArray = path.split(pathModule.sep);
  const fileName = pathArray[pathArray.length - 1];
  const siteId = fileName.split(/[_]+/)[1];
  const parentDir = pathArray[pathArray.length - 2];
  const test = parentDir.split(/[_]+/)[1];

  if (siteId === test || fileName.startsWith('TAP')) {
    readFile(path);
  }
}).on('change', (path) => {
  logger.info('File', path, 'has been changed');
  readFile(path);
}).on('addDir', (path) => {
  logger.info('Directory', path, 'has been added');
}).on('error', (error) => {
  logger.error('Error happened', error);
}).on('ready', () => {
  logger.info(`Ready for changes in /hnet/incoming/current/${globalsite.incoming}`);
});
