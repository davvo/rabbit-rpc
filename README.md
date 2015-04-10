# rabbit-rpc
simple rpc using [RabbitMQ](https://www.rabbitmq.com/) and [amqp.node](https://github.com/squaremo/amqp.node)

## example
caller.js
```sh
var rpc = require('rabbit-rpc')();

rpc.call('square', 99, function (res) {
    console.log('The square of %d is', res);
});

```

handler.js
```sh
var rpc = require('rabbit-rpc')();

rpc.handle('square', function (num, callback) {
    callback(num*num);
});
```
