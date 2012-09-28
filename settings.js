'use strict';

// Module dependencies.
module.exports = function(app, conf, configurations, express) {
  var clientSessions = require('client-sessions')
  // Monkeypatches String so you can do
  // 'hello {world}'.format({world: 'earth'}).
  require(__dirname + '/lib/string')

  // Configuration.
  app.configure(function() {
    app.set('views', __dirname + '/views')
    app.set('view engine', 'ejs')

    app.use(express.bodyParser())
    app.use(express.methodOverride())

    // If your app doesn't need sessions, you can set "sessions" to false
    // in your defaults.json.
    if (conf.get('sessions')) {
      app.use(clientSessions({
        cookieName: conf.get('session_cookie'),
        secret: conf.get('session_secret'), // Required!
        duration: 24 * 60 * 60 * 1000 * 28, // 4 weeks; adjust as you like.
      }))
    }

    app.use(app.router)

    // Public/static files directory. If you add more folders here,
    // they'll also be served statically from the root URL.
    app.use(express.static(__dirname + '/public'))

    if (!process.env.NODE_ENV) {
      app.use(express.logger('dev'))
    }

    app.conf = conf
  })

  app.configure('development, test', function() {
    app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }))
  })

  app.configure('production', function() {
    app.use(express.errorHandler())
  })

  /*
    Error handlers for 403, 404, and 500 (ISE). You can customize these
    functions yourself, move them to app.js, or simply tweak the 403.ejs,
    404.ejs, and/or 500.ejs files in the views/ folder.
  */

  // Note: 404 must be first or you'll always get a 403 error!
  app.use(function(req, res, next) {
    res.status(404)

    res.render('404', {
      url: req.url
    })
  })

  app.use(function(req, res, next) {
    res.status(403)

    res.render('403', {
      url: req.url
    })
  })

  app.use(function(err, req, res, next) {
    res.status(err.status || 500)

    res.render('500', {
      error: err
    })
  })

  // Helpers.
  app.dynamicHelpers({
    // Get the app's URL.
    appURL: function(req, res) {
      var address = app.address()

      return '{protocol}://{address}{port}'.format({
        protocol: parseInt(address.family, 10) !== 2 ? 'https' : 'http',
        address: address.address,
        port: [80, 443].indexOf(address.port) >= 0 ? ':' + address.port : ''
      })
    },
    // Get session data.
    session: function(req, res) {
      return conf.get('sessions') ? req.session : undefined
    },
    // For CSRF protection.
    csrf_token: function(req, res) {
      return req.session ? req.session._csrf : undefined
    }
  })

  return app
}
