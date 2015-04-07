var rpc = require('..')();

var count = 0;

setInterval(function () {
    ++count;
    rpc.call('test', count, function (res) {
        console.log(res);
    });
}, 1000);
