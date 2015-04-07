var rpc = require('..')();

rpc.handle('test', function (payload, callback) {
    console.log('handle', payload);
    callback('bar!');
});