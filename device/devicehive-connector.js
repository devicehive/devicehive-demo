global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DeviceHive = require('./devicehive/devicehive.device.js');
var config = require('nconf').argv().env().file({
    file: './config.json'
});

module.exports = {

    device: new DeviceHive(
        config.get('serviceUrl'), config.get('deviceId'), config.get('accessKey')),

    init: function (callback) {

        var self = this;
        this.device.registerDevice({
                name: "Intel Edison With Sensor Tags",
                key: config.get('deviceKey'),
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
            },
            function (err, res) {
                if (err) {
                    return self.showError(err);
                }

                self.device.openChannel(function (err, name) {
                    if (err) {
                        return self.showError(err);
                    }

                    callback(this.device);
                }, 'websocket');
            });
    },

    send: function (notification, params) {
        var self = this;
        this.device.sendNotification(
            notification, params,
            function (err, res) {
                if (err) {
                    return console.log('Cannot send notification');
                }

                self.notifCallback(err, res.notification, params);
            });
    },

    notifCallback: function (err, res, params) {
        if (err) {
            return this.showError(err);
        }

        console.log(JSON.stringify(res));
        console.log('\nNotif sent OK id=' + res.id + ', ' + res.timestamp);
        console.log('\t' + JSON.stringify(params));
    },

    showError: function (err) {
        console.log('Error: ' + JSON.stringify(err));
    }
};
