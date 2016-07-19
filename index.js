var remapIstanbul = require('remap-istanbul');
var karmaCoverageReport = require('karma-coverage/lib/reporter');

var KarmaRemapIstanbul = function (rootConfig, helper, logger, emitter) {

  var log = logger.create('reporter.remap-istanbul');

  var config = rootConfig.coverageReporter = rootConfig.coverageReporter || {};
  config._onWriteReport = function (collector) {
    try {
      collector = remapIstanbul.remap(collector.getFinalCoverage());
    } catch(e) {
      log.error(e);
    }
    return collector;
  };

  karmaCoverageReport.call(this, rootConfig, helper, logger, emitter);
};

KarmaRemapIstanbul.$inject = karmaCoverageReport.$inject;

module.exports = {
  'reporter:remap-istanbul': ['type', KarmaRemapIstanbul]
};
