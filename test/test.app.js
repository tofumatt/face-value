/*global describe:true it:true */
'use strict';

var app = require('../app').app
var request = require('supertest')

describe('The router', function() {
  describe('index page',  function() {
    it('should return HTTP 200 OK', function(done) {
      request(app)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, done)
    })

    it("should contain the current app's URL in the <body> tag", function(done) {
      request(app)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(200, /<body data-url="https?:\/\/[^/]+">/, done)
    })
  })

  describe('404 page',  function() {
    it('should return HTTP 404 Not Found', function(done) {
      request(app)
        .get('/404')
        .set('Accept', 'text/html')
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(404, done)
    })

    it('should contain the URL not found in the page', function(done) {
      request(app)
        .get('/404')
        .set('Accept', 'text/html')
        .expect(404, /<div id="url-requested">\/404<\/div>/, done)
    })
  })
})
