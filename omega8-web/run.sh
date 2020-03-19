#!/bin/bash

npm install --unsafe-perm node-sass

npm install

npm run build

rm -rf /opt/html/omega8-web/build

cp -r build /opt/html/omega8-web/build

