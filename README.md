# rabbit-rpc
simple rpc using [rabbit.js](https://github.com/squaremo/rabbit.js)

## example
caller.js
```sh
var rpc = require('rabbit-rpc')();

var count = 0;

setInterval(function () {
    rpc.call('foo', ++count, function (res) {
        console.log(res);
    });
}, 1000);

```

handler.js
```sh
var rpc = require('rabbit-rpc')();

rpc.handle('foo', function (payload, callback) {
    console.log('handle', payload);
    callback('bar!');
});
```
