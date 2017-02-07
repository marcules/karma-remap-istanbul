const path = require('path');
const webpack = require('webpack');

const webpackConfig = {
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader?silent=true',
      exclude: /node_modules/
    }, {
      test: /src\/.+\.ts$/,
      exclude: /(node_modules|\.spec\.ts$)/,
      loader: 'sourcemap-istanbul-instrumenter-loader?force-sourcemap=true',
      enforce: 'post'
    }]
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: null,
      test: /\.(ts|js)($|\?)/i
    })
  ],
  resolve: {
    extensions: ['.ts', '.js']
  }
};

module.exports = function (config) {
  config.set({

    basePath: './',

    browsers: ['PhantomJS'],

    frameworks: ['mocha'],

    singleRun: true,

    reporters: ['karma-remap-istanbul'],

    files: [
      'fixtures/inputs/test/test.spec.ts'
    ],

    preprocessors: {
      'fixtures/inputs/test/test.spec.ts': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only',
      noInfo: true
    },

    remapIstanbulReporter: {
      reports: {
        'json-summary': path.join(__dirname, '/fixtures/outputs/coverage.json')
      }
    },

    logLevel: config.LOG_DISABLE

  });
};
