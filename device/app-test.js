var DevicehiveConnector = require('./devicehive-connector.js');

var app = ({
    
    start: function () {
        var deviceId = '{00000000-0000-0000-0000-000000000000}';
        DevicehiveConnector.init(deviceId, this.notify);
        console.log('app-test started...');
    },

    notify: function () {
        var $app = this;
        this.interval = setInterval(function () {
            
            DevicehiveConnector.send('equipment', {
                equipment: 'LED', 
                state: Math.round(Math.random() * 10) >= 5 ? 1 : 0
            });
            
            DevicehiveConnector.send('equipment', {
                equipment: 'temp', 
                temperature: Math.round(Math.random() * 36)
            });

        }, 2 * 1000);
    }
});

app.start();
