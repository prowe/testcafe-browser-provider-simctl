# testcafe-browser-provider-simctl
[![Build Status](https://travis-ci.org/prowe/testcafe-browser-provider-simctl.svg)](https://travis-ci.org/prowe/testcafe-browser-provider-simctl)

This is the **simctl** browser provider plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-browser-provider-simctl
```

## Usage


You can determine the available browser aliases by running
```
testcafe -b simctl
```

When you run tests from the command line, use the alias when specifying browsers:

```
testcafe simctl:browser1 'path/to/test/file.js'
```


When you use API, pass the alias to the `browsers()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('simctl:browser1')
    .run();
```

## Author
Paul Rowe 
