const fs = require('fs');
const chai = require('chai');
const karma = require('karma');

const expect = chai.expect;
const karmaRemapIstanbul = require('../');

describe('karma-remap-istanbul', () => {

  let server;
  beforeEach(() => {
    server = new karma.Server({
      configFile: __dirname + '/karma.conf.js',
      plugins: [
        'karma-mocha',
        'karma-phantomjs-launcher',
        'karma-webpack',
        'karma-sourcemap-loader',
        karmaRemapIstanbul
      ],
    }, () => {});
    server.start();
  });

  it('should generate a remapped coverage report', done => {
    server.on('run_complete', () => {
      setTimeout(() => { // hacky workaround to make sure the file has been written
        const summary = JSON.parse(fs.readFileSync(__dirname + '/fixtures/outputs/coverage.json'));
        expect(summary.total).to.deep.equal({
          lines: {
            total: 6,
            covered: 5,
            skipped: 0,
            pct: 83.33
          },
          statements: {
            total: 7,
            covered: 6,
            skipped: 0,
            pct: 85.71
          },
          functions: {
            total: 3,
            covered: 2,
            skipped: 0,
            pct: 66.67
          },
          branches: {
            total: 0,
            covered: 0,
            skipped: 0,
            pct: 100
          },
          linesCovered: {
            1: 2,
            3: 1,
            4: 1,
            7: 1,
            8: 0,
            11: 1
          }
        });
        done();
      }, 300);
    });
  });

});
