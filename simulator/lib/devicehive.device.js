(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.DHDevice = factory();
  }
}(this, function() {
var utils = (function () {
    'use strict';

    var utils = {
        guid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        },

        isFunction: function (val) {
            return val && Object.prototype.toString.call(val) === '[object Function]';
        },

        isArray: Array.isArray || function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        isArrayLike: function (arr) {
            return arr && arr.length >= 0 && arr.length === Math.floor(arr.length)
        },

        isString: function (obj) {
            return Object.prototype.toString.call(obj) === '[object String]';
        },

        isAccessKey: function (val) {
            return val.length === 44 && new RegExp('[A-Za-z0-9+/=]').test(val);
        },

        inArray: function (val, arr, ind) {
            if (!arr) {
                return;
            }

            if (!utils.isArrayLike(arr)) {
                throw new TypeError('utils.inArray second argument must be an array');
            }

            if (Array.prototype.indexOf && utils.isArray(arr)) {
                return arr.indexOf(val, ind);
            } else {
                var len = arr.length,
                    i = +ind || 0;

                if (!len || (i >= len)) {
                    return -1;
                }

                i = i < 0 ? Math.max(0, len + i) : i;

                for (; i < len; i++) {
                    if (i in arr && arr[i] === val) {
                        return i;
                    }
                }
            }
            return -1;
        },

        map: function (array, mapper) {
            if (!array) {
                return array;
            }

            if (!utils.isFunction(mapper)) {
                throw new TypeError(callback + ' is not a function');
            }

            var res = [];
            utils.forEach(array, function (i) {
                res.push(mapper.call(this, i, array));
            });

            return res;
        },

        reduce: function (array, callback /*, initialValue*/) {
            if (!array) {
                return array;
            }

            if (!utils.isFunction(callback)) {
                throw new TypeError(callback + ' is not a function');
            }

            var t = array, len = t.length >>> 0, k = 0, value;
            if (arguments.length == 3) {
                value = arguments[2];
            } else {
                while (k < len && !k in t) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        },

        forEach: function (obj, callback) {
            if (!obj) {
                return obj;
            }

            if (!utils.isFunction(callback)) {
                throw new TypeError(callback + ' is not a function');
            }

            var i;
            if (utils.isArrayLike(obj)) {
                var len = obj.length;
                for (i = 0; i < len; i++) {
                    if (callback.call(obj[i], i, obj) === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        if (callback.call(obj[i], i, obj) === false) {
                            break;
                        }
                    }
                }
            }
            return obj;
        },

        filter: function (obj, func) {
            if (!obj) {
                return obj;
            }

            if (!utils.isFunction(func)) {
                throw new TypeError(func + ' is not a function');
            }

            var res = [];

            utils.forEach(obj, function (i) {
                if (func.call(this, i, obj)) {
                    res.push(this);
                }
            });

            return res;
        },

        // custom to array because some environments do not support Array.prototype.slice.call(arguments)
        toArray: function (args) {
            return utils.filter(args, function () {
                return true;
            });
        },

        find: function (array, func) {
            var res = utils.filter(array, func);
            return res && res.length > 0 ? res[0] : null;
        },

        parseDate: function (date) {
            return new Date(date.substring(0, 4), parseInt(date.substring(5, 7), 10) - 1, date.substring(8, 10),
                date.substring(11, 13), date.substring(14, 16), date.substring(17, 19), date.substring(20, 23));
        },

        formatDate: function (date) {
            if (utils.isString(date))
                return date; // already formatted string - do not modify

            if (Object.prototype.toString.call(date) !== '[object Date]')
                throw new Error('Invalid object type');

            var pad = function (value, length) {
                value = String(value);
                length = length || 2;
                while (value.length < length)
                    value = "0" + value;
                return value;
            };

            return date.getUTCFullYear() + "-" + pad(date.getUTCMonth() + 1) + "-" + pad(date.getUTCDate()) + "T" +
                pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + ":" + pad(date.getUTCSeconds()) + "." + pad(date.getUTCMilliseconds(), 3);
        },

        encodeBase64: function (data) {
            var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
            var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = "", tmp_arr = [];
            if (!data) {
                return data;
            }
            do { // pack three octets into four hexets
                o1 = data.charCodeAt(i++);
                o2 = data.charCodeAt(i++);
                o3 = data.charCodeAt(i++);
                bits = o1 << 16 | o2 << 8 | o3;
                h1 = bits >> 18 & 0x3f;
                h2 = bits >> 12 & 0x3f;
                h3 = bits >> 6 & 0x3f;
                h4 = bits & 0x3f;

                // use hexets to index into b64, and append result to encoded string
                tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
            } while (i < data.length);
            enc = tmp_arr.join('');
            var r = data.length % 3;
            return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
        },

        noop: function () {
        },

        createCallback: function (cb) {
            return utils.isFunction(cb) ? cb : utils.noop;
        },

        serializeQuery: function (obj) {
            var str = '',
                key,
                val;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (str != '') {
                        str += '&';
                    }
                    val = obj[key];
                    val = val == null ? '' : val;
                    str += encodeURIComponent(key) + '=' + encodeURIComponent(val);
                }
            }
            return str;
        },

        makeUrl: function (params) {
            var method = params.method,
                url = params.url,
                data = params.data;

            if (method === 'GET') {
                if (data) {
                    data = utils.serializeQuery(data);
                    data && (url += (url.indexOf('?') != -1 ? '&' : '?') + data);
                }
            }
            return url;
        },

        serverErrorMessage: function (http) {
            var errMsg = 'DeviceHive server error';
            if (http.responseText) {
                try {
                    errMsg += ' - ' + JSON.parse(http.responseText).message;
                }
                catch (e) {
                    errMsg += ' - ' + http.responseText;
                }
            }
            return {error: errMsg, request: http};
        },

        errorMessage: function (msg) {
            return {error: 'DeviceHive error: ' + msg};
        },

        setTimeout: function (cb, delay) {
            return setTimeout(cb, delay);
        },

        clearTimeout: function (timeoutID) {
            clearTimeout(timeoutID);
        }
    };

    return utils;
}());
var Events = (function () {
    'use strict';

    var Events = function () {
    };

    Events.prototype = {
        bind: function (name, callback, context) {
            this._handlers || (this._handlers = {});
            var events = this._handlers[name] || (this._handlers[name] = []);
            events.push({callback: callback, context: context || this});

            var self = this;
            return {
                unbind: function(){
                    self.unbind(name, callback);
                }
            };
        },

        unbind: function (name, callback) {
            if (!name && !callback) {
                this._handlers = null;
                return this;
            }

            var events = this._handlers[name];
            if (!events) {
                return this;
            }

            if (!callback) {
                delete this._handlers[name];
                return this;
            }

            var remaining = [];

            utils.forEach(events, function () {
                var ev = this;
                if (callback && callback !== ev.callback) {
                    remaining.push(ev);
                }
            });

            if (remaining.length) {
                this._handlers[name] = remaining;
            } else {
                delete this._handlers[name];
            }

            return this;
        },

        trigger: function (name) {
            if (!this._handlers) {
                return this;
            }

            var args = utils.toArray(arguments).slice(1),
                events = this._handlers[name];

            events && this._triggerEvents(events, args);
            return this;
        },

        _triggerEvents: function (events, args) {
            utils.forEach(events, function () {
                var ev = this;
                ev.callback.apply(ev.context, args);
            });
        }

    };

    return Events;
}());
var http = (function () {
    'use strict';

    var getXhr = utils.noop();

    if (typeof XMLHttpRequest !== 'undefined') {
        getXhr = function () {
            return new XMLHttpRequest();
        };
    } else {
        getXhr = function () {
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {
                return null;
            }
        };
    }

    if (!getXhr()) {
        throw new Error('DeviceHive: XMLHttpRequest is not available');
    }

    return {
        send: function (params, cb) {
            params.method = params.method || 'GET';
            cb = utils.createCallback(cb);

            var xhr = getXhr(),
                headers = params.headers,
                url = utils.makeUrl(params),
                method = params.method;

            xhr.open(method, url, true);

            if (method == 'POST' || method == 'PUT') {
                xhr.setRequestHeader('Content-Type', 'application/json');
                params.data = JSON.stringify(params.data);
            }

            xhr.onreadystatechange = function () {
                var isSuccess, err;

                if (xhr.readyState === 4) {

                    isSuccess = xhr.status && xhr.status >= 200 && xhr.status < 300 || xhr.status === 304;
                    if (!isSuccess) {
                        err = utils.serverErrorMessage(xhr);
                    }

                    var result = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                    return cb(err, result);
                }
            };

            if (headers) {
                utils.forEach(headers, function (key) {
                    xhr.setRequestHeader(key, this);
                });
            }

            xhr.send(params.data || void 0);

            return {
                abort: function () {
                    xhr.abort();
                }
            }
        }
    }
}());
var restApi = (function () {
    'use strict';

    var authTypes = {
        USER: 1,
        KEY: 2,
        DEVICE: 4
    };

    var isFlagSet = function (variable, flag) {
        return (variable & flag) == flag;
    };

    var applyAuth = function (request, params) {
        var authType = params.authTypes;
        var auth = params.auth;
        request.headers = params.headers || {};

        if (!authType)
            return;

        if (!auth) {
            // library bug
            throw new Error('Authentication parameters must be specified for this endpoint. Endpoint auth code: ' + authType)
        }

        if (isFlagSet(authType, authTypes.KEY) && auth.accessKey) {
            // Set bearer token authorization
            request.headers['Authorization'] = 'Bearer ' + auth.accessKey;
        } else if (isFlagSet(authType, authTypes.DEVICE)
            && auth.deviceId && auth.deviceKey) {

            // Set Device authorization
            request.headers['Auth-DeviceID'] = auth.deviceId;
            request.headers['Auth-DeviceKey'] = auth.deviceKey;
        } else if (isFlagSet(authType, authTypes.USER)) {

            // Set User authorization
            request.headers['Authorization'] = 'Basic ' + utils.encodeBase64(auth.login + ':' + auth.password);
        } else {
            // library bug, therefore crash is necessary
            throw new Error('Invalid authentication parameters. Endpoint auth code: ' + authType);
        }
    };

    var send = function (params, cb) {
        var req = {
            method: params.method,
            url: params.base + params.relative,
            data: params.data
        };
        applyAuth(req, params);
        return http.send(req, cb);
    };

    return {

        /* API INFO */

        info: function (serviceUrl, cb) {
            return send({
                base: serviceUrl,
                relative: '/info',
                method: 'GET'
            }, cb);
        },

        /* ACCESS KEYS */

        getAccessKeys: function (serviceUrl, auth, userId, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey',
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        getAccessKey: function (serviceUrl, auth, userId, keyId, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey/' + userId,
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        insertAccessKey: function (serviceUrl, auth, userId, key, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey',
                data: key,
                method: 'POST',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        updateAccessKey: function (serviceUrl, auth, userId, keyId, key, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey/' + keyId,
                data: key,
                method: 'PUT',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        deleteAccessKey: function (serviceUrl, auth, userId, keyId, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/' + userId + '/accesskey/' + keyId,
                method: 'DELETE',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        /* DEVICE */

        getDevices: function (serviceUrl, auth, filter, cb) {
            return send({
                base: serviceUrl,
                relative: '/device',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        getDevice: function (serviceUrl, auth, deviceId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        getEquipmentState: function (serviceUrl, auth, deviceId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/equipment',
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        registerDevice: function (serviceUrl, auth, deviceId, device, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId,
                method: 'PUT',
                data: device,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        /* DEVICE CLASS */

        getDeviceClass: function (serviceUrl, auth, deviceClassId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/class/' + deviceClassId,
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        /* COMMAND */

        getCommands: function (serviceUrl, auth, deviceId, filter, cb) {
            if (filter && filter.start) {
                filter.start = utils.formatDate(filter.start);
            }
            if (filter && filter.end) {
                filter.end = utils.formatDate(filter.end);
            }

            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        getCommand: function (serviceUrl, auth, deviceId, cmdId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/' + cmdId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        insertCommand: function (serviceUrl, auth, deviceId, cmd, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command',
                method: 'POST',
                data: cmd,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        updateCommand: function (serviceUrl, auth, deviceId, cmdId, cmd, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/' + cmdId,
                method: 'PUT',
                data: cmd,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        pollCommands: function (serviceUrl, auth, deviceId, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        pollManyCommands: function (serviceUrl, auth, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/command/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        waitCommandResult: function (serviceUrl, auth, deviceId, cmdId, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/command/' + cmdId + '/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        /* NOTIFICATION */

        getNotifications: function (serviceUrl, auth, deviceId, filter, cb) {
            if (filter && filter.start) {
                filter.start = utils.formatDate(filter.start);
            }
            if (filter && filter.end) {
                filter.end = utils.formatDate(filter.end);
            }

            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        getNotification: function (serviceUrl, auth, deviceId, notificationId, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification/' + notificationId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        insertNotification: function (serviceUrl, auth, deviceId, notification, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification',
                method: 'POST',
                data: notification,
                authTypes: authTypes.USER | authTypes.KEY | authTypes.DEVICE,
                auth: auth
            }, cb);
        },

        pollNotifications: function (serviceUrl, auth, deviceId, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/' + deviceId + '/notification/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        pollManyNotifications: function (serviceUrl, auth, params, cb) {
            return send({
                base: serviceUrl,
                relative: '/device/notification/poll',
                method: 'GET',
                data: params,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        /* NETWORK */

        getNetworks: function (serviceUrl, auth, filter, cb) {
            return send({
                base: serviceUrl,
                relative: '/network',
                method: 'GET',
                data: filter,
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        getNetwork: function (serviceUrl, auth, networkId, cb) {
            return send({
                base: serviceUrl,
                relative: '/network/' + networkId,
                method: 'GET',
                authTypes: authTypes.USER | authTypes.KEY,
                auth: auth
            }, cb);
        },

        insertNetwork: function (serviceUrl, auth, network, cb) {
            return send({
                base: serviceUrl,
                relative: '/network',
                method: 'POST',
                data: network,
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        updateNetwork: function (serviceUrl, auth, networkId, network, cb) {
            return send({
                base: serviceUrl,
                relative: '/network/' + networkId,
                method: 'PUT',
                data: network,
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        deleteNetwork: function (serviceUrl, auth, networkId, cb) {
            return send({
                base: serviceUrl,
                relative: '/network/' + networkId,
                method: 'DELETE',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        /* OAUTH CLIENT */

        /* OAUTH GRANT */

        /* USER */

        getCurrentUser: function (serviceUrl, auth, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/current',
                method: 'GET',
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        },

        updateCurrentUser: function (serviceUrl, auth, user, cb) {
            return send({
                base: serviceUrl,
                relative: '/user/current',
                method: 'PUT',
                data: user,
                authTypes: authTypes.USER,
                auth: auth
            }, cb);
        }
    };
}());
var DeviceHive = (function () {
    'use strict';

    var changeChannelState = function (self, newState, oldState) {
            oldState = oldState || self.channelState;
            if (oldState === self.channelState) {
                self.channelState = newState;
                self._events = self._events || new Events();
                self._events.trigger('onChannelStateChanged', { oldState: oldState, newState: newState });
                return true;
            }
            return false;
        },
        findSubscription = function (channel, id) {
            return utils.find(channel.subscriptions, function () {
                return this.id === id;
            });
        },
        removeSubscription = function (channel, subscription) {
            var index = channel.subscriptions.indexOf(subscription);
            channel.subscriptions.splice(index, 1);
            subscription._changeState(Subscription.states.unsubscribed);
        };

    /**
     * DeviceHive channel states
     * @readonly
     * @enum {number}
     */
    var channelStates = {
        /** channel is not connected */
        disconnected: 0,
        /** channel is being connected */
        connecting: 1,
        /** channel is connected */
        connected: 2
    };

    /**
     * @callback openChannelCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} channel - A name of the opened channel
     */

    /**
     * @typedef {Object} State
     * @property {Number} oldState - previous state
     * @property {Number} newState - current state
     */

    /**
     * @callback channelStateChangedCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {State} state - A channel state object
     */

    /**
     * @callback subscribeCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Subscription} subscription - added subscription object
     */

    /**
     * @callback unsubscribeCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Subscription} subscription - removed subscription object
     */

    /**
     * @typedef {Object} SubscribeParameters
     * @property {function} onMessage - a callback that will be invoked when a message is received
     * @property {(Array | String)} deviceIds - single device identifier, array of identifiers or null (subscribe to all devices)
     * @property {(Array | String)} names - notification name, array of notifications or null (subscribe to all notifications)
     */

    /**
     * Core DeviceHive class
     */
    DeviceHive = {
        channelStates: channelStates,

        /**
         * Current channel state
         */
        channelState: channelStates.disconnected,

        /**
         * Opens the first compatible communication channel to the server
         *
         * @param {openChannelCb} cb - The callback that handles the response
         * @param {(Array | String)} [channels = null] - Channel names to open. Default supported channels: 'websocket', 'longpolling'
         */
        openChannel: function (cb, channels) {
            cb = utils.createCallback(cb);

            if (!changeChannelState(this, this.channelStates.connecting, this.channelStates.disconnected)) {
                cb(null);
                return;
            }

            var self = this;

            function manageInfo(info) {
                self.serverInfo = info;

                if (!channels) {
                    channels = [];
                    utils.forEach(self._channels, function (t) {
                        channels.push(t);
                    });
                }
                else if (!utils.isArray(channels)) {
                    channels = [channels];
                }

                var emptyChannel = true;

                (function checkChannel(channels) {
                    utils.forEach(channels, function (ind) { // enumerate all channels in order
                        var channel = this;
                        if (self._channels[channel]) {
                            self.channel = new self._channels[channel](self);
                            self.channel.open(function (err) {
                                if (err) {
                                    var channelsToCheck = channels.slice(++ind);
                                    if (!channelsToCheck.length)
                                        return cb(utils.errorMessage('Cannot open any of the specified channels'));
                                    checkChannel(channelsToCheck);
                                } else {
                                    changeChannelState(self, self.channelStates.connected);
                                    cb(null, channel);
                                }
                            });

                            return emptyChannel = false;
                        }
                    });
                })(channels);

                emptyChannel && cb(utils.errorMessage('None of the specified channels are supported'));
            }

            if (this.serverInfo) {
                manageInfo(this.serverInfo);
            } else {
                restApi.info(this.serviceUrl, function (err, res) {
                    if (!err) {
                        manageInfo(res);
                    } else {
                        changeChannelState(self, self.channelStates.disconnected);
                        cb(err, res);
                    }
                });
            }
        },

        /**
         * Closes the communications channel to the server
         *
         * @param {noDataCallback} cb - The callback that handles the response
         */
        closeChannel: function (cb) {
            cb = utils.createCallback(cb);

            if (this.channelState === this.channelStates.disconnected)
                return cb(null);

            var self = this;
            if (this.channel) {
                this.channel.close(function (err, res) {
                    if (err) {
                        return cb(err, res);
                    }

                    utils.forEach(utils.toArray(self.channel.subscriptions), function () {
                        removeSubscription(self.channel, this);
                    });

                    self.channel = null;

                    changeChannelState(self, self.channelStates.disconnected);
                    return cb(null);
                });
            }
        },

        /**
         * Adds a callback that will be invoked when the communication channel state is changed
         *
         * @param {channelStateChangedCb} cb - The callback that handles an event
         */
        channelStateChanged: function (cb) {
            cb = utils.createCallback(cb);

            var self = this;
            this._events = this._events || new Events();
            return this._events.bind('onChannelStateChanged', function (data) {
                cb.call(self, data);
            });
        },


        /**
         * Subscribes to messages and return a subscription object
         *
         * @param {subscribeCb} cb - The callback that handles the response
         * @param {SubscribeParameters} [params = null] - Subscription parameters
         * @return {Subscription} - Added subscription object
         */
        subscribe: function (cb, params) {
            this._ensureConnectedState();
            cb = utils.createCallback(cb);
            params = params || {};

            var channel = this.channel;
            var subscription = new Subscription(params.deviceIds, params.names, params.onMessage);
            channel.subscriptions.push(subscription);
            subscription._changeState(Subscription.states.subscribing);

            channel.subscribe(subscription, function (err, id) {
                if (err) {
                    removeSubscription(channel, subscription);
                    return cb(err);
                }

                subscription._setId(id);
                subscription._changeState(Subscription.states.subscribed);

                return cb(err, subscription);
            });

            return subscription;
        },

        /**
         * Remove subscription to messages
         *
         * @param {(String | Subscription)} subscriptionOrId - Identifier of the subscription or subscription object returned by subscribe method
         * @param {unsubscribeCb} cb - The callback that handles the response
         * @return {Subscription} - Added subscription object
         * @throws Will throw an error if subscriptionId was not found
         */
        unsubscribe: function (subscriptionOrId, cb) {
            this._ensureConnectedState();
            cb = utils.createCallback(cb);
            var channel = this.channel;

            if (!subscriptionOrId)
                throw new Error('Subscription must be defined. To unsubscribe from all subscriptions just close the channel');

            var subscription = subscriptionOrId;

            if (!(subscriptionOrId instanceof Subscription)) {
                subscription = findSubscription(channel, subscriptionOrId);

                if (!subscription)
                    return cb(utils.errorMessage('Subscription with id ' + subscriptionOrId + ' was not found'));
            }

            if (subscription.state === Subscription.states.unsubscribed) {
                return cb(null);
            }

            return channel.unsubscribe(subscription, function (err) {
                if (err)
                    return cb(err);

                removeSubscription(channel, subscription);

                return cb(err, subscription);
            });
        },

        _ensureConnectedState: function () {
            if (this.channelState === this.channelStates.disconnected) {
                throw new Error('DeviceHive: Channel is not opened, call the .openChannel() method first');
            }
            if (this.channelState === this.channelStates.connecting) {
                throw new Error('DeviceHive: Channel has not been initialized, use .openChannel().done() to run logic after the channel is initialized');
            }
        }
    };

    return DeviceHive;
}());

/**
 * A callback function which is executed when an operation has been completed
 * @callback noDataCallback
 * @param {DHError} err - An error object if any errors occurred
 */

/**
 * Error object which is passed to the callback if an error occurred
 * @typedef {Object} DHError
 * @property {boolean} error - Error message
 * @property {boolean} http - An object representing a transport mechanism if an error is related ot transport problems.
 */

/**
 * Http request object
 * @typedef {Object} Http
 * @property {function} abort - Aborts current request
 */
var Subscription = (function () {
    'use strict';

    /**
     * Subscription object constructor
     *
     * @class
     * @private
     */
    var Subscription = function (deviceIds, names, onMessage) {
        if (deviceIds && !utils.isArray(deviceIds)) {
            deviceIds = [deviceIds];
        }

        if (names && !utils.isArray(names)) {
            names = [names];
        }

        this.deviceIds = deviceIds || null;
        this.names = names || null;
        this.state = Subscription.states.unsubscribed;

        this._events = new Events();

        this.message(onMessage);
    };

    /**
     * @callback subscriptionStateChangedCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {State} state - A channel state object
     */

    /**
     * @callback messageReceivedCb
     * @param {Object} message - Received message
     */

    /**
     * Adds a callback that will be invoked when the subscription state is changed
     *
     * @param {subscriptionStateChangedCb} cb - The callback that handles an event
     */
    Subscription.prototype.stateChanged = function (cb) {
        cb = utils.createCallback(cb);

        var self = this;
        return this._events.bind('onStateChanged', function (data) {
            cb.call(self, data);
        });
    };

    /**
     * Adds a callback that will be invoked when a message is received
     *
     * @param {messageReceivedCb} cb - The callback that handles an event
     */
    Subscription.prototype.message = function (cb) {
        cb = utils.createCallback(cb);
        return this._events.bind('onMessage', cb);
    };

    Subscription.prototype._handleMessage = function (msg) {
        if(this.state !== Subscription.states.subscribed)
            return;

        this._events.trigger.apply(this._events, ['onMessage'].concat(utils.toArray(arguments)))
    };

    Subscription.prototype._changeState = function (newState) {
        if (this.state === newState) {
            return false;
        }

        var oldState = this.state;
        this.state = newState;
        this._events.trigger('onStateChanged', { oldState: oldState, newState: newState });
    };

    Subscription.prototype._setId = function (id) {
        this.id = id || utils.guid();
    };

    Subscription.prototype.toJSON = function () {
        return { deviceIds: this.deviceIds, names: this.names, state: this.state };
    };

    /**
     * Subscription states
     * @readonly
     * @enum {number}
     */
    Subscription.states = {
        /** subscription is unsubscribed */
        unsubscribed: 0,
        /** subscription is being subscribed */
        subscribing: 1,
        /** subscription is subscribed */
        subscribed: 2
    };

    return Subscription;
}());
var LongPollingChannel = (function () {
    'use strict';

    var setSubKeys = function (sub, subscription, val) {
            utils.forEach(subscription.deviceIds, function () {
                sub.deviceIds[this] = val;
            });

            utils.forEach(subscription.names, function () {
                sub.names[this] = val;
            });
        },
        addSubscription = function (sub, subscription) {
            !subscription.deviceIds && ++sub.allDeviceIds;
            !subscription.names && ++sub.allNames;

            setSubKeys(sub, subscription, true);
        },
        removeSubscription = function (sub, subscription) {
            !subscription.deviceIds && --sub.allDeviceIds;
            !subscription.names && --sub.allNames;

            setSubKeys(sub, subscription, false);
        },
        keysToArray = function (obj) {
            var keys = [];

            utils.forEach(obj, function (i) {
                obj[i] && keys.push(i);
            });

            return keys;
        },
        isSubEmpty = function (sub) {
            return !sub.allDeviceIds && !sub.allNames
                && keysToArray(sub.deviceIds).length === 0 && keysToArray(sub.names).length === 0;
        }, arrayToLowerCase = function (arr) {
            return utils.map(arr, function () {
                return this.toLowerCase();
            });
        };

    // LongPolling channel should maintain 1 global http connection
    // for all subscriptions, because some environments have a limit of maximum parallel http connections
    // check http://stackoverflow.com/a/11185668 for more information related to browser
    var LongPollingChannel = {
        open: function (cb) {
            cb = utils.createCallback(cb);

            this._sub = { deviceIds: {}, allDeviceIds: 0, names: {}, allNames: 0 };

            var pollParams = this._pollParams;
            var self = this;
            this._lp = new LongPolling(this._hive.serviceUrl, {
                executePoll: function (params, continuePollCb) {
                    params.deviceGuids = self._sub.allDeviceIds > 0 ? null : keysToArray(self._sub.deviceIds);
                    params.names = self._sub.allNames > 0 ? null : keysToArray(self._sub.names);

                    return pollParams.executePoll(params, continuePollCb);
                },
                resolveTimestamp: pollParams.resolveTimestamp,
                onData: function (data) {
                    var subs = self.subscriptions,
                        name = pollParams.resolveName(data).toLowerCase(),
                        deviceId = pollParams.resolveDeviceId(data).toLowerCase();

                    var relevantSubscriptions = utils.filter(subs, function () {
                        return (this.names === null || utils.inArray(name, arrayToLowerCase(this.names)) > -1)
                            && (this.deviceIds === null || utils.inArray(deviceId, arrayToLowerCase(this.deviceIds)) > -1);
                    });

                    utils.forEach(relevantSubscriptions, function () {
                        var sub = this;

                        // if error is thrown in the inner callback it will not affect the entire longpolling flow
                        utils.setTimeout(function(){
                            sub._handleMessage.apply(this, pollParams.resolveDataArgs(data));
                        }, 0);
                    });
                }
            });

            return cb(null);
        },

        close: function (cb) {
            cb = utils.createCallback(cb);

            this._lp.stopPolling();
            return cb(null);
        },

        subscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);
            this._lp.stopPolling();

            addSubscription(this._sub, subscription);

            return this._lp.startPolling(cb);
        },

        unsubscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            removeSubscription(this._sub, subscription);

            this._lp.stopPolling();

            if (isSubEmpty(this._sub)) {
                return cb(null);
            }

            return this._lp.startPolling(cb);
        }
    };

    return LongPollingChannel;
}());
var LongPolling = (function () {
    'use strict';

    var poll = function (self, timestamp) {
        var params = { timestamp: timestamp };

        var continuePollingCb = function (err, res) {
            if (!err) {
                var lastTimestamp = null;
                if (res) {
                    utils.forEach(res, function () {
                        var newTimestamp = self._poller.resolveTimestamp(this);
                        if (!lastTimestamp || newTimestamp > lastTimestamp) {
                            lastTimestamp = newTimestamp;
                        }

                        self._poller.onData(this);
                    });
                }

                poll(self, lastTimestamp || timestamp);
            } else {
                if (self._polling) {
                    // Polling unexpectedly stopped probably connection was lost. Try reconnect in 1 second
                    utils.setTimeout(function () {
                        poll(self, timestamp);
                    }, 1000);
                }
            }
        };

        self._request = self._polling && self._poller.executePoll(params, continuePollingCb);
    };

    var LongPolling = function (serviceUrl, poller) {
        this.serviceUrl = serviceUrl;
        this._poller = poller
    };

    LongPolling.prototype = {
        startPolling: function (cb) {
            cb = utils.createCallback(cb);

            this._polling = true;

            var self = this;
            return this._request = restApi.info(this.serviceUrl, function (err, res) {
                if (err){
                    var wasPolling = self._polling;
                    self._polling = false;
                    return cb(wasPolling ? err : null);
                }

                poll(self, res.serverTimestamp);
                return cb(null);
            });
        },

        stopPolling: function () {
            this._polling = false;
            this._request && this._request.abort();
        }
    };

    return LongPolling;
}());
var WebSocketTransport = (function () {
    'use strict';

    var WebSocketTransport = utils.noop;

    WebSocketTransport.requestTimeout = 10000;

    WebSocketTransport.prototype = {
        _handler: utils.noop,

        open: function (url, cb) {
            cb = utils.createCallback(cb);

            var notSupportedErr = utils.errorMessage('WebSockets are not supported');
            try {
                if (!WebSocket) {
                    return cb(notSupportedErr);
                }
            } catch (e){
                return cb(notSupportedErr);
            }

            var self = this;
            var opened = false;

            this._native = new WebSocket(url);

            this._native.onopen = function (e) {
                opened = true;
                cb(null, e);
            };

            this._native.onmessage = function (e) {
                var response = JSON.parse(e.data);

                if (self._requests && response.requestId) {
                    var request = self._requests[response.requestId];
                    if (request) {
                        utils.clearTimeout(request.timeout);
                        if (response.status && response.status == 'success') {
                            request.cb(null, response);
                        }
                        else {
                            request.cb({error: response.error});
                        }
                        delete self._requests[response.requestId];
                    }
                }
                else {
                    self._handler(response);
                }
            };

            this._native.onclose = function (e) {
                if (!opened) {
                    var err = utils.errorMessage('WebSocket connection has failed to open');
                    err.data = e;
                    return cb(err);
                }
            };
        },

        close: function (cb) {
            cb = utils.createCallback(cb);

            this._native.onclose = function (e) {
                return cb(null, e);
            };

            this._native.close();
        },

        message: function (cb) {
            this._handler = cb;
        },

        send: function (action, data, cb) {
            cb = utils.createCallback(cb);

            var self = this,
                request = {};

            this._requestId = this._requestId || 0;
            request.id = ++this._requestId;
            //callback for request
            request.cb = cb;
            request.timeout = utils.setTimeout(function () {
                request.cb(utils.errorMessage('Operation timeout'));
                delete self._requests[request.id];
            }, WebSocketTransport.requestTimeout);

            this._requests = this._requests || {};
            this._requests[request.id] = request;

            data = data || {};
            data.requestId = request.id;
            data.action = action;
            this._native.send(JSON.stringify(data));

            return request;
        }
    };

    return WebSocketTransport;
}());
var WebSocketClientApi = (function () {
    'use strict';

    var WebSocketClientApi = function () {
        var events = new Events();
        this._events = events;
        this._transport = new WebSocketTransport();
        this._transport.message(function (response) {
            if (response.action == 'command/insert' && response.command && response.command.id) {
                events.trigger('onCommandInsert', response);
            }

            if (response.action == 'command/update') {
                events.trigger('onCommandUpdate', response);
            }

            if (response.action == 'notification/insert' && response.deviceGuid && response.notification) {
                events.trigger('onNotificationInsert', response);
            }
        });
    };

    WebSocketClientApi.prototype = {
        open: function (baseUrl, cb) {
            this._transport.open(baseUrl + '/client', cb);
        },
        close: function (cb) {
            this._transport.close(cb);
        },

        getInfo: function (cb) {
            this._transport.send('server/info', null, cb);
        },

        authenticate: function (username, password, key, cb) {
            this._transport.send('authenticate', {
                login: username,
                password: password,
                accessKey: key
            }, cb);
        },

        sendCommand: function (params, cb) {
            this._transport.send('command/insert', params, cb);
        },
        updateCommand: function (params, cb) {
            this._transport.send('command/update', params, cb);
        },
        commandSubscribe: function (params, cb) {
            this._transport.send('command/subscribe', params, cb);
        },
        commandUnSubscribe: function (params, cb) {
            this._transport.send('command/unsubscribe', params, cb);
        },

        sendNotification: function (params, cb) {
            this._transport.send('notification/insert', params, cb);
        },
        notificationSubscribe: function (params, cb) {
            this._transport.send('notification/subscribe', params, cb);
        },
        notificationUnSubscribe: function (params, cb) {
            this._transport.send('notification/unsubscribe', params, cb);
        }
    };

    return WebSocketClientApi;
}());
var WebSocketDeviceApi = (function () {
    'use strict';

    var WebSocketDeviceApi = function () {
        var events = new Events();
        this._events = events;
        this._transport = new WebSocketTransport();
        this._transport.message(function (response) {
            if (response.action == 'command/insert' && response.command && response.command.id) {
                events.trigger('onCommandInsert', response);
            }
        });
    };

    WebSocketDeviceApi.prototype = {
        open: function (baseUrl, cb) {
            return this._transport.open(baseUrl + '/device', cb);
        },
        close: function (cb) {
            return this._transport.close(cb);
        },

        getInfo: function (cb) {
            this._transport.send('server/info', null, cb);
        },

        authenticate: function (deviceId, deviceKey, cb) {
            this._transport.send('authenticate', {
                deviceId: deviceId,
                deviceKey: deviceKey
            }, cb);
        },

        updateCommand: function (params, cb) {
            this._transport.send('command/update', params, cb);
        },
        commandSubscribe: function (params, cb) {
            this._transport.send('command/subscribe', params, cb);
        },
        commandUnSubscribe: function (params, cb) {
            this._transport.send('command/unsubscribe', params, cb);
        },

        sendNotification: function (params, cb) {
            this._transport.send('notification/insert', params, cb);
        }
    };

    return WebSocketDeviceApi;
}());
var LongPollingDeviceChannel = (function () {
    'use strict';

    var LongPollingDeviceChannel = function (hive) {
        this.subscriptions = [];

        this._hive = hive;

        this._pollParams = {
            executePoll: function (params, continuePollCb) {
                return hive._executeApi(restApi.pollCommands, [params, continuePollCb]);
            },
            resolveTimestamp: function (data) {
                return data.timestamp;
            },
            resolveDataArgs: function (data) {
                return [hive.deviceId, data];
            },
            resolveName: function (data) {
                return data.command;
            },
            resolveDeviceId: function () {
                return hive.deviceId;
            }
        };
    };

    LongPollingDeviceChannel.prototype = LongPollingChannel;
    LongPollingDeviceChannel.constructor = LongPollingDeviceChannel;

    LongPollingDeviceChannel.prototype.sendNotification = function (params, cb) {
        cb = utils.createCallback(cb);
        return this._hive._executeApi(restApi.insertNotification, [params.notification, cb]);
    };

    LongPollingDeviceChannel.prototype.updateCommand = function (cmd, cb) {
        cb = utils.createCallback(cb);
        return this._hive._executeApi(restApi.updateCommand, [cmd.commandId, cmd.command, cb]);
    };

    return LongPollingDeviceChannel;
}());
var WebSocketDeviceChannel = (function () {
    'use strict';

    var WebSocketDeviceChannel = function (hive) {
        this.subscriptions = [];
        this.compatibilityMode = !hive.auth.accessKey;

        this._hive = hive;
    };

    WebSocketDeviceChannel.prototype = {
        open: function (cb) {
            cb = utils.createCallback(cb);

            var webSocketUrl = this._hive.serverInfo.webSocketServerUrl;

            if (!webSocketUrl) {
                cb(utils.errorMessage('Open channel failed. Cannot get web socket server url'));
                return;
            }

            var self = this;

            this._wsApi = this.compatibilityMode
                ? new WebSocketDeviceApi()
                : new WebSocketClientApi();

            this._wsApi._events.bind('onCommandInsert', function (cmd) {
                var subscriptionsToHandle = self.subscriptions;

                if(!self.compatibilityMode){
                    subscriptionsToHandle = utils.find(self.subscriptions, function () {
                        return this.id === cmd.subscriptionId;
                    });
                    subscriptionsToHandle = [subscriptionsToHandle];
                }

                utils.forEach(subscriptionsToHandle, function(){
                    this._handleMessage(self._hive.deviceId, cmd.command);
                });
            });

            this._wsApi.open(webSocketUrl, function onOpen(err) {
                if (err)
                    return cb(err);

                if (self._hive.auth.accessKey) {
                    self._wsApi.authenticate(null, null, self._hive.auth.accessKey, cb);
                } else {
                    self._wsApi.authenticate(self._hive.auth.deviceId, self._hive.auth.deviceKey, cb);
                }
            });
        },

        close: function (cb) {
            cb = utils.createCallback(cb);
            this._wsApi.close(cb);
        },

        subscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            if(subscription.names && this.compatibilityMode){
                throw new Error('Command name filtering is not supported for deviceKey authentication and websocket channel. Note: device key auth is deprecated, use access key auth instead.')
            }

            if (!subscription) {
                return cb(null);
            }

            if(this.compatibilityMode && this.subscriptions.length > 1){
                return cb(null);
            }

            this._wsApi.commandSubscribe(this.compatibilityMode ? null : {
                deviceGuids: subscription.deviceIds,
                names: subscription.names
            }, function (err, res) {
                return cb(err, res && res.subscriptionId);
            });
        },

        unsubscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            // in compatibility mode if there are more than 1 subscription
            // do not unsubscribe from messages
            if(this.compatibilityMode && this.subscriptions.length > 1){
                return cb(null);
            }

            this._wsApi.commandUnSubscribe({ subscriptionId: subscription.id }, cb);
        },

        sendNotification: function (params, cb) {
            cb = utils.createCallback(cb);
            this._wsApi.sendNotification(params, cb);
        },

        updateCommand: function (cmd, cb) {
            cb = utils.createCallback(cb);
            this._wsApi.updateCommand(cmd, cb);
        }
    };

    return WebSocketDeviceChannel;
}());
var DHDevice = (function () {
    'use strict';

    /**
     * DHDevice object constructor
     * Specify device key or access key as an authentication/authorization parameters
     * Auth type is predicted based on the parameters of the supplied string
     *
     * Note that authentication with device key is deprecated and will be removed in future
     *
     * @class
     * @global
     * @augments DeviceHive
     * @param {String} serviceUrl - DeviceHive cloud API url
     * @param {String} deviceId - Device unique identifier
     * @param {String} accessKeyOrDeviceKey - Access key or device key (device key is deprecated) used for auth
     * @param {Boolean} forceDeviceKeyAuth - Force using the third parameter as a device key
     */
    var DHDevice = function (serviceUrl, deviceId, accessKeyOrDeviceKey, forceDeviceKeyAuth) {
        this.serviceUrl = serviceUrl;
        this.deviceId = deviceId;

        // save auth information
        this.auth = {};
        if (forceDeviceKeyAuth || !utils.isAccessKey(accessKeyOrDeviceKey)) {
            this.auth.deviceId = deviceId;
            this.auth.deviceKey = accessKeyOrDeviceKey;
        } else {
            this.auth.accessKey = accessKeyOrDeviceKey;
        }
    };

    DHDevice.prototype = DeviceHive;
    DHDevice.constructor = DHDevice;

    /**
     * @callback getDeviceCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} device - Current device information
     */

    /**
     * Gets information about the current device
     *
     * @param {getDeviceCb} cb - The callback that handles the response
     * @returns {Http} - Current http request
     */
    DHDevice.prototype.getDevice = function (cb) {
        cb = utils.createCallback(cb);

        return this._executeApi(restApi.getDevice, [cb]);
    };

    /**
     * Registers a device in the DeviceHive network with the current device id
     * device key will be implicitly added if specified as an authentication parameter
     *
     * @param {Object} device - Device parameters
     * @param {noDataCallback} cb - The callback that handles the response
     * @returns {Http} - Current http request
     */
    DHDevice.prototype.registerDevice = function (device, cb) {
        cb = utils.createCallback(cb);

        if (device.key && this.auth.deviceKey && device.key !== this.auth.deviceKey)
            throw new Error('Conflicting device keys on device registration');

        device.key = device.key || this.auth.deviceKey;

        if (!device.key) {
            throw new Error('Device key was not provided during the DHDevice object creation and therefore must be specified in the parameters')
        }

        return this._executeApi(restApi.registerDevice, [device, cb]);
    };

    /**
     * Updates a device in the DeviceHive network with the current device id
     *
     * @param {Object} device - Device parameters
     * @param {noDataCallback} cb - The callback that handles the response
     * @returns {Http} - Current http request
     */
    DHDevice.prototype.updateDevice = function (device, cb) {
        cb = utils.createCallback(cb);

        return this._executeApi(restApi.registerDevice, [device, cb]);
    };

    /**
     * Sends new notification to the client
     *
     * @param {String} notification - Notification name
     * @param {Object} params - Notification parameters
     * @param {noDataCallback} cb - The callback that handles the response
     * @returns {Http} - Current http request
     */
    DHDevice.prototype.sendNotification = function (notification, params, cb) {
        cb = utils.createCallback(cb);

        this._ensureConnectedState();
        return this.channel.sendNotification({
            notification: {notification: notification, parameters: params},
            deviceGuid: this.deviceId
        }, cb);
    };


    /**
     * @callback notificationSubscribeCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {NotificationSubscription} subscription - added subscription object
     */

    /**
     * @typedef {Object} NotificationSubscribeParameters
     * @property {function} onMessage - initial callback that will be invoked when a command is received
     * @property {(Array | String)} names - notification name, array of notifications or null (subscribe to all notifications)
     */

    /**
     * @typedef {Subscription} NotificationSubscription
     * @property {notificationReceivedCb} cb - a callback that will be invoked when a command is received
     */

    /**
     * @callback notificationReceivedCb
     * @param {ReceivedCommand} command - Received command information
     */

    /**
     * @typedef {Object} ReceivedCommand
     * @property {updateCommandFunction} update - function for updating the current command with the result
     */

    /**
     * @typedef {function} updateCommandFunction
     * @param {Object} result - command result
     * @param {function} cb - The callback that handles the response
     * @throws {Error} - throws an error if status is not specified
     */

    /**
     * @callback getDeviceCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} device - Current device information
     */

    var oldSubscribe = DeviceHive.subscribe;
    /**
     * Subscribes to device commands and returns a subscription object
     * Use subscription object to bind to a 'new command received' event
     * use command.update to specify command result parameters
     *
     * @param {notificationSubscribeCb} cb - The callback that handles the response
     * @param {NotificationSubscribeParameters} params - Subscription parameters
     * @returns {NotificationSubscription} - Added subscription object
     */
    DHDevice.prototype.subscribe = function (cb, params) {
        params = params || {};
        params.deviceIds = [this.deviceId];

        var sub = oldSubscribe.call(this, cb, params);

        sub._handleMessageOld = sub._handleMessage;
        var self = this;

        // overwrite _handleMessage to add additional functionality to command object
        sub._handleMessage = function (deviceId, cmd) {
            self._populateCmd(cmd);
            sub._handleMessageOld(cmd)
        };

        return sub;
    };

    DHDevice.prototype._populateCmd = function (cmd) {
        var channel = this.channel;
        var selfDeviceId = this.deviceId;
        cmd.update = function (params, onUpdated) {
            onUpdated = utils.createCallback(onUpdated);

            if (!params || !params.status) {
                throw new Error('Command status must be specified');
            }

            var updateParams = {};
            updateParams.commandId = cmd.id;
            updateParams.command = params || {};
            updateParams.deviceGuid = selfDeviceId;

            return channel.updateCommand(updateParams, onUpdated);
        };
    };

    DHDevice.prototype._executeApi = function (endpoint, args) {
        var endpointParams = [this.serviceUrl, this.auth, this.deviceId].concat(args);
        return endpoint.apply(null, endpointParams);
    };

    DHDevice.prototype._channels = {};
    DHDevice.prototype._channels.websocket = WebSocketDeviceChannel;
    DHDevice.prototype._channels.longpolling = LongPollingDeviceChannel;

    /**
     * DHDevice channel states
     * @borrows DeviceHive#channelStates
     */
    DHDevice.channelStates = DeviceHive.channelStates;

    /**
     * DHDevice subscription states
     * @borrows Subscription#states
     */
    DHDevice.subscriptionStates = Subscription.states;

    return DHDevice;
}());
return DHDevice;
}));
