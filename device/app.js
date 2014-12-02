var noble = require('noble');
var DevicehiveConnector = require('./devicehive-connector.js');

var app = ({
    
    serviceUUIDs: [
        // '70f31319a57e4eaa97bb6dcb89ccb2c5'
    ], // default: [] => all
    
    start: function () {
        this.subscribeNoble();
    },
    
    subscribeNoble: function () {
        var self = this;
        noble.on('stateChange', function (state) {
            self.onStateChange.apply(self, [state]);
        });
        noble.on('scanStart', this.onScanStart);
        noble.on('scanStop', this.onScanStop);
        noble.on('discover', function (peripheral) {
            console.log("discover()");            
            self.onDiscover.apply(self, [peripheral]);
        });
    },
    
    onStateChange: function (state) {
        console.log("stateChange(): " + state);
        if (state === "poweredOn") {
            noble.startScanning(this.serviceUUIDs, true);
        }
    },
    
    onScanStart: function () {
        console.log('Starting scanning for peripheral');
    },
    
    onScanStop: function () {
        console.log('Stopping peripheral scan');
    },
    
    onDiscover: function (peripheral) {
        console.log("onDiscover()");
        
        if (peripheral.advertisement.localName !== 'SensorTag') {
            return;
        }
        
        if (peripheral.state !== 'disconnected') {
            return;
        }

        
        this.subscribePeripheral(peripheral);
        peripheral.connect();
        console.log(peripheral);
    },
    
    subscribePeripheral: function (peripheral) {
        console.log("subscribePeripheral()");
        var self = this;
        peripheral.on('connect', function () {
            self.onConnect.apply(self, [peripheral]);
        });
        peripheral.on('disconnect', function () {
            self.onDisconnect.apply(self, [peripheral]);
        });
        peripheral.on('servicesDiscover', function (services) {
            self.onServicesDiscover.apply(self, [peripheral, services]);
        });
    },
    
    onConnect: function (peripheral) {
        console.log('Connected to ' + peripheral.uuid);
        DevicehiveConnector.init(peripheral.uuid, function () {
            peripheral.discoverServices();
        });
    },
    
    onDisconnect: function (peripheral) {
        console.log('Disconnected from ' + peripheral.uuid);
    },
    
    onServicesDiscover: function (peripheral, services) {
        var self = this;
        services.forEach(function (service) {
            console.log('Service: ' + service.uuid);
            self.subscribeService(peripheral, service);
            service.discoverCharacteristics();
        });
    },
    
    subscribeService: function (peripheral, service) {
        var self = this;
        service.on('characteristicsDiscover', function (characteristics) {
            self.onCharacteristicsDiscover.apply(self, [peripheral, characteristics]);
        });
    },
    
    onCharacteristicsDiscover: function (peripheral, characteristics) {
        var self = this;
        characteristics.forEach(function (c) {
            var id = c.uuid.slice(4, 8);
            console.log('Characteristic: ' + id + ' ' + c.properties);
            if (self.characteristicHandlers[id]) {
                self.characteristicHandlers[id].apply(self, [c, id, peripheral.uuid]);
            }
        })
    },
    
    characteristicHandlers: {
        aa02: function (c, id) {
            c.write(new Buffer([0x01]), false, function (error) {
                console.log('Writing to ' + id + ': ' + error);
            });
        },

        aa01: function (c, id, uuid) {

            c.notify(true, function (error) {
                console.log('Subscribing to notifications from ' + id + ': ' + error);
            });

            var self = this;
            c.on('read', function (data, isNotification) {
                self.onAa01Read.apply(self, [data, isNotification, uuid]);
            });
        },
    },
    
    onAa01Read: function (data, isNotification, uuid) {
        console.log('Received notification from ' + uuid + ': ' + data.toString('hex'));
        var temp = this.extractTargetTemperature(data);
        console.log('Temperature = ' + temp);
        DevicehiveConnector.send('temperature', {
            time : new Date(),
            tag : uuid,
            name : 'Temperature',
            value : temp
        });
    },

    extractAmbientTemperature: function (t) {
        return t.readUInt16LE(2) / 128.0;
    },
    
    extractTargetTemperature: function (t) {
        
        var Vobj2 = t.readInt16LE(0);
        Vobj2 *= 0.00000015625;
        var Tdie = this.extractAmbientTemperature(t) + 273.15;
        
        var S0 = 5.593E-14;	// Calibration factor
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
