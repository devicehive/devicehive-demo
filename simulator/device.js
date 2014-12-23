global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DeviceHive = require('./lib/devicehive.device.js');
var Equipment = require('./equipment.js');

var SimulatorDevice = function (options) {
    this.dh = new DeviceHive(options.serviceUrl, options.deviceId, options.accessKey);
    this.equipments = [];
    for (var i = 0; i < options.equipments.length; i++) {
        var equipment = new Equipment(this.dh, options.equipments[i]);
        this.equipments.push(equipment);
    }
    this.key = options.deviceKey;
};

SimulatorDevice.prototype._buildEquipments = function () {
    var res = [];

    for (var i = 0; i < this.equipments.length; i++) {
        res.push(this.equipments[i].getDhDescription());
    }

    return res;
};

SimulatorDevice.prototype.start = function (cb, handler) {
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
            equipment: self._buildEquipments()
        }
    }, function (err, res) {
        if (err) {
            return cb(err);
        }

        self.dh.openChannel(function (err, res) {
            if (err) {
                return cb(err);
            }

            for (var i = 0; i < self.equipments.length; i++) {
                self.equipments[i].start(handler);
            }

            return cb();
        }, "websocket");
    });
};

SimulatorDevice.prototype.stop = function () {
    for (var i = 0; i < this.equipments.length; i++) {
        this.equipments[i].stop();
    }
};

module.exports = SimulatorDevice;
