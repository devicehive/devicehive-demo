global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DeviceHive = require('./lib/devicehive.device.js');
var config = require('nconf').argv().env().file({
    file: './config.json'
});

var SimulatorDevice = function (id, key, interval) {
    this.dh = new DeviceHive(config.get('serviceUrl'), id, config.get('accessKey'));
    this.key = key;
    this.interval = interval;
};

SimulatorDevice.prototype._sendSample = function () {
    var self = this;
    this.dh.sendNotification('accelerometer', {
        time: new Date(),
        tag: 'b27c94fed9e64f60aa893aa4e6458095',
        name: 'Accelerometer',
        value: Math.round(Math.random() * 10) >= 5 ? 1 : 0
    }, function (err, res) {
        console.log(err ? 'Error ocurred: ' + err.error : 'Sent accelerometer notification for device ' + self.dh.deviceId);
    });

    this.dh.sendNotification('temperature', {
        time: new Date(),
        tag: '70f31319a57e4eaa97bb6dcb89ccb2c5',
        name: 'Temperature',
        value: Math.round(Math.random() * 36)
    }, function (err, res) {
        console.log(err ? 'Error ocurred: ' + err.error : 'Sent temperature notification for device ' + self.dh.deviceId);
    });
};

SimulatorDevice.prototype.start = function (cb) {
    var self = this;

    self.dh.registerDevice({
        name: "Intel Edison With Sensor Tags",
        key: self.key,
        network: {
            name: "Intel Edison Network"
        },
        status: "Online",
        deviceClass: {
            name: 'Intel Edison',
            version: '0.0.1',
            equipment: [{
                name: 'Temperature Sensor',
                type: 'SensorTag',
                code: '70f31319a57e4eaa97bb6dcb89ccb2c5'
            }, {
                name: 'Accelerometer Sensor',
                type: 'SensorTag',
                code: 'b27c94fed9e64f60aa893aa4e6458095'
            }]
        }
    }, function (err, res) {
        if (err) {
            return cb(err);
        }

        self.dh.openChannel(function (err, res) {
            if (err) {
                return cb(err);
            }

            self.intervalHandler = setInterval(function () {
                self._sendSample();
            }, self.interval);

            return cb();
        }, "websocket");
    });
};

SimulatorDevice.prototype.stop = function () {
    clearInterval(this.intervalHandler);
};

module.exports = SimulatorDevice;
