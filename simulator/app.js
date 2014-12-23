var config = require('nconf').argv().env().file({
    file: './config.json'
});
var SimulatorDevice = require('./device');

var options = config.get();
var device = new SimulatorDevice(options);
device.start(function (err, res) {
    if (err) {
        return console.log('Error occurred: ' + (err.error || JSON.stringify(err)));
    }

    console.log('Device with id ' + options.id + ' Started successfully');

}, function (err, sentParameter, equipment) {
    console.log(err ? 'Error ocurred: ' + err.error : 'Sent ' + equipment.code + ' notification for device');
});
