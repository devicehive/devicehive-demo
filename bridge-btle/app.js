global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DHClient = require('./devicehive/devicehive.client.js');
var config = require('nconf').argv().env().file({ file: require('path').resolve(__dirname, 'config.json') });
var elasticsearch = require('elasticsearch');

var app = {

    dhClient: new DHClient(config.get('serviceUrl'), config.get('accessKey')),

    macs: [
        'B4:99:4C:64:33:BE',
        'D0:5F:B8:31:37:9F'
    ],

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

        this.deleteAndCreate(params, app.doCreateIndex, callback);
    },

    deleteAndCreate: function (params, doCreateIndex, callback) {
        this.client.indices.exists(params,
            function (err, isExists) {
                if (err) {
                    return app.logError(err);
                }

                if (!isExists) {
                    app.doCreateIndex(params, callback);
                    return;
                }

                app.client.indices.delete(params, function (err) {
                    if (err) {
                        return app.logError(err);
                    }

                    console.log('-- Index deleted: ' + params.index);
                    app.doCreateIndex(params, callback);
                });
            });
    },

    doCreateIndex: function (params, callback) {
        params || (params = {});
        params.body = {
            mappings: {
                SensorReading: {
                    _source: {
                        enabled: false
                    },
                    properties: {
                        time: {type: 'date', format: 'date_time'},
                        tag: {type: 'string', index: 'not_analyzed'},
                        name: {type: 'string', index: 'not_analyzed'},
                        value: {type: 'float', index: 'not_analyzed'}
                    }
                }
            }
        };

        app.client.indices.create(params, function (err) {
            if (err) {
                return app.logError(err);
            }

            console.log('-- Index created: ' + params.index);
            callback();
        });
    },

    sendStartUpCommands: function (device) {
        app.macs.forEach(function (mac) {
            app.dhClient.sendCommand(device.id, 'xgatt/write',
                {
                    device: mac,
                    handle: 41,
                    value: "01"
                });
            app.dhClient.sendCommand(device.id, 'xgatt/write',
                {
                    device: mac,
                    handle: 38,
                    value: "0100"
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
            app.sendStartUpCommands(device);

            var subscription = app.dhClient.subscribe(null, {deviceIds: device.id});
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

        if (notification.notification === 'xgatt/value') {
            if (notification.parameters.handle === 37) {
                app.client.index({
                    index: config.get('elastic-index'),
                    type: config.get('elastic-type'),
                    body: app.toTempParams(notification)
                }, function (err, res) {
                    if (err) {
                        return app.logError(err);
                    }

                    console.log('-- Indexed: ' + JSON.stringify(res) + '\n');
                });
            } else if (notification.parameters.handle === 46) {
                console.log('-- Handle == 46. Not implemented.');
            }
        }
    },

    toTempParams: function (notification) {
        return {
            time: new Date(),
            tag: 'Tag01',
            name: 'Temperature',
            value: app.extractTargetTemperature(
                new Buffer(notification.parameters.valueHex, 'hex'))
        }
    },

    extractTargetTemperature: function (t) {

        var Vobj2 = t.readInt16LE(0);
        Vobj2 *= 0.00000015625;
        var Tdie = app.extractAmbientTemperature(t) + 273.15;

        var S0 = 5.593E-14; // Calibration factor
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

    extractAmbientTemperature: function (t) {
        return t.readUInt16LE(2) / 128.0;
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
    }
};

app.start();
