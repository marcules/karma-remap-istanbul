const fs = require('fs');
const path = require('path');
const chai = require('chai');
const karma = require('karma');

const expect = chai.expect;
const karmaRemapIstanbul = require('../');

function createServer(config) {
  config = config || {};
  return new karma.Server(Object.assign({
    configFile: path.join(__dirname, '/karma.conf.js'),
    plugins: [
      'karma-mocha',
      'karma-phantomjs-launcher',
      'karma-webpack',
      'karma-sourcemap-loader',
      karmaRemapIstanbul
    ]
  }, config), () => {});
}

describe('karma-remap-istanbul', () => {
  it('should generate a remapped coverage report', done => {
    const server = createServer();
    server.start();
    server.on('run_complete', () => {
      setTimeout(() => { // hacky workaround to make sure the file has been written
        const summary = JSON.parse(fs.readFileSync(path.join(__dirname, '/fixtures/outputs/coverage.json')));
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

  it('should allow files to be excluded', done => {
    const server = createServer({
      remapIstanbulReporter: {
        reports: {
          'json-summary': path.join(__dirname, '/fixtures/outputs/coverage.json')
        },
        remapOptions: {
          exclude: 'example'
        }
      }
    });
    server.start();

    server.on('run_complete', () => {
      setTimeout(() => { // hacky workaround to make sure the file has been written
        const summary = JSON.parse(fs.readFileSync(path.join(__dirname, '/fixtures/outputs/coverage.json')));
        expect(summary.total).to.deep.equal({
          lines: {
            total: 0,
            covered: 0,
            skipped: 0,
            pct: 100
          },
          statements: {
            total: 0,
            covered: 0,
            skipped: 0,
            pct: 100
          },
          functions: {
            total: 0,
            covered: 0,
            skipped: 0,
            pct: 100
          },
          branches: {
            total: 0,
            covered: 0,
            skipped: 0,
            pct: 100
          },
          linesCovered: {}
        });
        done();
      }, 300);
    });
  });
});
