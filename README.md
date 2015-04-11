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

rpc.call('square', 99, function (err, res) {
    console.log('The square of 99 is', res);
});

```

### handler.js
```sh
var rpc = require('rabbit-rpc')('amqp://localhost');

rpc.handle('square', function (num, callback) {
    callback(null, num*num);
});
```

## Promises
```sh
rpc.promise('square', 99).then(function (res) {
    console.log('The square of 99 is', res);
});
```

## Multiple arguments

```sh
rpc.call('sum', 1, 2, 3, function (err, res) {
    console.log('The sum is', res);
});

rpc.handle('sum', function (a, b, c, callback) {
    callback(null, a + b + c);
});
```

## Multiple types
Send strings, numbers, arrays, objects or buffers. Arguments are serialized to [BSON](http://bsonspec.org/) using [node-buffalo](https://github.com/marcello3d/node-buffalo).

```sh
rpc.call('getFile', __dirname, 'getfile.js', function (err, stats, data) {
    if (err) {
        return console.error('Got error', err);
    } else {
        console.log('Got file', stats.size, data.length);
    }
});

rpc.handle('getFile', function (dir, filename, callback) {
    var path = dir + '/' + filename;
    fs.stat(path, function (err, stats) {
        if (err) return callback(err);
        fs.readFile(path, function (err, data) {
            if (err) return callback(err);
            callback(null, stats, data)
        });
    });
});
```
