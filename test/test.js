var fs = require('fs'),
    rpc = require('..')({autoDelete: true}),
    test = require('tape');

var options = {
    timeout: 1000
}

test('string', options, function (t) {
    rpc.call('string-test', 'a string', function (err, res) {
        t.equal(err, null);
        t.equal(typeof res, 'string');
        t.end();
    });

    rpc.handle('string-test', function (str, callback) {
        t.equal(typeof str, 'string');
        callback(null, 'another string');
    });
});

test('object', options, function (t) {
    rpc.call('object-test', {foo: 'bar', test: true}, function (err, res) {
        t.equal(err, null);
        t.equal(typeof res, 'object');
        t.equal(res.result, 1);
        t.end();
    });

    rpc.handle('object-test', function (obj, callback) {
        t.equal(typeof obj, 'object');
        t.equal(obj.foo, 'bar');
        t.equal(obj.test, true);
        callback(null, {result: 1});
    });
});

test('number', options, function (t) {
    rpc.call('number-test', 12345, function (err, res) {
        t.equal(err, null);
        t.equal(typeof res, 'number');
        t.equal(parseFloat(res), res);
        t.end();
    });

    rpc.handle('number-test', function (num, callback) {
        t.equal(typeof num, 'number');
        t.equal(parseInt(num), num);
        callback(null, 0.1234);
    });
});

test('array', options, function (t) {
    rpc.call('array-test', [1,2,3], function (err, res) {
        t.equal(err, null);
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
        callback(null, []);
    });
});

test('undefined', options, function (t) {
    rpc.call('undefined-test', undefined, function (err, res) {
        t.equal(err, undefined);
        t.equal(res, undefined);
        t.end();
    });

    rpc.handle('undefined-test', function (value, callback) {
        t.equal(value, undefined);
        callback();
    });
});

test('null', options, function (t) {
    rpc.call('null-test', null, function (err, res) {
        t.equal(err, null);
        t.equal(res, null);
        t.end();
    });

    rpc.handle('null-test', function (value, callback) {
        t.equal(value, null);
        callback(null, null);
    });
});

test('buffer', options, function (t) {
    rpc.call('buffer-test', new Buffer('123'), function (err, res) {
        t.equal(err, null);
        t.ok(Buffer.isBuffer(res));
        t.end();
    });

    rpc.handle('buffer-test', function (value, callback) {
        t.ok(Buffer.isBuffer(value));
        callback(null, new Buffer(123));
    });
});

test('binary', options, function (t) {
    fs.readFile(__dirname + '/monkey_face.jpg', function (err, data) {
        rpc.call('binary-test', data, function (err, res) {
            t.equal(err, null);
            t.equal(res.length, data.length);
            t.end();
        });
    });

    rpc.handle('binary-test', function (value, callback) {
        t.ok(Buffer.isBuffer(value));
        callback(null, value);
    });
});

test('promise', options, function (t) {
    rpc.promise('promise-test', 123).then(function (res) {
        t.equal(res, 456);
        t.end();
    });
    rpc.handle('promise-test', function (value, callback) {
        t.equals(value, 123);
        callback(null, 456);
    });
});

test('promise-no-args', options, function (t) {
    rpc.promise('promise-no-args-test').then(function (res) {
        t.equal(res, undefined);
        t.end();
    });
    rpc.handle('promise-no-args-test', function (callback) {
        callback();
    });
});

test('promise-rejected', options, function (t) {
    rpc.promise('promise-rejected').then(function (res) {
        t.fail('should not get here');
    }, function (err) {
        t.equal(err, 'epic fail');
        t.end();
    });
    rpc.handle('promise-rejected', function (callback) {
        callback('epic fail');
    });
});

test('multi-args', options, function (t) {
    rpc.call('multi-args-test', 1, 2, 3, function (err, foo, bar) {
        t.equal(err, null);
        t.equal(foo, "foo");
        t.equal(bar, "bar");
        t.end();
    });
    rpc.handle('multi-args-test', function (a, b, c, callback) {
        t.equals(a, 1);
        t.equals(b, 2);
        t.equals(c, 3);
        callback(null, "foo", "bar");
    });
});

test('exit', function (t) {
    t.end();
    process.exit(0);
})
