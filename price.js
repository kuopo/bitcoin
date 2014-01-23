var httpclient = require('https');
var MsgHub = require('pubsub-client.js')

var current = new Date().getTime();
msghub = new MsgHub('https://pubsub.msghub.io');
//msghub = new MsgHub('http://198.199.97.15:12345');
msghub.erase('bitcoin', {"timeframe": {"max": current - 10800 * 1000}});


setInterval( function() {
    var options = {
        host: 'data.mtgox.com',
        path: '/api/2/BTCUSD/money/ticker_fast',
//        rejectUnauthorized: false,
        port: 443
    };

    var req = httpclient.get(options, function(res) {
        res.once('data', function(chunk) {
            console.log(chunk.toString());
            var result;

            try {
                result = JSON.parse(chunk);
            } catch (e) {
                console.log(e);
                return;
            }

            var _current = parseInt(result.data.now) / 1000;
            var _price = result.data.last.value;

            if (_current > current) {
                current = _current;
                console.log(new Date(_current).toString() + ": " + _price);
                msghub.publish("bitcoin", result, true);
                msghub.save("bitcoin", result);
                msghub.erase('bitcoin', {"timeframe": {"max": current - 10800 * 1000}});
            }
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

    global.gc();
}, 10000);

process.on('uncaughtException', function globalErrorCatch(error, p){
    console.error(error);
    console.error(error.stack);
});
