'use strict';

require(__dirname + '/../lib/string.js')
var fs = require('fs')

var denominations = JSON.parse(fs.readFileSync('./lib/denominations.json', 'utf8'))

for (var i in denominations) {
  if (denominations.hasOwnProperty(i)) {
    console.log('.{code}-flag {\n    background-image: url(/img/flags/{code}.png);\n}\n\n#header.{code}-flag {\n    background-image: url(/img/header-flags/{code}.png);\n}\n@media screen and (-webkit-min-device-pixel-ratio: 2), screen and (max--moz-device-pixel-ratio: 2) {#header.{code}-flag {\n    background-image: url(/img/header-flags/{code}@2x.png);\n}}\n'.format({
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
