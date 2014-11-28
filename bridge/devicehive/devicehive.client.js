(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.DHClient = factory();
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
var LongPollingClientChannel = (function () {
    'use strict';

    var waitCommandResult = function (hive, deviceId, cmdId, waitTimeout, cb) {
        return hive._executeApi(restApi.waitCommandResult, [deviceId, cmdId, {
            waitTimeout: waitTimeout
        }, cb]);
    };

    var LongPollingClientChannel = function (hive) {
        this.subscriptions = [];

        this._hive = hive;

        var self = this;
        this._pollParams = {
            executePoll: function (params, continuePollCb) {
                return self._hive._executeApi(restApi.pollManyNotifications, [params, continuePollCb]);
            },
            resolveTimestamp: function (data) {
                return data.notification.timestamp;
            },
            resolveDataArgs: function (data) {
                return [data.deviceGuid, data.notification];
            },
            resolveName: function (data) {
                return data.notification.notification;
            },
            resolveDeviceId: function (data) {
                return data.deviceGuid;
            }
        };
    };

    LongPollingClientChannel.prototype = LongPollingChannel;
    LongPollingClientChannel.constructor = LongPollingClientChannel;

    LongPollingClientChannel.prototype.sendCommand = function (deviceId, cmd, commandInsertedCb) {
        var self = this,
            data = cmd,
            success = utils.noop(),
            waitTimeout,
            isRequestDone = false,
            request = {};

        commandInsertedCb = utils.createCallback(commandInsertedCb);

        function commandResult(id, cb) {
            waitCommandResult(self._hive, deviceId, id, waitTimeout, function (err, res) {
                err = err || (!res && utils.errorMessage('Cannot get command result. Wait request timed out.'));
                if (err) {
                    return cb(err);
                }

                return cb(null, res);
            });
        }

        function onCommandInserted(err, res) {
            err = err
                || (!res && utils.errorMessage('Error inserting a new command'))
                || (!res.id && utils.errorMessage('Cannot get inserted command id'));

            if (err) {
                return commandInsertedCb(err);
            }

            isRequestDone = true;
            request.command = res;

            commandInsertedCb(null, res);
            success && commandResult(request.command.id, success);
        }

        this._hive._executeApi(restApi.insertCommand, [deviceId, data, onCommandInserted]);

        request.result = function (callback, wait) {
            if (wait > 60) {
                throw new Error('Maximum wait timeout for longpolling channel = 60 seconds. Specified timeout - ' + wait);
            }

            waitTimeout = wait;

            if (isRequestDone) {
                commandResult(request.command.id, callback);
            } else {
                success = callback;
            }
        };

        return request;
    };

    return LongPollingClientChannel;
}());
var WebSocketClientChannel = (function () {
    'use strict';

    var WebSocketClientChannel = function (hive) {
        this.subscriptions = [];

        this._hive = hive;
        this._events = new Events();
    };

    WebSocketClientChannel.prototype = {
        open: function (cb) {
            cb = utils.createCallback(cb);

            var webSocketUrl = this._hive.serverInfo.webSocketServerUrl;

            if (!webSocketUrl) {
                cb(utils.errorMessage('Open channel failed. Cannot get web socket server url'));
                return;
            }

            var self = this;
            this._wsApi = new WebSocketClientApi();

            self._wsApi._events.bind('onCommandUpdate', function (msg) {
                var command = msg.command;
                var commandRequest = self._commandRequests[command.id];
                if (commandRequest) {
                    commandRequest._result = command;
                    utils.clearTimeout(commandRequest._timeout);
                    commandRequest._onResult(null, command);
                    delete self._commandRequests[command.id];
                }
            });

            self._wsApi._events.bind('onNotificationInsert', function (notif) {
                var subscription = utils.find(self.subscriptions, function () {
                    return this.id === notif.subscriptionId;
                });

                return subscription && subscription._handleMessage(notif.deviceGuid, notif.notification);
            });

            this._wsApi.open(webSocketUrl, function (err) {
                if (err)
                    return cb(err);

                self._wsApi.authenticate(self._hive.auth.login, self._hive.auth.password, self._hive.auth.accessKey, cb);
            });
        },

        close: function (cb) {
            cb = utils.createCallback(cb);
            this._wsApi.close(cb);
        },

        subscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);

            if (!subscription) {
                return cb(null);
            }

            this._wsApi.notificationSubscribe({
                deviceGuids: subscription.deviceIds,
                names: subscription.names
            }, function (err, res) {
                return cb(err, res && res.subscriptionId);
            });
        },

        unsubscribe: function (subscription, cb) {
            cb = utils.createCallback(cb);
            this._wsApi.notificationUnSubscribe({ subscriptionId: subscription.id }, cb);
        },

        sendCommand: function (deviceId, cmd, commandInsertedCb) {
            var self = this,
                data = { deviceGuid: deviceId, command: cmd },
                request = {};

            commandInsertedCb = utils.createCallback(commandInsertedCb);

            function onCommandInserted(err, res) {
                if (err) {
                    return commandInsertedCb(err, res);
                }

                if (!res || !res.command || !res.command.id) {
                    return commandInsertedCb(utils.errorMessage('Error inserting a new command'), res)
                }

                self._commandRequests = self._commandRequests || {};
                self._commandRequests[res.command.id] = request;
                commandInsertedCb(null, res);

                request.command = res.command;
            }

            this._wsApi.sendCommand(data, onCommandInserted);

            request._onResult = utils.noop;
            request.result = function (callback, wait) {
                if (request._result)
                    return callback(null, request._result);

                request._onResult = callback;
                request._timeout = utils.setTimeout(function () {
                    var cb = request._onResult;
                    request._onResult = utils.noop;
                    cb(utils.errorMessage('Cannot get command result. Wait request timed out.'));
                }, (wait || 30) * 1000);
            };

            return request;
        }
    };

    return WebSocketClientChannel;
}());
var DHClient = (function () {
    'use strict';

    /**
     * DHClient object constructor
     * specify login & password or access key as an authentication/authorization parameters
     *
     * @class
     * @global
     * @augments DeviceHive
     * @param {String} serviceUrl - DeviceHive cloud API url
     * @param {String} loginOrKey - User's login name or access key
     * @param {String} password - User's password. If access key authentication is used this argument should be omitted
     */
    var DHClient = function (serviceUrl, loginOrKey, password) {
        this.serviceUrl = serviceUrl;

        // save auth information
        this.auth = {};
        if (!password) {
            this.auth.accessKey = loginOrKey;
        } else {
            this.auth.login = loginOrKey;
            this.auth.password = password;
        }
    };

    DHClient.prototype = DeviceHive;
    DHClient.constructor = DHClient;


    /**
     * Get Networks request filtering parameters
     *
     * @typedef {Object} NetworksFilter
     * @property {String} name - filter by network name
     * @property {String} namePattern - filter by network name pattern
     * @property {String} sortField - result list sort field: ID or Name
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     */

    /**
     * @callback getNetworksCb
     * @param {DHError} err - an error object if any errors occurred
     * @param {Array} networks - an array of requested networks
     */

    /**
     * Gets a list of networks
     *
     * @param {NetworksFilter} filter - Networks filter
     * @param {getNetworksCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getNetworks = function (filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNetworks, [filter, cb]);
    };


    /**
     * @callback getNetworkCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} network - Requested network information
     */

    /**
     * Gets information about the network and associated devices
     *
     * @param {String} networkId - Network identifier
     * @param {getNetworkCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getNetwork = function (networkId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNetwork, [networkId, cb]);
    };


    /**
     * Get Devices request filtering parameters
     *
     * @typedef {Object} DevicesFilter
     * @property {String} name - filter by device name
     * @property {String} namePattern - filter by device name pattern
     * @property {String} status - filter by device status
     * @property {String} networkId - filter by associated network identifier
     * @property {String} networkName - filter by associated network name
     * @property {String} deviceClassId - filter by associated device class identifier
     * @property {String} deviceClassName - filter by associated device class name
     * @property {String} deviceClassVersion - filter by associated device class version
     * @property {String} sortField - result list sort field: Name, Status, Network or DeviceClass
     * @property {String} sortOrder - result list sort order: ASC or DESC
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     */

    /**
     * @callback getDevicesCb
     * @param {DHError} err - an error object if any errors occurred
     * @param {Array} devices - an array of requested devices
     */

    /**
     * Gets a list of devices
     *
     * @param {DevicesFilter} filter - Devices filter
     * @param {getDevicesCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getDevices = function (filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getDevices, [filter, cb]);
    };


    /**
     * @callback getDeviceCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} device - Requested device information
     */

    /**
     * Gets information about the device
     *
     * @param {String} deviceId - Device identifier
     * @param {getDeviceCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getDevice = function (deviceId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getDevice, [deviceId, cb]);
    };

    /**
     * @callback getDeviceClassCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} deviceClass - Requested device class information
     */

    /**
     * Gets information about a device class and associated equipment
     *
     * @param {String} deviceClassId - Device Class identifier
     * @param {getDeviceClassCb} cb - The callback that handles the response
     * @throws Will throw an error if user's credentials are not used as an authentication mechanism
     * @returns {Http} - current http request
     */
    DHClient.prototype.getDeviceClass = function (deviceClassId, cb) {
        cb = utils.createCallback(cb);
        if (!this.auth.login) {
            throw new Error('DeviceHive: DHClient should be created with username and password credentials to get device class information')
        }
        return this._executeApi(restApi.getDeviceClass, [deviceClassId, cb]);
    };


    /**
     * @callback getEquipmentStateCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Array} equipmentState - Requested array of equipment states for the specified device
     */

    /**
     * Gets a list of device equipment states (current state of device equipment)
     *
     * @param {String} deviceId - Device identifier
     * @param {getEquipmentStateCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getEquipmentState = function (deviceId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getEquipmentState, [deviceId, cb]);
    };


    /**
     * Get Notifications request filtering parameters
     *
     * @typedef {Object} NotificationsFilter
     * @property {Date} start - filter by notification start timestamp (inclusive, UTC)
     * @property {Date} end - filter by notification end timestamp (inclusive, UTC)
     * @property {String} notification - filter by notification name
     * @property {String} sortField - result list sort field - Timestamp (default) or Notification
     * @property {String} sortOrder - result list sort order - ASC or DESC
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     * @property {String} gridInterval - grid interval in seconds. Filter to retrieve maximum one notification of the same type within the specified grid interval
     */

    /**
     * @callback getNotificationsCb
     * @param {DHError} err - an error object if any errors occurred
     * @param {Array} notifications - an array of requested notifications
     */

    /**
     * Gets a list of notifications generated by the device
     *
     * @param {String} deviceId - Device identifier
     * @param {NotificationsFilter} filter - Notification filter
     * @param {getNotificationsCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getNotifications = function (deviceId, filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNotifications, [deviceId, filter, cb]);
    };

    /**
     * @callback getNotificationCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} notification - Requested notification information
     */

    /**
     * Gets information about a device class and associated equipment
     *
     * @param {String} deviceId - Device identifier
     * @param {Number} notificationId - Notification identifier
     * @param {getNotificationCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getNotification = function (deviceId, notificationId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getNotification, [deviceId, notificationId, cb]);
    };


    /**
     * Gets a list of commands previously sent to the device
     *
     * @typedef {Object} CommandsFilter
     * @property {Date}   start - filter by command start timestamp (inclusive, UTC)
     * @property {Date}   end - filter by command end timestamp (inclusive, UTC)
     * @property {String} command - filter by command name
     * @property {String} status - filter by command status
     * @property {String} sortField - result list sort field - Timestamp (default), Command or Status
     * @property {String} sortOrder - result list sort order - ASC or DESC
     * @property {Number} take - number of records to take from the result list
     * @property {Number} skip - number of records to skip from the result list
     */

    /**
     * @callback getCommandsCb
     * @param {DHError} err - an error object if any errors occurred
     * @param {Array} commands - an array of requested commands
     */

    /**
     * Gets a list of notifications generated by the device
     *
     * @param {String} deviceId - Device identifier
     * @param {CommandsFilter} filter - Notification filter
     * @param {getCommandsCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getCommands = function (deviceId, filter, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getCommands, [deviceId, filter, cb]);
    };

    /**
     * @callback getCommandCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} command - requested command information
     */

    /**
     * Gets information about a device command
     *
     * @param {String} deviceId - Device identifier
     * @param {Number} commandId - Notification identifier
     * @param {getCommandCb} cb - The callback that handles the response
     * @returns {Http} - current http request
     */
    DHClient.prototype.getCommand = function (deviceId, commandId, cb) {
        cb = utils.createCallback(cb);
        return this._executeApi(restApi.getCommand, [deviceId, commandId, cb]);
    };


    /**
     * @callback getCurrentUserCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} user - information about the current user
     */

    /**
     * Gets information about the logged-in user and associated networks
     *
     * @param {getCurrentUserCb} cb - The callback that handles the response
     * @throws Will throw an Error if an access key is used as an authentication mechanism
     * @returns {Http} - current http request
     */
    DHClient.prototype.getCurrentUser = function (cb) {
        cb = utils.createCallback(cb);
        if (!this.auth.login) {
            throw new Error('DeviceHive: DHClient should be created with username and password credentials to get current user information')
        }
        return this._executeApi(restApi.getCurrentUser, [cb]);
    };

    /**
     * Updates information for the current user
     *
     * @param {Object} user - User info
     * @param {noDataCallback} cb - The callback that handles the response
     * @throws Will throw an Error if an access key is used as an authentication mechanism
     * @returns {Http} - current http request
     */
    DHClient.prototype.updateCurrentUser = function (user, cb) {
        cb = utils.createCallback(cb);
        if (!this.auth.login) {
            throw new Error('DeviceHive: DHClient should be created with username and password credentials to update current user')
        }
        return this._executeApi(restApi.updateCurrentUser, [user, cb]);
    };

    /**
     * @typedef {Object} SendCommandResult
     * @property {commandResult} result - Waits for the command to be completed
     */

    /**
     * Wait for result function
     * @typedef {function} commandResult
     * @param {commandResultCallback} cb
     * @param {Number} waitTimeout - Time to wait for the result in seconds. Default = 30 seconds. Maximum for longpolling channel = 60 seconds
     */

    /**
     * A callback function which is executed when the device has processed a command and has sent the result to the DeviceHive cloud
     * @callback commandResultCallback
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} res - Processing result of the command
     */

    /**
     * @callback sendCommandCb
     * @param {DHError} err - An error object if any errors occurred
     * @param {Object} cmd - Already sent command
     */

    /**
     * Sends a new command to the device
     *
     * @param {String} deviceId - Device identifier
     * @param {String} command - Command name
     * @param {Object} parameters - Command parameters
     * @param {sendCommandCb} cb - The callback that handles the response
     * @returns {SendCommandResult}
     */
    DHClient.prototype.sendCommand = function (deviceId, command, parameters, cb) {
        cb = utils.createCallback(cb);
        this._ensureConnectedState();
        return this.channel.sendCommand(deviceId, { command: command, parameters: parameters }, cb);
    };

    DHClient.prototype._executeApi = function (endpoint, args) {
        var endpointParams = [this.serviceUrl, this.auth].concat(args);
        return endpoint.apply(null, endpointParams)
    };

    DHClient.prototype._channels = {};
    DHClient.prototype._channels.websocket = WebSocketClientChannel;
    DHClient.prototype._channels.longpolling = LongPollingClientChannel;

    /**
     * DHClient channel states
     * @borrows DeviceHive#channelStates
     */
    DHClient.channelStates = DeviceHive.channelStates;

    /**
     * DHClient subscription states
     * @borrows Subscription#states
     */
    DHClient.subscriptionStates = Subscription.states;

    return DHClient;
}());
return DHClient;
}));
