## API

## configuration - `log4js.configure(object || string)`

There is one entry point for configuring log4js. A string argument is treated as a filename to load configuration from. Config files should be JSON, and contain a configuration object (see format below). You can also pass a configuration object directly to `configure`.

Configuration should take place immediately after requiring log4js for the first time in your application. If you do not call `configure`, log4js will use `LOG4JS_CONFIG` (if defined) or the default config. The default config defines one appender, which would log to stdout with the coloured layout, but also defines the default log level to be `OFF` - which means no logs will be output.

If you are using `cluster`, then include the call to `configure` in the worker processes as well as the master. That way the worker processes will pick up the right levels for your categories, and any custom levels you may have defined. Appenders will only be defined on the master process, so there is no danger of multiple processes attempting to write to the same appender. No special configuration is needed to use log4js with clusters, unlike previous versions.

Configuration objects must define at least one appender, and a default category. Log4js will throw an exception if the configuration is invalid.

`configure` method call returns the configured log4js object.

### Configuration Object

Properties:

- `levels` (optional, object) - used for defining custom log levels, or redefining existing ones; this is a map with the level name as the key (string, case insensitive), and an object as the value. The object should have two properties: the level value (integer) as the value, and the colour. Log levels are used to assign importance to log messages, with the integer value being used to sort them. If you do not specify anything in your configuration, the default values are used (ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF - note that OFF is intended to be used to turn off logging, not as a level for actual logging, i.e. you would never call `logger.off('some log message')`). Levels defined here are used in addition to the default levels, with the integer value being used to determine their relation to the default levels. If you define a level with the same name as a default level, then the integer value in the config takes precedence. Level names must begin with a letter, and can only contain letters, numbers and underscores.
- `appenders` (object) - a map of named appenders (string) to appender definitions (object); appender definitions must have a property `type` (string) - other properties depend on the appender type.
- `categories` (object) - a map of named categories (string) to category definitions (object). You must define the `default` category which is used for all log events that do not match a specific category. Category definitions have two properties:
  - `appenders` (array of strings) - the list of appender names to be used for this category. A category must have at least one appender.
  - `level` (string, case insensitive) - the minimum log level that this category will send to the appenders. For example, if set to 'error' then the appenders will only receive log events of level 'error', 'fatal', 'mark' - log events of 'info', 'warn', 'debug', or 'trace' will be ignored.
  - `enableCallStack` (boolean, optional, defaults to `false`) - setting this to `true` will make log events for this category use the call stack to generate line numbers and file names in the event. See [pattern layout](layouts.md) for how to output these values in your appenders.
- `pm2` (boolean) (optional) - set this to true if you're running your app using [pm2](http://pm2.keymetrics.io), otherwise logs will not work (you'll also need to install pm2-intercom as pm2 module: `pm2 install pm2-intercom`)
- `pm2InstanceVar` (string) (optional, defaults to 'NODE_APP_INSTANCE') - set this if you're using pm2 and have changed the default name of the NODE_APP_INSTANCE variable.
- `disableClustering` (boolean) (optional) - set this to true if you liked the way log4js used to just ignore clustered environments, or you're having trouble with PM2 logging. Each worker process will do its own logging. Be careful with this if you're logging to files, weirdness can occur.

## Loggers - `log4js.getLogger([category])`

This function takes a single optional string argument to denote the category to be used for log events on this logger. If no category is specified, the events will be routed to the appender for the `default` category. The function returns a `Logger` object which has its level set to the level specified for that category in the config and implements the following functions:

- `<level>(args...)` - where `<level>` can be any of the lower case names of the levels (including any custom levels defined). For example: `logger.info('some info')` will dispatch a log event with a level of info. If you're using the basic, coloured or message pass-through [layouts](layouts.md), the logged string will have its formatting (placeholders like `%s`, `%d`, etc) delegated to [util.format](https://nodejs.org/api/util.html#util_util_format_format_args).
- `is<level>Enabled()` - returns true if a log event of level <level> (camel case) would be dispatched to the appender defined for the logger's category. For example: `logger.isInfoEnabled()` will return true if the level for the logger is INFO or lower.
- `addContext(<key>,<value>)` - where `<key>` is a string, `<value>` can be anything. This stores a key-value pair that is added to all log events generated by the logger. Uses would be to add ids for tracking a user through your application. Currently only the `logFaces` appenders make use of the context values.
- `removeContext(<key>)` - removes a previously defined key-value pair from the context.
- `clearContext()` - removes all context pairs from the logger.
- `setParseCallStackFunction(function)` - Allow to override the default way to parse the callstack data for the layout pattern, a generic javascript Error object is passed to the function. Must return an object with properties : `functionName` / `fileName` / `lineNumber` / `columnNumber` / `callStack`. Can for example be used if all of your log call are made from one "debug" class and you would to "erase" this class from the callstack to only show the function which called your "debug" class.

The `Logger` object has the following properties:

- `level` - where `level` is a log4js level or a string that matches a level (e.g. 'info', 'INFO', etc). This allows overriding the configured level for this logger. Changing this value applies to all loggers of the same category.
- `useCallStack` - where `useCallStack` is a boolean to indicate if log events for this category use the call stack to generate line numbers and file names in the event. This allows overriding the configured useCallStack for this logger. Changing this value applies to all loggers of the same category.

## Shutdown - `log4js.shutdown(cb)`

`shutdown` accepts a callback that will be called when log4js has closed all appenders and finished writing log events. Use this when your programme exits to make sure all your logs are written to files, sockets are closed, etc.

## Custom Layouts - `log4js.addLayout(type, fn)`

This function is used to add user-defined layout functions. See [layouts](layouts.md) for more details and an example.
