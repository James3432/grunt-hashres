/*
 * grunt-hashres
 * https://github.com/james3432/grunt-hashres
 * forked from https://github.com/luismahou/grunt-hashres
 *
 * Original Copyright (c) 2013 Luismahou
 * Licensed under the MIT license.
 */

'use strict';

var crypto = require('crypto'),
    fs     = require('fs');

function preg_quote (str, delimiter) {
  // http://kevin.vanzonneveld.net
  // +   original by: booeyOH
  // +   improved by: Ates Goral (http://magnetiq.com)
  // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: Onno Marsman
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // *     example 1: preg_quote("$40");
  // *     returns 1: '\$40'
  // *     example 2: preg_quote("*RRRING* Hello?");
  // *     returns 2: '\*RRRING\* Hello\?'
  // *     example 3: preg_quote("\\.+*?[^]$(){}=!<>|:");
  // *     returns 3: '\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:'
  return (str + '').replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + (delimiter || '') + '-]', 'g'), '\\$&');
}

exports.preg_quote = preg_quote;

function escapeNonRegex(input) {
  return (input instanceof RegExp) ? input.source : preg_quote(input);
}

// Generates a function for the given format
// Valid format variables: ${hash}, ${name} and ${ext}
exports.compileFormat = function(format) {
  return function(options) {
    var output = format.replace(/\$\{hash\}/g, options.hash);
    // make it ignore existing cached files, and strip any / from the filename
    output = output.replace(/\$\{name\}/g, options.name.replace(/cached\.[a-zA-Z0-9]{8}\./,'').replace(/\//,''));
    output = output.replace(/\$\{ext\}/g, options.ext);
    output = '/' + output;
    return output;
  };
};

// Generates a function for the given format as a regex string
// Valid format variables: ${hash}, ${name} and ${ext}
exports.compileSearchFormat = function(format) {
  format = preg_quote(format);
  return function(options) {
    var output = format.split('\\$\\{hash\\}').join(escapeNonRegex(options.hash));
    // strip / from filename
    output = output.split('\\$\\{name\\}').join(escapeNonRegex(options.name.replace(/\//,'')));
    output = output.split('\\$\\{ext\\}').join(escapeNonRegex(options.ext));
    output = '/' + output;
    return output;
  };
};

// Generates the md5 for the given file
exports.md5 = function(filepath) {
  var hash = crypto.createHash('md5');
  hash.update(fs.readFileSync(String(filepath), 'utf8'));
  return hash.digest('hex');
};
