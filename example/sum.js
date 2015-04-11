var rpc = require('..')({
    autoDelete: true
});

rpc.call('sum', 1, 2, 3, function (err, res) {
    console.log('The sum is', res);
});

rpc.handle('sum', function (a, b, c, callback) {
    callback(null, a + b + c);
});