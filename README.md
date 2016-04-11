# karma-remap-istanbul
Call remap-istanbul as a karma reporter, enabling remapped reports on watch

## installation

Install `karma-remap-istanbul` as a dev-dependency in your project.

```bash
npm install karma-remap-istanbul --save-dev
```

## configuration

Add the plugin, reporter and reporter configuration in your `karma.conf.js`.

```js
{
  plugins: ['karma-remap-istanbul'],
  reporters: ['progress', 'karma-remap-istanbul'],
  remapIstanbulReporter: {
    src: 'path/to/generated/coverage/report.json',
    reports: {
      lcovonly: 'path/to/output/coverage/lcov.info',
      html: 'path/to/output/html/report'
    },
    timeoutNotCreated: 1000 // default value
  }
}
```

You may want to install `karma-coverage` and register it as a reporter before `karma-remap-istanbul` for this reporter to be sensible. The src can be either a string to a json file or array to multiple json files, which will be processed in one report. This, and the possible reporter options can be found in the [remap-istanbul](https://github.com/SitePen/remap-istanbul) project README.
