#!/bin/bash

npm install

npm run build

rm -rf /opt/html/lakers/build

cp -r build /opt/html/lakers/build