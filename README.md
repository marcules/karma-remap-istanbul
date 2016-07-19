# karma-remap-istanbul
Call remap-istanbul after `karma-coverage` has completed.

## installation

Install `karma-remap-istanbul` and `karma-coverage` as a dev-dependency in your project.

```bash
npm install karma-remap-istanbul karma-coverage --save-dev
```

## configuration

Add the plugin, reporter and reporter configuration in your `karma.conf.js`. The configuration options are the same as for the `karma-coverage` plugin. The possible reporter options can be found in the [karma-coverage](https://github.com/karma-runner/karma-coverage/blob/master/docs/configuration.md)
documentation;

```js
module.exports = function (config) {
    config.set({
      plugins: ['karma-remap-istanbul'],
      reporters: ['progress', 'remap-istanbul'],
      coverageReporter: {
        reporters: [
          {
            type: 'json',
            subdir: '.', 
            file: 'coverage-final.json'
          },
          {
            type: 'html',
            subdir: 'html'
          }
        ]
      }
  });
};
```
