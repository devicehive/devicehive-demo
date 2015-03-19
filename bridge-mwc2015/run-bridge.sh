#!/bin/bash

while :
do
	if [ ! -z "`curl -s $serviceUrl/info|grep '\"webSocketServerUrl\": \"ws://'`" ]; then break; fi
	sleep 5
done
cd /usr/src/myapp && node app.js
