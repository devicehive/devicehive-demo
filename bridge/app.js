global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DHClient = require('./devicehive/devicehive.client.js');
var config = require('nconf').argv().env().file({ file: './config.json' });
var elasticsearch = require('elasticsearch');

var app = ({
    
    dhClient: new DHClient(config.get('serviceUrl'), config.get('accessKey')),
    
    client: new elasticsearch.Client({
        host: config.get('elastic-host')
    }),

    start: function () {
        
        var self = this;
        this.createIndex(function () {
            self.dhClient.getDevice(config.get('deviceId'), 
            function (err, device) {
                if (err) {
                    return self.logError(err);
                }
                
                self.logDeviceInfo(device);
                self.subscribeNotifications(device);
            });
        });

        console.log('-- App started...');
    },
    
    createIndex: function (callback) {
        
        var self = this;
        
        var params = {
            index: config.get('elastic-index')
        };
        
        var doCreateIndex = function () {
            params.body = {
                mappings: {
                    SensorReading: {
                        _source: {
                            enabled: false
                        },
                        properties: {
                            time: { type: 'date', format: 'date_time' },
                            tag: { type: 'string', index: 'not_analyzed' },
                            name: { type: 'string', index: 'not_analyzed' },
                            value: { type: 'float', index: 'not_analyzed' }
                        }
                    }
                }
            };
            
            self.client.indices.create(params, function (err, res) {
                if (err) {
                    return self.logError(err);
                }
                
                console.log('-- Index created: ' + params.index);
                callback();
            });
        };
        
        this.deleteAndCreate(params, doCreateIndex);
    },
    
    deleteAndCreate: function (params, doCreateIndex) {
        var self = this;
        this.client.indices.exists(params, 
            function (err, isExists) {
                if (err) {
                    return self.logError(err);
                }
            
                if (!isExists) {
                    doCreateIndex();
                    return;
                }

                self.client.indices.delete(params, function (err, res) {
                    if (err) {
                        return self.logError(err);
                    }
                    
                    console.log('-- Index deleted: ' + params.index);
                    doCreateIndex();
                });
            });
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
        }, 'websocket');
    },
    
    handleNotification: function (deviceId, notification) {
        var self = this;
        notification.deviceId = deviceId;
        console.log(JSON.stringify(notification));
        self.client.index({
            index: config.get('elastic-index'), 
            type: config.get('elastic-type'), 
            body: notification.parameters
        }, function (err, res) {
            if (err) {
                return self.logError(err);
            }
            
            console.log('-- Indexed: ' + JSON.stringify(res) + '\n');
        });
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
