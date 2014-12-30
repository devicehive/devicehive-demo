var noble = require('noble');
var DevicehiveConnector = require('./devicehive-connector.js');

var app = ({

    serviceUUIDs: [
        // '70f31319a57e4eaa97bb6dcb89ccb2c5'
    ], // default: [] => all

    connectedPeripherals: [],

    start: function () {
        noble.on('stateChange', app.onStateChange);
    },

    onStateChange: function (state) {

        console.log("stateChange(): " + state);

        if (state !== "poweredOn") {
            return;
        }

        DevicehiveConnector.init(function () {
            console.log("DeviceHive channel opened");
            
            noble.on('scanStart', app.onScanStart);
            noble.on('scanStop', app.onScanStop);
            noble.on('discover', app.onDiscover);
            
            noble.startScanning(app.serviceUUIDs, true);
            setTimeout(function () {
                noble.stopScanning();
            }, 60 * 1000);
        });
    },

    onScanStart: function () {
        console.log('Starting scanning for peripheral');
    },

    onScanStop: function () {
        console.log('Stopping peripheral scan');
    },

    onDiscover: function (peripheral) {

        // console.log("onDiscover()");

        if (peripheral.advertisement.localName !== 'SensorTag') {
            return;
        }

        if (peripheral.state !== 'disconnected') {
            return;
        }

        if (app.connectedPeripherals.indexOf(peripheral.uuid) != -1) {
            return;
        }

        app.connectedPeripherals.push(peripheral.uuid);


        app.subscribePeripheral(peripheral);
        peripheral.connect();
        console.log(peripheral);
    },

    subscribePeripheral: function (peripheral) {
        console.log("subscribePeripheral()");
        peripheral.on('connect', function () {
            app.onConnect(peripheral);
        });
        peripheral.on('disconnect', function () {
            app.onDisconnect(peripheral);
        });
        peripheral.on('servicesDiscover', function (services) {
            app.onServicesDiscover(peripheral, services);
        });
    },

    onConnect: function (peripheral) {
        console.log('Connected to ' + peripheral.uuid);
        peripheral.discoverServices();
    },

    onDisconnect: function (peripheral) {
        console.log('Disconnected from ' + peripheral.uuid);
    },

    onServicesDiscover: function (peripheral, services) {
        services.forEach(function (service) {
            console.log('Service: ' + service.uuid);
            service.on('characteristicsDiscover', function (characteristics) {
                app.onCharacteristicsDiscover(peripheral, characteristics);
            });
            service.discoverCharacteristics();
        });
    },

    onCharacteristicsDiscover: function (peripheral, characteristics) {
        characteristics.forEach(function (c) {
            var id = c.uuid.slice(4, 8);
            console.log('Characteristic: ' + id + ' ' + c.properties);
            var handler = app.characteristicHandlers[id];
            if (handler) {
                if (!app.tagNames[peripheral.uuid])
                {
                    app.tagNames[peripheral.uuid] = "Tag" + Object.keys(app.tagNames).length;
                }
                handler(c, id, peripheral.uuid);
            }
        })
    },

    tagNames: {},

    characteristicHandlers: {
        aa02: function (c, id) {
            c.write(new Buffer([0x01]), false, function (error) {
                console.log('Writing to ' + id + ': ' + error);
            });
        },

        aa12: function (c, id) {
            c.write(new Buffer([0x01]), false, function (error) {
                console.log('Writing to ' + id + ': ' + error);
            });
        },

        aa11: function (c, id, uuid) {
            c.notify(true, function (error) {
                console.log('Subscribing to notifications from ' + id + ': ' + error);
            });

            c.on('read', function (data, isNotification) {
                app.onAccelerometerRead(data, isNotification, uuid);
            });
        },

        aa01: function (c, id, uuid) {
            c.notify(true, function (error) {
                console.log('Subscribing to notifications from ' + id + ': ' + error);
            });

            c.on('read', function (data, isNotification) {
                app.onIRTempRead(data, isNotification, uuid);
            });
        },
    },

    onIRTempRead: function (data, isNotification, uuid) {
        console.log('Received notification from ' + uuid + ': ' + data.toString('hex'));
        var temp = this.extractTargetTemperature(data);
        console.log('Temperature = ' + temp);
        DevicehiveConnector.send('temperature', {
            time: new Date(),
            tag: app.tagNames[uuid],
            name: 'Temperature',
            value: temp
        });
    },

    onAccelerometerRead: function (data, isNotification, uuid) {
        console.log('Received notification from ' + uuid + ': ' + data.toString('hex'));

        var x = data.readInt8(0) / 64.0;
        var y = data.readInt8(1) / 64.0;
        var z = -1 * data.readInt8(2) / 64.0;

        var sum = x * x + y * y + z * z;

        console.log("Accelerometer: " + sum);

        DevicehiveConnector.send('accelerometer', {
            time: new Date(),
            tag: app.tagNames[uuid],
            name: 'Accelerometer',
            value: sum
        });
    },

    extractAmbientTemperature: function (t) {
        return t.readUInt16LE(2) / 128.0;
    },

    extractTargetTemperature: function (t) {

        var Vobj2 = t.readInt16LE(0);
        Vobj2 *= 0.00000015625;
        var Tdie = this.extractAmbientTemperature(t) + 273.15;

        var S0 = 5.593E-14; // Calibration factor
        var a1 = 1.75E-3;
        var a2 = -1.678E-5;
        var b0 = -2.94E-5;
        var b1 = -5.7E-7;
        var b2 = 4.63E-9;
        var c2 = 13.4;
        var Tref = 298.15;
        var S = S0 * (1 + a1 * (Tdie - Tref) + a2 * Math.pow((Tdie - Tref), 2));
        var Vos = b0 + b1 * (Tdie - Tref) + b2 * Math.pow((Tdie - Tref), 2);
        var fObj = (Vobj2 - Vos) + c2 * Math.pow((Vobj2 - Vos), 2);
        var tObj = Math.pow(Math.pow(Tdie, 4) + (fObj / S), 0.25);

        return tObj - 273.15;
    },
});

app.start();
