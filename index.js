var path = require('path');
var chokidar = require('chokidar');
var remapIstanbul = require('remap-istanbul');

var KarmaRemapIstanbul = function (baseReporterDecorator, config) {
  baseReporterDecorator(this);

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var source = path.normalize(remapIstanbulReporterConfig.src) || null;
  var reports = remapIstanbulReporterConfig.reports || {};
  var timeoutNotCreated = remapIstanbulReporterConfig.timeoutNotCreated || 1000;

  var reportFinished = function () { };
  var timeoutNotCreatedInstance;

  this.onBrowserComplete = function (browser) {
    if (!source) return;

    // Extract directory path from file path
    // Unfortunately `chokidar` - as well as other file watcher libs - doesn't
    // work well on folders that haven't yet being created at instantiation time.
    // As a work-around we watch the directory rather than the full filepath.
    // See links below for more info:
    // https://github.com/paulmillr/chokidar/issues/462
    // https://github.com/paulmillr/chokidar/issues/346
    var dir = path.dirname(source);

    // If there's no folder in the filepath - eg. `example.json` than we
    // use the filename itself.
    dir === '.' ? source : dir;

    // Add watcher for source file/folder
    var watcher = chokidar
      .watch(dir, {
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        },
        usePolling: true
      })
      .on('add', function (path) {
        if (path != source) return;

        remap(watcher);
        clearTimeout(timeoutNotCreatedInstance);
      });

    // Check if no file is found after "timeoutNotCreated", close watcher and exit with
    // a warning.
    timeoutNotCreatedInstance = setTimeout(function () {
      watcher.close();
      console.warn('[karma-remap-istanbul]', 'Couldn\'t find any specified files, exiting without doing anything.');
      reportFinished();
    }, timeoutNotCreated);

  };

  this.onExit = function (done) {
    reportFinished = done;
  };

  // Close the chokidar file watcher and call remap-istanbul and exit
  // plugin execution after successfull or erroneous return value from remapIstanbul
  function remap(watcher) {
    watcher.close();

    remapIstanbul(source, reports).then(
      function (response) { reportFinished(); },
      function (errorResponse) {
        console.warn('[karma-remap-istanbul]', errorResponse);
        reportFinished();
      }
    );
  }
};

KarmaRemapIstanbul.$inject = ['baseReporterDecorator', 'config', 'formatError'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
