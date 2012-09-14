'use strict';

require(__dirname + '/../lib/string.js')
var fs = require('fs')

var denominations = JSON.parse(fs.readFileSync('./lib/denominations.json', 'utf8'))

for (var i in denominations) {
  if (denominations.hasOwnProperty(i)) {
    console.log('.{code}-flag {\n    background-image: url(/img/flags/{code}.png);\n}\n'.format({
        code: i
    }))
  }
}
