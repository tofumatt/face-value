test:
	- rm ./test.pid
	@NODE_ENV=test ./node_modules/.bin/mocha --globals const
	@NODE_ENV=test PORT=3001 node app.js & echo $$! > ./test.pid & ./vendor/casperjs/bin/casperjs test --pre=./test/init.js ./test/front-end/
	kill `cat ./test.pid`
	rm ./test.pid

css:
	node script/generate-flag-css.js > www/css/flags.css

deploy:
	- rm -rf www-built
	- rm -rf www-ghdeploy
	volo appcache
	volo ghdeploy
	git reset HEAD

extract_strings:
	./node_modules/ajs-xgettext/bin/ajs-xgettext --function=l --output=locales/templates/LC_MESSAGES/messages.pot www/js/templates/**/**.ejs

flags:
	node script/generate-flag-css.js

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

update: css update_locale_json

update_locale_json:
	node ./locales/compile.js

.PHONY: test
