#!/bin/sh

DIR=$(dirname $0)
cd $DIR

node node_modules/.bin/forever stop app-test.js
