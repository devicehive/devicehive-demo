var DevicehiveConnector = require('./devicehive-connector.js');

var app = ({

    start: function () {
        var deviceKey = '{00000000-0000-0000-0000-000000000000}';
        DevicehiveConnector.init(deviceKey, this.notify);
        console.log('app-test started...');
    },

    notify: function () {
        var $app = this;
        this.interval = setInterval(function () {

            DevicehiveConnector.send('accelerometer', {
                time : new Date(),
                tag : 'b27c94fed9e64f60aa893aa4e6458095',
                name : 'Accelerometer',
                value : Math.round(Math.random() * 10) >= 5 ? 1 : 0
            });

            DevicehiveConnector.send('temperature', {
                time : new Date(),
                tag : '70f31319a57e4eaa97bb6dcb89ccb2c5',
                name : 'Temperature',
                value : Math.round(Math.random() * 36)
            });

        }, 2 * 1000);
    }
});

app.start();
