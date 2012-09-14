test:
	@./node_modules/.bin/mocha --globals const

css:
	node script/generate-flag-css.js > public/css/flags.css

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
