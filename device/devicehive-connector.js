var DeviceHive = require('./devicehive/devicehive.device.js');
var config = require('nconf').argv().env().file({ file: './config.json' });

module.exports = {
    
    device: new DeviceHive(
        config.get('serviceUrl'), config.get('deviceId'), config.get('accessKey')),
    
    init: function (device, callback) {
        
        (arguments.length === 2) ?
            (this.device = device || this.device) : (callback = arguments[0]);

        this.device.openChannel(function (err, name) {
            if (err) {
                console.log(err);
                return;
            }
            
            callback(this.device);
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
            console.log(err.message);
            return;
        }
        
        console.log('\nNotif sent OK id=' + res.id + ', ' + res.timestamp);
        console.log('\t' + JSON.stringify(params));
    }
};
