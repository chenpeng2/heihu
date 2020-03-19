#!/bin/bash

npm install

npm run build-prod

rm -rf /opt/html/omega8-mobile/www

cp -r www /opt/html/omega8-mobile/www

