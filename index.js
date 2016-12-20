/* globals WeakMap, Promise */

var istanbul = require('istanbul');
var remap = require('remap-istanbul/lib/remap');
var writeReport = require('remap-istanbul/lib/writeReport');
var assign = require('object.assign/polyfill')();

var KarmaRemapIstanbul = function (baseReporterDecorator, logger, config) {
  baseReporterDecorator(this);

  var log = logger.create('reporter.remap-istanbul');

  var remapIstanbulReporterConfig = config.remapIstanbulReporter || {};
  var reports = remapIstanbulReporterConfig.reports || {};
  var remapOptions = remapIstanbulReporterConfig.remapOptions || {};

  var coverageMap = new WeakMap();

  var baseReporterOnRunStart = this.onRunStart;
  this.onRunStart = function () {
    baseReporterOnRunStart.apply(this, arguments);
  };

  this.onBrowserComplete = function (browser, result) {
    if (!result || !result.coverage) {
      return;
    }

    coverageMap.set(browser, result.coverage);
  };

  var reportFinished = function () { };

  var baseReporterOnRunComplete = this.onRunComplete;
  this.onRunComplete = function (browsers) {
    baseReporterOnRunComplete.apply(this, arguments);

    // Collect the unmapped coverage information for all browsers in this run
    var unmappedCoverage = (function () {
      var collector = new istanbul.Collector();

      browsers.forEach(function (browser) {
        var coverage = coverageMap.get(browser);
        coverageMap.delete(browser);

        if (!coverage) {
          return;
        }

        collector.add(coverage);
      });

      return collector.getFinalCoverage();
    })();

    var sourceStore = istanbul.Store.create('memory');

    var collector = remap(unmappedCoverage, assign({
      sources: sourceStore
    }, remapOptions));

    if (Object.keys(sourceStore.map).length === 0) {
      sourceStore = undefined;
    }

    Promise.all(Object.keys(reports).map(function (reportType) {
      var destination = reports[reportType];

      log.debug('Writing coverage to %s', destination);

      return writeReport(collector, reportType, {}, destination, sourceStore);
    })).catch(function (err) {
      log.error(err);
    }).then(function () {
      collector.dispose();

      reportFinished();

      // Reassign `onExit` to just call `done` since all reports have been written
      this.onExit = function (done) {
        done();
      };
    }.bind(this));
  };

  this.onExit = function (done) {
    // Reports have not been written, so assign `done` to `reportFinished`
    reportFinished = done;
  };
};

KarmaRemapIstanbul.$inject = ['baseReporterDecorator', 'logger', 'config'];

module.exports = {
  'reporter:karma-remap-istanbul': ['type', KarmaRemapIstanbul]
};
