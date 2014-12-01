var DevicehiveConnector = require('./devicehive-connector.js');

var app = ({
    
    start: function () {
        var deviceId = '{00000000-0000-0000-0000-000000000000}';
        DevicehiveConnector.init(deviceId, this.notify);
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
