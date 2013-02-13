# Face Value #

Currency conversion using actual denominations.

![A screenshot of Face Value's main screen](https://raw.github.com/tofumatt/face-value/master/screenshot-1.png) ![A screenshot of Face Value's currency selector](https://raw.github.com/tofumatt/face-value/master/screenshot-2.png)

Face Value is an open-source, cross-platform currency conversion app that does
things differently. It shows you the denominations of a currency, beautifully
rendered in their proper style and colour, and what each coin or banknote is
worth in your own currency. This lets you get a much better grasp on cash in
the places you visit than the algebra game that most currency conversion apps
end up being.

## Platforms ##

Face Value is a web app, first and foremost. At its core, it's an entirely
client-side web app (built using the Backbone.js framework), that connects
to Yahoo's Finance API to get data. It will work on any modern browser,
including Chrome for Android and Safari for iOS. That said, it includes some
platform-specific stuff to improve the experience on certain platforms:

 * iOS-specific metadata and resources to function as a home screen web app
 * Firefox OS-specific manifest to work on Firefox OS and Firefox for Android
 * Cordova framework to compile an IPA for iOS App Store distribution

I'm open to other platform-specific stuff; these are just the platforms I've
bothered to optimize because they're the ones I care about.

## Running Face Value ##

Make sure you have `node.js` (0.8) installed on your system. On a Mac with
Homebrew installed, just do `brew install node`.

Go to your cloned directory and do:

    npm install
    volo serve

Then go to `http://localhost:8008` in your browser of choice. You'll want to
be connected to the 'net so you can fetch currency data from Yahoo.

## Build Status ##

Continuous integration tests for Face Value are run on the awesome
[Travis CI](http://travis-ci.org): [![Build Status](https://secure.travis-ci.org/tofumatt/face-value.png?branch=master)](http://travis-ci.org/tofumatt/face-value)

## To-dos ##

 * Improve currency/denomination re-render on update code
 * Add tests to cover currency data updates

# License #

This program is free software; it is distributed under an [MIT License](http://github.com/tofumatt/face-value/blob/master/LICENSE.txt).

---

Copyright (c) 2012-2013 [Matthew Riley MacPherson](http://lonelyvegan.com) and
[sarah ✈ semark](http://triggersandsparks.com).
