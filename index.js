var chokidar = require('chokidar');
var remapIstanbul = require('remap-istanbul');

function getSourcesCount(sources) {
  if (Array.isArray(sources)) { return sources.length; }
  if (typeof sources === 'string') { return 1; }

  return null;
}

var KarmaRemapIstanbul = function (baseReporterDecorator, logger, config) {
  baseReporterDecorator(this);

  var log = logger.create('reporter.remap-istanbul');

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var sources = remapIstanbulReporterConfig.src || null;
  var reports = remapIstanbulReporterConfig.reports || {};
  var timeoutNotCreated = remapIstanbulReporterConfig.timeoutNotCreated || 1000;
  var timeoutNoMoreFiles = remapIstanbulReporterConfig.timeoutNoMoreFiles || 1000;

  var sourcesCount = getSourcesCount(sources);
  var pendingReport = 0;
  var reportFinished = function () { };
  var noMoreFilesTimeout;

  this.onRunComplete = function (browser) {
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

      if (addedPaths >= sourcesCount) {
        remap(watcher);
      } else {
        noMoreFilesTimeout = setTimeout(function () {
          log.warn('Not all files specified in sources could be found, continue with partial remapping.');
          remap(watcher);
        }, timeoutNoMoreFiles);
      }
    });

    // Check if no file is found after "timeoutNotCreated", close watcher and exit with
    // a warning
    setTimeout(function () {
      if (addedPaths === 0) {
        pendingReport--;
        watcher.close();
        log.warn('Could not find any specified files, exiting without doing anything.');
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
    pendingReport--;
    watcher.close();

    remapIstanbul(sources, reports).then(
      function (response) { reportFinished(); },
      function (errorResponse) {
        log.warn(errorResponse);
        reportFinished();
      }
    );
  }
};

KarmaRemapIstanbul.$inject = ['baseReporterDecorator', 'logger', 'config'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
