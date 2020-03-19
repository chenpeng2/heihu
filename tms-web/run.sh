#!/bin/bash

npm install --unsafe-perm node-sass

npm install

npm run build

rm -rf /opt/html/tms-web/build

cp -r build /opt/html/tms-web/build

