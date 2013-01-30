#!/usr/bin/env node
'use strict';

require(__dirname + '/../lib/string.js')
var fs = require('fs')

var denominations = JSON.parse(fs.readFileSync('./www/denominations.json', 'utf8'))

for (var i in denominations) {
  if (denominations.hasOwnProperty(i)) {
    console.log('.{code}-flag {\n    background-image: url(../img/flags/{code}@2x.png);\n}\n#header.{code}-flag {\n    background-image: url(../img/header-flags/{code}@2x.png);\n}\n'.format({
        code: i
    }))
  }
}

console.log('/** Flag list:\n')
for (var i in denominations) {
  if (denominations.hasOwnProperty(i)) {
    console.log('{code}'.format({
        code: i
    }))
  }
}
console.log('\n*/')

console.log('/** Appcache data:\n')
for (var i in denominations) {
  if (denominations.hasOwnProperty(i)) {
    console.log('img/flags/{code}@2x.png'.format({
        code: i
    }))
    console.log('img/header-flags/{code}@2x.png'.format({
        code: i
    }))
  }
}
console.log('\n*/')
