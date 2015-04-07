var async = require('async'),
    rabbit = require('rabbit.js'),
    Promise = require("node-promise").Promise;

function getContext(name, options) {
    var context = rabbit.createContext(),
        push = context.socket('PUSH'),
        pull = context.socket('PULL'),
        pub = context.socket('PUB'),
        sub = context.socket('SUB');

    var callbacks = {};

    sub.on('readable', function () {
        var data;
        while (data = sub.read()) {
            doCallback(data);
        }
    });

    function doCallback(data) {
        var json = JSON.parse(data.toString());
        var callback = callbacks[json.id];
        if (callback) {
            callback(json.payload);
            delete callbacks[json.id];
        }
    }

    function call(payload, callback) {
        var id = Math.random().toString(32).slice(2);
        callbacks[id] = callback;
        push.write(JSON.stringify({
            id: id,
            payload: payload
        }), 'utf8');
    }

    function handleOne(data, handler) {
        var json = JSON.parse(data.toString());
        handler(json.payload, function (res) {
            pub.write(JSON.stringify({
                id: json.id,
                payload: res
            }), 'utf8');
        });
    }

    function handleAll(handler) {
        var data;
        while (data = pull.read()) {
            handleOne(data, handler);
        }
    }

    function handle(handler) {
        pull.connect(name, function () {
            pull.on('readable', handleAll.bind(null, handler));
        });
    }

    var promise = new Promise();

    async.each([push, pub, sub], function (socket, done) {
        socket.connect(name, done)
    }, function () {
        promise.resolve({
            call: call,
            handle: handle
        });
    });

    return promise;
}


module.exports = function (options) {

    options = options || {};

    var cache = [];

    function get(name) {
        if (!cache[name]) {
            cache[name] = getContext(name, options);
        }
        return cache[name];
    }

    return {

        call: function (name, payload, callback) {
            get(name).then(function (ctx) {
                ctx.call(payload, callback);
            });
        },

        handle: function (name, handler) {
            get(name).then(function (ctx) {
                ctx.handle(handler);
            });
        }
    };
}