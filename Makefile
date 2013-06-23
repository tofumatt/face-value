test: build
	@NODE_ENV=test mocha --compilers coffee:coffee-script ./test/node.*.coffee
	sisyphus

build:
	- rm -rf www-built
	- rm -rf www-ghdeploy
	volo appcache
	rm www-built/js/main.js
	mv www-built/js/main.built.js www-built/js/main.js

css:
	coffee script/generate-flag-css.coffee > www/css/flags.css

deploy: build
	volo ghdeploy
	git reset HEAD

flags:
	coffee script/generate-flag-css.coffee

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

update: css

.PHONY: test
