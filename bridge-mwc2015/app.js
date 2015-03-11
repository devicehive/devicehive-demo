global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');
var DHClient = require('./devicehive/devicehive.client.js');
var config = require('nconf').argv().env().file({ file: require('path').resolve(__dirname, 'config.json') });
var elasticsearch = require('elasticsearch');

var app = {

    dhClient: new DHClient(config.get('serviceUrl'), config.get('accessKey')),

    // macs: [
    //     'BC:6A:29:AB:D9:73',
    //     // 'BC:6A:29:AB:DB:7A',
    //     // 'BC:6A:29:AB:0A:FE'
    // ],
    tags: {},
    lamps: {},
    lightThreshold: config.get('light-threshold'),

    client: new elasticsearch.Client({
        host: config.get('elastic-host')
    }),

    prevVaue: 0,

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
                    console.log(err);
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

    sendStartUpCommands: function (device, mac) {
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
        app.dhClient.sendCommand(device.id, 'xgatt/write',
            {
                device: mac,
                handle: 111,
                value: "01"
            });
        app.dhClient.sendCommand(device.id, 'xgatt/write',
            {
                device: mac,
                handle: 108,
                value: "0100"
            });
    },

    addTag: function(mac) {
        if (app.tags[mac] === undefined)
        {
            console.log('Adding tag: ' + mac);
            app.tags[mac] = {name : 'Tag' + Object.keys(app.tags).length};
        }
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

            setInterval(
                function() {
                    app.dhClient.sendCommand(device.id, 'scan/start', { timeout : 1 } ).result(function(err, res) {
                        var results = res.result;

                        for(var mac in results) {
                            console.log(results[mac]);
                            if (results[mac] === 'SensorTag') {
                                app.sendStartUpCommands(device, mac);
                                app.addTag(mac);
                            }

                            if (results[mac] === 'DELIGHT') {
                                app.lamps[mac] = { name: 'Lamp' + Object.keys(app.lamps).length};
                            }
                        }
                    }, 10000)
                },
                10000
            );

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
            var body = undefined 

            if (notification.parameters.handle === 37) {
                app.addTag(notification.parameters.device);
                body = app.toTempParams(notification)
            } else if (notification.parameters.handle === 107) {
                app.addTag(notification.parameters.device);
                body = app.toAmbientLightParams(notification)
                var mac = notification.parameters.device;
                var index = Object.keys(app.tags).indexOf(mac);
                var l = Object.keys(app.lamps);

                if ( (index != -1) && (index < l.length) )
                {
                    if (body.value < app.lightThreshold && app.tags[mac].light >= app.lightThreshold)
                    {
                        console.log("Sending ON");
                        app.dhClient.sendCommand(deviceId, 'xgatt/write',
                        {
                            device: l[index],
                            handle: 43,
                            value: "0f0d0300ffffffc800c800c8000059ffff"
                        });
                        
                        app.dhClient.sendCommand(deviceId, 'gatt/disconnect',
                        {
                            device: l[index]
                        });
                    } else if (body.value >= app.lightThreshold && app.tags[mac].light < app.lightThreshold)
                    {
                        console.log("Sending OFF");

                        app.dhClient.sendCommand(deviceId, 'xgatt/write',
                        {
                            device: l[index],
                            handle: 43,
                            value: "0f0d0300ffffff0000c800c8000091ffff"
                        });

                        app.dhClient.sendCommand(deviceId, 'gatt/disconnect',
                        {
                            device: l[index]
                        });

                    } 

                    app.tags[mac].light = body.value;
                }
            }

            if (body)
            {
                app.client.index({
                    index: config.get('elastic-index'),
                    type: config.get('elastic-type'),
                    body: body
                }, function (err, res) {
                    if (err) {
                        return app.logError(err);
                    }

                    console.log('-- Indexed: ' + JSON.stringify(res) + '\n');
                });
            } 
        }
    },

    toTempParams: function (notification) {
        var v =  {
            time: new Date(),
            tag: app.tags[notification.parameters.device].name,
            name: 'Temperature',
            value: app.extractTargetTemperature(new Buffer(notification.parameters.valueHex, 'hex'))
        }

        console.log(v)

        return v
    },

    toAmbientLightParams: function (notification) {
        var v =  {
            time: new Date(),
            tag: app.tags[notification.parameters.device].name,
            name: 'Light',
            value: app.extractAmbientLight(new Buffer(notification.parameters.valueHex, 'hex'))
        }

        console.log(v)

        return v
    },

    extractAmbientLight: function (t) {
        return t.readUInt16LE(0);
    },

    extractTargetTemperature: function (t) {
        return app.extractAmbientTemperature(t);

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
