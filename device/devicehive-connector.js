global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DeviceHive = require('./devicehive/devicehive.device.js');
var config = require('nconf').argv().env().file({ file: './config.json' });

module.exports = {
    
    device: new DeviceHive(
        config.get('serviceUrl'), config.get('deviceId'), config.get('accessKey')),
    
    init: function (deviceKey, callback) {
        
        var self = this;
        this.device.registerDevice({ key: deviceKey }, 
            function (err, res) {
                if (err) {
                    return self.showError(err);
                }

                self.device.openChannel(function (err, name) {
                    if (err) {
                        return self.showError(err);
                    }
                    
                    callback(this.device);
                }, /*'websocket'*/ 'longpolling');
            });
    },
    
    send: function (notification, params) {
        var self = this;
        this.device.sendNotification(
            notification, params, 
            function (err, res) {
                self.notifCallback(err, res, params);
            });
    },
    
    notifCallback: function (err, res, params) {
        if (err) {
            return this.showError(err);
        }
        
        console.log('\nNotif sent OK id=' + res.id + ', ' + res.timestamp);
        console.log('\t' + JSON.stringify(params));
    },

    showError: function (err) { 
        console.log('Error: ' + JSON.stringify(err));
    }
};
