/*global describe:true it:true */
'use strict';

var app = require('../app').app
var request = require('supertest')

describe('The router', function() {
  describe('index page',  function() {
    it('should return HTTP 200 OK', function(done) {
      request(app)
        .get('/')
        .set('Accept', 'application/html')
        .expect(200, done);
    })
  })
})
