# rabbit-rpc
simple rpc using [RabbitMQ](https://www.rabbitmq.com/) and [amqp.node](https://github.com/squaremo/amqp.node)

## Install
```sh
> npm install rabbit-rpc
```

## example
### caller.js
```sh
var rpc = require('rabbit-rpc')('amqp://localhost');

rpc.call('square', 99, function (res) {
    console.log('The square of 99 is', res);
});

```
or
```sh
var rpc = require('rabbit-rpc')('amqp://localhost');

rpc.promise('square', 99).then(function (res) {
    console.log('The square of 99 is', res);
});

```

### handler.js
```sh
var rpc = require('rabbit-rpc')('amqp://localhost');

rpc.handle('square', function (num, callback) {
    callback(num*num);
});
```
