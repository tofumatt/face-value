test:
	@NODE_ENV=test mocha --compilers coffee:coffee-script ./test/node.*.coffee
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
