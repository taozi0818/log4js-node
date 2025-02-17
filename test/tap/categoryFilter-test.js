const { test } = require('tap');
const log4js = require('../../lib/log4js');
const recording = require('../../lib/appenders/recording');

test('log4js categoryFilter', (batch) => {
  batch.beforeEach(() => {
    recording.reset();
  });

  batch.test('appender should exclude categories', (t) => {
    log4js.configure({
      appenders: {
        recorder: { type: 'recording' },
        filtered: {
          type: 'categoryFilter',
          exclude: 'web',
          appender: 'recorder',
        },
      },
      categories: { default: { appenders: ['filtered'], level: 'DEBUG' } },
    });

    const webLogger = log4js.getLogger('web');
    const appLogger = log4js.getLogger('app');

    webLogger.debug('This should not get logged');
    appLogger.debug('This should get logged');
    webLogger.debug('Hello again');
    log4js
      .getLogger('db')
      .debug('This should be included by the appender anyway');

    const logEvents = recording.replay();
    t.equal(logEvents.length, 2);
    t.equal(logEvents[0].data[0], 'This should get logged');
    t.equal(
      logEvents[1].data[0],
      'This should be included by the appender anyway'
    );
    t.end();
  });

  batch.test('appender should exclude categories', (t) => {
    log4js.configure({
      appenders: {
        recorder: { type: 'recording' },
        filtered: {
          type: 'categoryFilter',
          exclude: ['app', 'web'],
          appender: 'recorder',
        },
      },
      categories: { default: { appenders: ['filtered'], level: 'DEBUG' } },
    });

    const webLogger = log4js.getLogger('web');
    const appLogger = log4js.getLogger('app');

    webLogger.debug('This should not get logged');
    appLogger.debug('This should get logged');
    webLogger.debug('Hello again');
    log4js
      .getLogger('db')
      .debug('This should be included by the appender anyway');

    const logEvents = recording.replay();
    t.equal(logEvents.length, 1);
    t.equal(
      logEvents[0].data[0],
      'This should be included by the appender anyway'
    );
    t.end();
  });

  batch.test('should not really need a category filter any more', (t) => {
    log4js.configure({
      appenders: { recorder: { type: 'recording' } },
      categories: {
        default: { appenders: ['recorder'], level: 'DEBUG' },
        web: { appenders: ['recorder'], level: 'OFF' },
      },
    });
    const appLogger = log4js.getLogger('app');
    const webLogger = log4js.getLogger('web');

    webLogger.debug('This should not get logged');
    appLogger.debug('This should get logged');
    webLogger.debug('Hello again');
    log4js
      .getLogger('db')
      .debug('This should be included by the appender anyway');

    const logEvents = recording.replay();
    t.equal(logEvents.length, 2);
    t.equal(logEvents[0].data[0], 'This should get logged');
    t.equal(
      logEvents[1].data[0],
      'This should be included by the appender anyway'
    );
    t.end();
  });

  batch.end();
});
