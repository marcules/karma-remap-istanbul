var chokidar = require('chokidar');
var remapIstanbul = require('remap-istanbul');

var KarmaRemapIstanbul = function (baseReporterDecorator, config) {
  baseReporterDecorator(this);

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var sources = remapIstanbulReporterConfig.src || null;
  var reports = remapIstanbulReporterConfig.reports || {};
  var timeoutNotCreated = remapIstanbulReporterConfig.timeoutNotCreated || 1000;
  var timeoutNoMoreFiles = remapIstanbulReporterConfig.timeoutNoMoreFiles || 1000;

  var pendingReport = 0;
  var reportFinished = function () { };
  var noMoreFilesTimeout;

  this.onBrowserComplete = function (browser) {
    if (!sources) return;

    pendingReport++;
    var addedPaths = 0;

    // Add watcher for source files
    var watcher = chokidar.watch(sources, {
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    }).on('add', function (path) {
      addedPaths++;
      clearTimeout(noMoreFilesTimeout);

      if (addedPaths >= sources.length) {
        remap(watcher);
      }

      // If no more files are found after "timeoutNoMoreFiles" call remap, even though
      // we have not found all files specified in sources, and add warning
      noMoreFilesTimeout = setTimeout(function () {
        console.warn("Not all files specified in sources could be found, continue with partial remapping.");
        remap(watcher);
      }, timeoutNoMoreFiles);
    });

    // Check if no file is found after "timeoutNotCreated", close watcher and exit with
    // a warning
    setTimeout(function () {
      if (!addedPaths) {
        watcher.close();
        console.warn("Couldn't find any specified files, exiting without doing anything.");
        reportFinished();
      }
    }, timeoutNotCreated);

  };

  this.onExit = function (done) {
    if (pendingReport) {
      reportFinished = done;
    } else {
      done();
    }
  };

  /**
   * Close the chokidar file watcher and call remap-istanbul and exit
   * plugin execution after successfull or erroneous return value from remapIstanbul
   */
  function remap(watcher) {
    watcher.close();

    remapIstanbul(sources, reports).then(
      function (response) { reportFinished(); },
      function (errorResponse) { console.warn(errorResponse); reportFinished(); }
    );
  }
};

KarmaRemapIstanbul.$inject = ['baseReporterDecorator', 'config', 'formatError'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
