#!/bin/bash

npm install
npm run build

rm -rf /opt/html/chinaust/build
cp -r build /opt/html/chinaust/build
