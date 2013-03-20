#!/usr/bin/env coffee
'use strict'

fs = require 'fs'

denominations = JSON.parse fs.readFileSync('./www/denominations.json', 'utf8')

for i of denominations
  console.log """
              .#{i}-flag {
                background-image: url(../img/flags/#{i}@2x.png);
              }
              #header.#{i}-flag {
                background-image: url(../img/header-flags/#{i}@2x.png);
              }
              """

console.log '/** Flag list:'
for i of denominations
  console.log i
console.log '*/'

console.log('/** Appcache data:')
for i of denominations
  console.log """
              img/flags/#{i}@2x.png
              img/header-flags/#{i}@2x.png
              """

console.log '*/'
