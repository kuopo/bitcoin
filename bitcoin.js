var MSGHUB_PUBSUB_URL = 'https://pubsub.msghub.io';

var pricelist = [];
var window_size = 2 * 60;

function recv_update(channel, data) {
    var date = new Date(data.timestamp);

    document.getElementById('price').innerHTML = data.last + ' USD';
    document.getElementById('now').innerHTML = date.toUTCString();

    pricelist.push([(new Date(data.timestamp)).getTime(), parseInt(data.last)]);

    if (pricelist.length > window_size) pricelist = pricelist.slice(1);

    $.plot($("#placeholder"), [pricelist], {xaxis: {mode:"time", timeformat:"%H:%M:%S"}} );
}


var msghub = new MsgHub(MSGHUB_PUBSUB_URL);

msghub.load('bitcoin', {limit: 25}, function (err, data) {
    for (i = 0; i < data.data.length; i++) {
        var price = JSON.parse(data.data[i].message);
        var time = new Date(price.timestamp).getTime();
        var value = price.last;
        pricelist.push([time, parseInt(value)]);
    }

    while (pricelist.length > window_size) pricelist = pricelist.slice(1);

    $.plot($("#placeholder"), [pricelist], {xaxis: {mode:"time", timeformat:"%H:%M:%S"}} );

    if (data.next) msghub.load('bitcoin', data.next, arguments.callee);
    else msghub.subscribe('bitcoin', recv_update);
});
