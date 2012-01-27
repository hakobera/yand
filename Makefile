build:
	node tool/crawler.js
	node tool/convert.js
	node tool/mkindex.js
	node tool/mknavigation.js

test:
	./node_modules/.bin/mocha \
		--reporter list

.PHONY: build
