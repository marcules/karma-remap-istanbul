const webpack = require('webpack'); // eslint-disable-line import/no-unresolved

const webpackConfig = {
  module: {
    rules: [{
      test: /\.ts$/,
      loader: 'ts-loader',
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

module.exports = config => {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha'],

    // list of files / patterns to load in the browser
    files: [
      'test/test.spec.ts'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/test.spec.ts': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    remapIstanbulReporter: {
      reports: {
        html: 'coverage/html',
        'text-summary': null
      }
    },

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'karma-remap-istanbul'],

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
