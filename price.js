var httpclient = require('https');
var MsgHub = require('/root/pubsub/pubsub-client.js')

var current = new Date().getTime();
msghub = new MsgHub('https://pubsub.msghub.io');
//msghub = new MsgHub('http://198.199.97.15:12345');
msghub.erase('bitcoin', {"timeframe": {"max": current - 21600 * 1000}});


setInterval( function() {
    var options = {
        host: 'api.bitcoinaverage.com',
        path: '/ticker/global/USD/',
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

            var _current = (new Date(result.timestamp)).getTime();
            var _price = result.last;

            if (_current > current) {
                current = _current;
                console.log(new Date(_current).toString() + ": " + _price);
                msghub.publish("bitcoin", result, true);
                msghub.save("bitcoin", result);
                msghub.erase('bitcoin', {"timeframe": {"max": current - 21600 * 1000}});
            }
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });

    global.gc();
}, 30000);

process.on('uncaughtException', function globalErrorCatch(error, p){
    console.error(error);
    console.error(error.stack);
});
