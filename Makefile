test:
	@NODE_ENV=test mocha --compilers coffee:coffee-script ./test/node.*.coffee
	sisyphus

css:
	coffee script/generate-flag-css.coffee > www/css/flags.css

deploy:
	- rm -rf www-built
	- rm -rf www-ghdeploy
	volo appcache
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
