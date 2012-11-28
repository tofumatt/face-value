/*global describe:true it:true */
'use strict';

var app = require('../app').app
var request = require('supertest')

describe("The app assets'", function() {
  describe('images',  function() {
    it('should include a favicon', function(done) {
      request(app)
        .get('/favicon.ico')
        .set('Accept', 'image/x-icon')
        .expect('Content-Type', 'image/x-icon')
        .expect(200, done)
    })

    it('should include an iPhone home screen icon', function(done) {
      request(app)
        .get('/apple-touch-icon-57x57-precomposed.png')
        .set('Accept', 'image/png')
        .expect('Content-Type', 'image/png')
        .expect(200, done)
    })
    it('should reference iPhone home screen icon from page', function(done) {
      request(app)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(200, /rel="apple-touch-icon-precomposed" sizes="57x57" href="apple-touch-icon-57x57-precomposed.png"/, done)
    })

    it('should include a retina iPhone home screen icon', function(done) {
      request(app)
        .get('/apple-touch-icon-114x114-precomposed.png')
        .set('Accept', 'image/png')
        .expect('Content-Type', 'image/png')
        .expect(200, done)
    })
    it('should reference a retina iPhone home screen icon from page', function(done) {
      request(app)
        .get('/')
        .set('Accept', 'text/html')
        .expect('Content-Type', 'text/html; charset=UTF-8')
        .expect(200, /rel="apple-touch-icon-precomposed" sizes="114x114" href="apple-touch-icon-114x114-precomposed.png"/, done)
    })
  })
})
