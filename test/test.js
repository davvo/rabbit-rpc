var fs = require('fs'),
    rpc = require('..')(),
    test = require('tape');

var options = {
    timeout: 1000
}

test('string', options, function (t) {
    rpc.call('string-test', 'a string', function (res) {
        t.equal(typeof res, 'string');
        t.end();
    });

    rpc.handle('string-test', function (str, callback) {
        t.equal(typeof str, 'string');
        callback('another string');
    });
})

test('object', options, function (t) {
    rpc.call('object-test', {foo: 'bar', test: true}, function (res) {
        t.equal(typeof res, 'object');
        t.equal(res.result, 1);
        t.end();
    });

    rpc.handle('object-test', function (obj, callback) {
        t.equal(typeof obj, 'object');
        t.equal(obj.foo, 'bar');
        t.equal(obj.test, true);
        callback({result: 1});
    });
});

test('number', options, function (t) {
    rpc.call('number-test', 12345, function (res) {
        t.equal(typeof res, 'number');
        t.equal(parseFloat(res), res);
        t.end();
    });

    rpc.handle('number-test', function (num, callback) {
        t.equal(typeof num, 'number');
        t.equal(parseInt(num), num);
        callback(0.1234);
    });
});

test('array', options, function (t) {
    rpc.call('array-test', [1,2,3], function (res) {
        t.equal(typeof res, 'object');
        t.equal(res.length, 0);
        t.end();
    });

    rpc.handle('array-test', function (arr, callback) {
        t.equal(typeof arr, 'object');
        t.equal(arr.length, 3);
        t.equal(arr[0], 1);
        t.equal(arr[1], 2);
        t.equal(arr[2], 3);
        callback([]);
    });
});

test('undefined', options, function (t) {
    rpc.call('undefined-test', undefined, function (res) {
        t.equal(res, undefined);
        t.end();
    });

    rpc.handle('undefined-test', function (value, callback) {
        t.equal(value, undefined);
        callback(undefined);
    });
});

test('null', options, function (t) {
    rpc.call('null-test', null, function (res) {
        t.equal(res, null);
        t.end();
    });

    rpc.handle('null-test', function (value, callback) {
        t.equal(value, null);
        callback(null);
    });
});

test('buffer', options, function (t) {
    rpc.call('buffer-test', new Buffer('123'), function (res) {
        t.ok(Buffer.isBuffer(res));
        t.end();
    });

    rpc.handle('buffer-test', function (value, callback) {
        t.ok(Buffer.isBuffer(value));
        callback(new Buffer(123));
    });
});

test('binary', options, function (t) {
    fs.readFile(__dirname + '/monkey_face.jpg', function (err, data) {
        rpc.call('binary-test', data, function (res) {
            t.equal(res.length, data.length);
            t.end();
        });
    });

    rpc.handle('binary-test', function (value, callback) {
        t.ok(Buffer.isBuffer(value));
        callback(value);
    });
});

test('exit', function (t) {
    t.end();
    process.exit(0);
})
