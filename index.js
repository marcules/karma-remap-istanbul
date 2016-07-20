var remapIstanbul = require('remap-istanbul');
var karmaCoverageReport = require('karma-coverage/lib/reporter');
var MemoryStore = require('istanbul/lib/store/memory');
var path = require('path');


var KarmaRemapIstanbul = function (logger, rootConfig) {

  var log = logger.create('reporter.remap-istanbul');

  var config = rootConfig.coverageReporter = rootConfig.coverageReporter || {};

  // store coverageReporter report config
  var originalReports = config.reporters.slice(0);

  // replace coverageReporter config with request for raw reports
  config.reporters.splice(0);
  config.reporters.push({ type: 'json', file: 'coverage-raw.json' });

  // on writing raw reports remap once and generate all configured reports
  config._onWriteReport = function (collector, reporter) {

    try {

      var sources = new MemoryStore();

      collector = remapIstanbul.remap(collector.getFinalCoverage(), {sources: sources});

      for (var report of originalReports) {

        var subdir = reporter ? reporter.opts.browser.name : '.';
        if (typeof report.subdir === 'function') {
          subdir = report.subdir(subdir);
        } else if (report.subdir) {
          subdir = report.subdir;
        }

        var dest = path.join(config.dir, subdir, report.file || '');

        remapIstanbul.writeReport(collector, report.type, {}, dest, sources);
      }

    } catch(e) {
      log.error(e);
    }

  };

};

KarmaRemapIstanbul.$inject = ['logger', 'config'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
