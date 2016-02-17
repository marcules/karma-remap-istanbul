var remapIstanbul = require('remap-istanbul');

var KarmaRemapIstanbul = function (baseReporterDecorator, config) {
  baseReporterDecorator(this);

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var sources = remapIstanbulReporterConfig.src || null;
  var reports = remapIstanbulReporterConfig.reports || {};

  var pendingReport = 0;
  var reportFinished = function () { };

  this.onBrowserComplete = function (browser) {
    if (!sources) return;

    pendingReport++;
    remapIstanbul(sources, reports).then(
      function(response) { reportFinished(); },
      function(errorResponse) { console.warn(errorResponse); reportFinished(); }
    );
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
