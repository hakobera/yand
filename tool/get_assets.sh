#!/bin/sh

if [ ! -e public/docs/assets ]; then
  mkdir -p public/docs/assets
fi

for path in style.css sh.css sh_main.js sh_javascript.min.js
do
  curl http://nodejs.org/docs/latest/api/assets/${path} > public/docs/assets/${path}
done
