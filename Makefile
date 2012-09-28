test:
	- rm ./test.pid
	@NODE_ENV=test ./node_modules/.bin/mocha --globals const
	@NODE_ENV=test node app.js & echo $$! > ./test.pid & ./vendor/casperjs/bin/casperjs --local-storage-path=/dev/null test ./test/front-end/test.*.js
	kill `cat ./test.pid`
	rm ./test.pid

css:
	node script/generate-flag-css.js > public/css/flags.css

deploy:
	git push heroku master

flags:
	node script/generate-flag-css.js

install: submodules npm_install mortar
	echo 'Installed!'

mortar:
	rm -rf .app-stub-temp
	./vendor/mortar/bin/build app-stub .app-stub-temp
	- cp -an .app-stub-temp/www/. public/.
	rm -rf .app-stub-temp public/.htaccess public/404.html public/index.html

npm_install:
	npm install

submodules:
	git submodule update --init --recursive

update: update_currencies css

update_currencies:
	node script/scraper.js

.PHONY: test
