var config = require('nconf').argv().env().file({
    file: './config.json'
});
var SimulatorDevice = require('./device');

var devices = [];
var deviceDescriptions = config.get('devices');

var start = function (description) {
    var device = new SimulatorDevice(description.id, description.key, description.interval);
    device.start(function (err, res) {
        if (err) {
            return console.log('Error occurred: ' + (err.error || JSON.stringify(err)));
        }

        console.log('Device with id ' + description.id + ' Started successfully');
    });
    devices.push(device);
};

var startDelay = config.get('start-delay');
for (var i = 0; i < deviceDescriptions.length; i++) {
    var description = deviceDescriptions[i];
    // neccessary to fix 409 conflict error
    setTimeout(start.bind(void 0, description), i * startDelay);
}
