var fs = require('fs');
var rpc = require('..')({
    autoDelete: true
});

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
