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
        
        this.createIndex(function () {
            app.initDh();
        });

        console.log('-- App started...');
    },
    
    initDh: function () {
        app.dhClient.getDevice(config.get('deviceId'), 
            function (err, device) {
                if (err) {
                    console.log('-- Could not connect to DeviceHive. Will retry in 5 secs...');
                
                    setTimeout(function () {
                        app.initDh();
                    }, 5 * 1000);
                    return;
                }
            
                app.logDeviceInfo(device);
                app.subscribeNotifications(device);
            });
    },
    
    createIndex: function (callback) {
        
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
            
            app.client.indices.create(params, function (err, res) {
                if (err) {
                    return app.logError(err);
                }
                
                console.log('-- Index created: ' + params.index);
                callback();
            });
        };
        
        this.deleteAndCreate(params, doCreateIndex);
    },
    
    deleteAndCreate: function (params, doCreateIndex) {
        this.client.indices.exists(params, 
            function (err, isExists) {
                if (err) {
                    return app.logError(err);
                }
            
                if (!isExists) {
                    doCreateIndex();
                    return;
                }

                app.client.indices.delete(params, function (err, res) {
                    if (err) {
                        return app.logError(err);
                    }
                    
                    console.log('-- Index deleted: ' + params.index);
                    doCreateIndex();
                });
            });
    },
    
    subscribeNotifications: function (device) {
        this.dhClient.channelStateChanged(function (data) {
            app.logChannelState(data.newState);
        });

        this.dhClient.openChannel(function (err, channel) {
            if (err) {
                return app.logError(err);
            }
            
            app.handleLostWsConnection(app.dhClient.channel, channel);

            var subscription = app.dhClient.subscribe(null, { deviceIds: device.id, });
            subscription.message(function () {
                app.handleNotification.apply(app, arguments);
            });
        }, 'websocket'/*'longpolling'*/);
    },
    
    handleLostWsConnection: function (channel, name) {
        
        if (name !== 'websocket') {
            return;
        }

        channel._wsApi._transport._native.onclose = function () {
            console.log('-- Websockets connection lost. Try to restore...');
            app.initDh();
        };
    },
    
    handleNotification: function (deviceId, notification) {
        notification.deviceId = deviceId;
        console.log(JSON.stringify(notification));
        app.client.index({
            index: config.get('elastic-index'), 
            type: config.get('elastic-type'), 
            body: notification.parameters
        }, function (err, res) {
            if (err) {
                return app.logError(err);
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
