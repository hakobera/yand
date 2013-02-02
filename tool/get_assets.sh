#!/bin/sh

if [ ! -e public/docs/assets ]; then
  mkdir -p public/docs/assets
fi

for asset in style.css sh.css
do
  echo "Download http://nodejs.org/docs/${NODE_VERSION}/api/assets/${asset}"
  curl http://nodejs.org/docs/${NODE_VERSION}/api/assets/${asset} > public/docs/assets/${asset}
done

for asset in sh_main.js sh_javascript.min.js
do
  echo "Download http://nodejs.org/docs/${NODE_VERSION}/${asset}"
  curl http://nodejs.org/docs/${NODE_VERSION}/${asset} > public/docs/assets/${asset}
done
