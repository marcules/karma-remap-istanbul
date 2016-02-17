var remapIstanbul = require('remap-istanbul');

var KarmaRemapIstanbul = function (baseReporterDecorator, config) {
  baseReporterDecorator(this);

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var sourceFiles = remapIstanbulReporterConfig.src || null;
  var remapIstanbulConfig = remapIstanbulReporterConfig.config || {};

  var pendingReport = 0;
  var reportFinished = function () { };

  this.onBrowserComplete = function (browser) {
    if (!sourceFiles) return;

    pendingReport++;
    remapIstanbul(sourceFiles, remapIstanbulConfig).then(reportFinished());
  };

  this.onExit = function (done) {
    if (pendingReport) {
      reportFinished = done;
    } else {
      done();
    }
  }
};

KarmaRemapIstanbul.$inject = ['baseReporterDecorator', 'config', 'formatError'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
