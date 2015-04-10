var amqp = require('amqplib'),
    uuid = require('node-uuid')
    util = require('./util');

module.exports = function (url) {

    var callbacks = [];

    var getChannel = amqp.connect(url).then(function (con) {
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
                process.nextTick(callbacks[corrId].bind(null, util.fromBuffer(msg.content)));
                delete callbacks[corrId];
            } else {
                console.warn('Missing callback for', corrId);
            }
        }, {noAck: true});
    }

    return {
        handle: function (service, handler) {
            getChannel.then(function (ch) {
                ch.assertQueue(service, {durable: false, autoDelete: true}).then(function () {
                    ch.consume(service, function (msg) {
                        handler(util.fromBuffer(msg.content), function (res) {
                            ch.sendToQueue(msg.properties.replyTo, util.toBuffer(res), {
                                correlationId: msg.properties.correlationId
                            });
                            ch.ack(msg);
                        });
                    });
                });
            });
        },

        call: function (service, payload, callback) {
            getChannel.then(function (ch) {
                getReplyQueue.then(function (replyQueue) {
                    var corrId = uuid();
                    callbacks[corrId] = callback;
                    ch.sendToQueue(service, util.toBuffer(payload), {
                        correlationId: corrId,
                        replyTo: replyQueue
                    });
                });
            });
        }
    };

};