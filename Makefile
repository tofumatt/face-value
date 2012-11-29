test:
	- rm ./test.pid
	@NODE_ENV=test ./node_modules/.bin/mocha --globals const
	@NODE_ENV=test PORT=3001 node app.js & echo $$! > ./test.pid & ./vendor/casperjs/bin/casperjs test --pre=./test/init.js ./test/front-end/
	kill `cat ./test.pid`
	rm ./test.pid

css:
	node script/generate-flag-css.js > www/css/flags.css

flags:
	node script/generate-flag-css.js

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

update: css

.PHONY: test
