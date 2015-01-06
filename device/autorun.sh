#!/bin/sh

while(systemctl is-enabled bluetooth != 'enabled')
do
sleep 1
done

cd /home/root/devicehive-demo/device
node app.js
