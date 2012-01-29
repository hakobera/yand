build:
	node tool/crawler.js
	node tool/convert.js
	node tool/mkindex.js
	node tool/mknavigation.js
	tool/get_assets.sh
	uglifyjs -nc public/javascripts/yand.js > public/javascripts/yand.min.js

uglify:
	uglifyjs -nc public/javascripts/yand.js > public/javascripts/yand.min.js
	uglifyjs -nc public/javascripts/yand.doc.js > public/javascripts/yand.doc.min.js

test:
	./node_modules/.bin/mocha \
		--reporter list

.PHONY: build
