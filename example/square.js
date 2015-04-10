var rpc = require('..')();

rpc.handle('square', function (num, callback) {
    setTimeout(function () {
        callback(Math.pow(num, 2));
    }, Math.random() * 1000);
});

function printSquare(num) {
    rpc.call('square', num, function (res) {
        console.log('The square of %d is', num, res);
    });
}

[1, 2, 3, 4, 5].forEach(printSquare);
