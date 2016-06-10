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
  
  // increment timeoutNoMoreFiles by 5ms so it doesn't interfere with timeoutNotCreated fallback
  timeoutNoMoreFiles += 5;

  var sourcesCount = getSourcesCount(sources);
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
    }).on('add', onAdd);
    
    function onAdd(path) {
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
    }

    // Check if no file is found after "timeoutNotCreated", close watcher and exit with
    // a warning
    setTimeout(function () {
      if (Array.isArray(sources)) {
        failNoFiles();  
        return;
      }
      if (addedPaths === 0) {
        if ((require('fs').readFileSync(sources))) {
          log.warn('File watcher failed: Falling back to manual check');
          onAdd();
        } else {
          failNoFiles();
        }
      }
    }, timeoutNotCreated);
    
    function failNoFiles() {
      watcher.close();
      log.warn('Could not find any specified files, exiting without doing anything.');
      reportFinished();
    }

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
