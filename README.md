Configure Server
-------

From the very first, configure your demo server. Сd to the repository directory and type

    make

This will:
    
1. Install all dependencies for bridge application
2. Build elasticsearch and kibana docker container
3. Build devicehive postgresql container
4. Start DeviceHive application docker container with the postgresql container
5. Start Elasticsearch and kibana docker container

DeviceHive server API will be accessible, by this url: 
    
    http://<your-host-IP>:8080/DeviceHive/rest/

Kibana will be deployed to this url

    http://<your-host-IP>:8081/

Let's now configure you device.

Configure Beagle Bone 
------

1.  Take board Beagle Bone Black with installed Ubuntu Snappy
2.  Insert CSR 4.0 USB Dongle to board
3.  Connect to internet via Ethernet
4.  Download Demo Snap from our server: 

    wget http://104.131.168.128/snappy/ble-gateway.devicehive_1.0.5_multi.snap

5.  Install Demo Snap:

for ubuntu users: 

    sudo add-apt-repository ppa:snappy-dev/beta
    sudo apt-get update
    sudo apt-get upgrade
    sudo apt-get install snappy-tools bzr
    snappy-remote --url=ssh://<Machine-IP> install ble-gateway.devicehive_1.0.5_multi.snap

for other:

    scp ubuntu@<Machine-IP>:/tmp ble-gateway.devicehive_1.0.5_multi.snap
    ssh ubuntu@<Machine-IP> -- sudo snappy install /tmp/ble-gateway.devicehive_1.0.5_multi.snap

6.  Configure Snap parameters:

DeviceHive server should be set, otherwise service will not start:
    
    ssh ubuntu@<Machine-IP> -- sudo /apps/ble-gateway.devicehive/current/bin/dhserver http://url.to.your.server

If you deployed DeviceHive server with the Makefile, check 
`http://<your-host-IP>:8080/DeviceHive/rest/`

DeviceHive deviceId:

    ssh ubuntu@<Machine-IP> -- sudo /apps/ble-gateway.devicehive/current/bin/gatewayid device-id-here

by default deviceId is a hostname

DeviceHive connection type:
    
    ssh ubuntu@<Machine-IP> -- sudo /apps/ble-gateway.devicehive/current/bin/connection rest

or

    ssh ubuntu@<Machine-IP> -- sudo /apps/ble-gateway.devicehive/current/bin/connection ws

websocket (ws) is default

The services will be restarted after each command.

Configure Bridge app
--------

After the device is configured run a bridge app

    DEVICE_ID=<your device id> make bridge

This will start bridge app between DeviceHive and ElasticSearch

Check Kibana
--------
Goto

    http://<your-host-IP>:8081/

And check you device data
