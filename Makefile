test:
	@NODE_ENV=test ./node_modules/.bin/mocha --globals const ./test/node.*.js
	sisyphus

css:
	node script/generate-flag-css.js > www/css/flags.css

deploy:
	- rm -rf www-built
	- rm -rf www-ghdeploy
	volo appcache
	volo ghdeploy
	git reset HEAD

flags:
	node script/generate-flag-css.js

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

update: css

.PHONY: test
