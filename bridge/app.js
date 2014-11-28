var DHClient = require('./devicehive/devicehive.client.js');
var config = require('nconf').argv().env().file({ file: './config.json' });

var app = (  {
    
    dhClient: new DHClient(config.get('serviceUrl'), config.get('accessKey')),

    start: function () {
        
        var self = this;
        this.dhClient.getDevice(config.get('deviceId'), 
            function (err, device) {
                if (err) {
                    return self.logError(err);
                }

                self.logDeviceInfo(device);
                self.subscribeNotifications(device);
            });

        console.log('-- App started...');
    },
    
    subscribeNotifications: function (device) {
        var self = this;
        this.dhClient.channelStateChanged(function (data) {
            self.logChannelState(data.newState);
        });

        this.dhClient.openChannel(function (err, channel) {
            if (err) {
                return self.logError(err);
            }
            
            var subscription = self.dhClient.subscribe(null, { deviceIds: device.id, });
            subscription.message(function () {
                self.handleNotification.apply(self, arguments);
            });
        });
    },
    
    handleNotification: function (deviceId, notification) {
        console.log(JSON.stringify(notification));
    },
    
    logChannelState: function (state) {
        var stateName = 'n/a';
        if (state === DHClient.channelStates.connected)
            stateName = 'Connected';
        else if (state === DHClient.channelStates.connecting)
            stateName = 'Connecting';
        else if (state === DHClient.channelStates.disconnected)
            stateName = 'Disconnected';
        console.log('-- Channel state: ' + stateName);
    },
    
    logDeviceInfo: function (device) {
        console.log('-- Device: ' + device.name);
        console.log('-- Status: ' + device.status);
    },

    logError: function (e) { 
        console.log('-- Error: ' + JSON.stringify(e));
    },
});

app.start();
