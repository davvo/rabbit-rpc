var amqp = require('amqplib'),
    uuid = require('node-uuid')
    bson = require('buffalo');

var promise = require('node-promise');

function fromBuffer(buf) {
    return bson.parse(buf).val;
}

function toBuffer(value) {
    return bson.serialize({val: value});
}

module.exports = function (options) {

    options = options || {};

    if (typeof options === 'string') {
        options = {
            url: options
        }
    }

    var callbacks = [];

    var getChannel = amqp.connect(options.url).then(function (con) {
        process.once('SIGINT', con.close.bind(con));
        return con.createChannel();
    });

    var getReplyQueue = getChannel.then(function (ch) {
        return ch.assertQueue('', {exclusive: true, autoDelete: true}).then(function (res) {
            callbackConsumer(ch, res.queue);
            return res.queue;
        });
    });

    function callbackConsumer(channel, replyQueue) {
        channel.consume(replyQueue, function (msg) {
            var corrId = msg.properties.correlationId;
            if (callbacks[corrId]) {
                callbacks[corrId].apply(null, fromBuffer(msg.content));
                delete callbacks[corrId];
            } else {
                console.warn('Missing callback for', corrId);
            }
        }, {noAck: true});
    }

    var rpc = {
        handle: function (service, handler) {
            getChannel.then(function (ch) {
                ch.assertQueue(service, {
                    durable: options.durable,
                    autoDelete: options.autoDelete
                }).then(function () {
                    ch.consume(service, function (msg) {
                        var args = fromBuffer(msg.content).concat(function () {
                            ch.sendToQueue(msg.properties.replyTo, toBuffer([].slice.call(arguments, 0)), {
                                correlationId: msg.properties.correlationId
                            });
                            ch.ack(msg);
                        });
                        handler.apply(null, args);
                    });
                });
            });
        },

        call: function () {
            var service = arguments[0],
                callback = arguments[arguments.length - 1],
                args = [].slice.call(arguments, 1, arguments.length - 1);
            getChannel.then(function (ch) {
                getReplyQueue.then(function (replyQueue) {
                    var corrId = uuid();
                    callbacks[corrId] = callback;
                    setTimeout(function () {
                        if (callbacks[corrId]) {
                            callback.apply(null, [Error('timeout')]);
                            delete callbacks[corrId];
                        }
                    }, options.timeout);
                    ch.sendToQueue(service, toBuffer(args), {
                        correlationId: corrId,
                        replyTo: replyQueue
                    });
                });
            });
        },

        promise: function () {
            var args = [].slice.call(arguments);
            var deferred = promise.defer();
            rpc.call.apply(null, args.concat(function (err) {
                if (err) {
                    deferred.reject(err);
                } else {
                    var args = [].slice.call(arguments, 1);
                    deferred.resolve.apply(deferred, args);
                }
            }));
            return deferred.promise;
        }
    };

    return rpc;

};
