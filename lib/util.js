function type(value) {
    if (Buffer.isBuffer(value)) {
        return 'buffer';
    }
    return typeof value;
}

function stringify(value) {
    if (Buffer.isBuffer(value)) {
        return value.toString('base64');
    }
    return JSON.stringify(value);
}

function parse(type, value) {
    if (type === 'buffer') {
        return new Buffer(value, 'base64');
    }
    if (type === 'undefined') {
        return undefined;
    }
    return JSON.parse(value);
}

module.exports = {
    fromBuffer: function (buf) {
        var wrap = JSON.parse(buf.toString());
        return parse(wrap.type, wrap.value);
    },

    toBuffer: function (value) {
        var wrap = {
            type: type(value),
            value: stringify(value)
        };
        return new Buffer(JSON.stringify(wrap));
    }
};