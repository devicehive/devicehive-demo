#!/bin/sh

DIR=$(dirname $0)
cd $DIR

node node_modules/.bin/forever start app.js
