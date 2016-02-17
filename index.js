var remapIstanbul = require('remap-istanbul');

var KarmaRemapIstanbul = function (baseReporterDecorator, config) {
  baseReporterDecorator(this);

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var sourceFiles = remapIstanbulReporterConfig.src || null;
  var remapIstanbulConfig = remapIstanbulReporterConfig.config || {};

  this.onBrowserComplete = function (browser) {
    if (!sourceFiles) return done();
    remapIstanbul(sourceFiles, remapIstanbulConfig).then(done());
  };
};

KarmaRemapIstanbul.$inject = ['baseReporterDecorator', 'config', 'formatError'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
