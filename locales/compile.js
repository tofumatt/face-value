"use strict";

var fs = require('fs');
var po2json = require('po2json');

var languages = fs.readdirSync(__dirname);

languages.forEach(function(f) {
    var lang;

    try {
        lang = f.split('/')[0];
    } catch (e) {
        console.log(e);
    }

    // Hacky, obviously.
    if (['.DS_Store', 'newlocale.sh',, 'compile.js', 'templates'].indexOf(lang) === -1 &&
        lang.match(/[A-Za-z]{2}(-[A-Za-z]{2})?/)) {
        var json;
        var messages = __dirname + '/' + lang + '/LC_MESSAGES/messages.po';

        try {
            json = JSON.stringify(po2json.parseSync(messages));
        } catch (e) {
            console.log(e);
        }

        var jsonPath = __dirname + '/../www/locale/' + lang + '.json';
        var stream = fs.createWriteStream(jsonPath, {});
        stream.write(json);

        console.log('Saved ' + lang);
    }
});

console.log('Compiled all PO files to JSON in www/locale');
