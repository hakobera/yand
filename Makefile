NODE_VERSION=latest

build: minify
	@echo "NODE_VERSION=${NODE_VERSION}"
	$(env NODE_VERSION=${NODE_VERSION})
	rm -rf public/docs
	mkdir -p public/docs
	node tool/crawler.js
	node tool/convert.js
	node tool/mkindex.js
	node tool/mknavigation.js
	tool/get_assets.sh
	sed -e "s/{NODE_VERSION}/${NODE_VERSION}/g" public/top.html.tmpl > public/top.html

minify: dependencies
	./node_modules/uglify-js/bin/uglifyjs public/javascripts/yand.js -c -o public/javascripts/yand.min.js
	./node_modules/uglify-js/bin/uglifyjs public/javascripts/yand.doc.js -c -o public/javascripts/yand.doc.min.js
	./node_modules/stylus/bin/stylus --compress < public/stylesheets/doc.styl > public/stylesheets/doc.css
	./node_modules/stylus/bin/stylus --compress < public/stylesheets/panel.styl > public/stylesheets/panel.css

dependencies:
	npm install

test:
	./node_modules/.bin/mocha \
		--reporter list

.PHONY: build minify npm test
