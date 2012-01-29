build: uglify
	node tool/crawler.js
	node tool/convert.js
	node tool/mkindex.js
	node tool/mknavigation.js
	tool/get_assets.sh

uglify: npm
	uglifyjs -nc public/javascripts/yand.js > public/javascripts/yand.min.js
	uglifyjs -nc public/javascripts/yand.doc.js > public/javascripts/yand.doc.min.js
	./node_modules/stylus/bin/stylus --compress < public/stylesheets/doc.styl > public/stylesheets/doc.css
	./node_modules/stylus/bin/stylus --compress < public/stylesheets/panel.styl > public/stylesheets/panel.css

npm:
	npm install

test:
	./node_modules/.bin/mocha \
		--reporter list

.PHONY: build
