/* global require, module */

var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');

var app = new EmberApp();

// Use `app.import` to add additional libraries to the generated
// output files.
//
// If you need to use different assets in different
// environments, specify an object as the first parameter. That
// object's keys should be the environment name and the values
// should be the asset to use in that environment.
//
// If the library that you are including contains AMD or ES6
// modules that you would like to import into your application
// please specify an object with the list of modules as keys
// along with the exports of each module as its value.

// i18n
// var compileES6 = require('broccoli-es6-concat');
// var i18nPrecompile = require('broccoli-i18n-precompile');

// var translationTree = pickFiles('app', {
//   srcDir: '/locales',
//   files: ['*.js'],
//   destDir: app.name
// });

// var appTranslations = compileES6(translationTree, {
//   outputFile: '/assets/i18n.js',
//   inputFiles: ['**/*.js'],
//   wrapInEval: false,
// });

// var precompiledTrans = i18nPrecompile(appTranslations);
// app.import('bower_components/ember-i18n/lib/i18n.js');

// Ionic
app.import('bower_components/normalize.css/normalize.css');
app.import('bower_components/ionic/release/css/ionic.css');
app.import('bower_components/ionic/release/js/ionic.js');
app.import('bower_components/ionic/release/fonts/ionicons.eot', {
  destDir: 'fonts'
});
app.import('bower_components/ionic/release/fonts/ionicons.svg', {
  destDir: 'fonts'
});
app.import('bower_components/ionic/release/fonts/ionicons.ttf', {
  destDir: 'fonts'
});
app.import('bower_components/ionic/release/fonts/ionicons.woff', {
  destDir: 'fonts'
});

module.exports = app.toTree();
// module.exports = mergeTrees([precompiledTrans, app.toTree()]);
