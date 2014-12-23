var Equipment = function (dh, options) {
    this.dh = dh;
    this.name = options.name;
    this.code = options.code;
    this.interval = options.interval;
};

var generateTemperatureValue = function () {
    return Math.round(Math.random() * 36);
};

var generateAccelerometerValue = function () {
    return Math.round(Math.random() * 10) >= 5 ? 1 : 0;
};

Equipment.prototype.getDhDescription = function () {
    return {
        name: this.name + ' Sensor',
        type: 'SensorTag',
        code: this.code
    };
};

Equipment.prototype.start = function (handler) {
    var self = this;
    self._intervalHandler = setInterval(function () {
        var parameters = {
            time: new Date(),
            tag: self.code,
            name: self.name,
            value: self.name.toLowerCase() == 'accelerometer' ?
                generateAccelerometerValue() : generateTemperatureValue(),
        };

        self.dh.sendNotification(self.name.toLowerCase(), parameters, function (err, res) {
            return handler(err, parameters, self);
        });
    }, self.interval);
};

Equipment.prototype.stop = function () {
    return this._intervalHandler && clearInterval(this._intervalHandler);
};

module.exports = Equipment;
