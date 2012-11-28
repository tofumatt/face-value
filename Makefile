test:
	- rm ./test.pid
	@NODE_ENV=test ./node_modules/.bin/mocha --globals const
	@NODE_ENV=test PORT=3001 node app.js & echo $$! > ./test.pid & ./vendor/casperjs/bin/casperjs test --pre=./test/init.js ./test/front-end/
	kill `cat ./test.pid`
	rm ./test.pid

css:
	node script/generate-flag-css.js > public/css/flags.css

flags:
	node script/generate-flag-css.js

npm_install:
	npm install

require:
	node ./node_modules/requirejs/bin/r.js -o optimize=uglify mainConfigFile=./public/js/main.js name=main out=./public/js/main.built.js
	node ./node_modules/requirejs/bin/r.js -o optimizeCss='standard.keeplines' cssIn=./public/css/app.css out=./public/css/app.built.css

submodules:
	git submodule update --init --recursive

update: css

.PHONY: test
