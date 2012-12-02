# Contributing to Face Value #

There are two ways you can contribute to Face Value: either add more
currencies to the list (in `www/denominations.json`) or by coding (adding
features and/or fixing bugs). Adding new currencies is relatively easy, though
to generate the flag image you'll want Photoshop or something that can open
`.psd` files (including layer styles).

## Adding More Currencies ##

The basics of adding more currencies is simple:

  * fork the repository on GitHub
  * open `www/denominations.json` in your favourite text editor
  * copy a currency and substitute each value according to the new currency
  * add some flag images in `www/img/header-flags/` and `www/img/flags/`

Then submit your pull request and you're off to the races! You can, optionally,
run `make` to ensure the tests pass, but [Travis CI](http://travis-ci.org)
will warn you in the pull request if they don't pass. So if you don't want to
install node, that's OK.
