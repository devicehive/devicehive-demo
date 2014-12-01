global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DHClient = require('./devicehive/devicehive.client.js');
var config = require('nconf').argv().env().file({ file: './config.json' });
var ElasticSearchClient = require('elasticsearchclient');
var elasticSearchClient = new ElasticSearchClient(config.get('elasticsearch'));

var app = ({
    
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
        }, /*'websocket'*/ 'longpolling');
    },
    
    handleNotification: function (deviceId, notification) {
        var self = this;
        notification.deviceId = deviceId;
        console.log(JSON.stringify(notification));
        elasticSearchClient.index('notifications', 'SensorReading', 
            notification, notification.id, 
            function (err, res) {
                if (err) {
                    return self.logError(err);
                }

                console.log('-- Indexed: ' + res + '\n');
            }
        );
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
