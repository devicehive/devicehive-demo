var DevicehiveConnector = require('./devicehive-connector.js');
//var DeviceHive = require('./devicehive/devicehive.device.js');

var app = ({
    
    start: function () {
        //DevicehiveConnector.init(
        //    new DeviceHive('http://nnXXXX.pg.devicehive.com/api', 
        //        'someDeviceId_123-456', 
        //        'AccessKeyExampleAccessKeyExampleAccessKeyEx='),
        //    this.notify);
        
        // Use default DeviceHive
        DevicehiveConnector.init(this.notify);
        console.log('app started...');
    },
    
    notify: function () {
        
        // Now send notifications like this...
        DevicehiveConnector.send('telegram-to-home', {
            hey: 'joe', 
            foo: 'bar'
        });

    }
});

app.start();
