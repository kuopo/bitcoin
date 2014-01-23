var MSGHUB_PUBSUB_URL = 'https://pubsub.msghub.io';

var pricelist = [];
var window_size = 2 * 60;

function recv_update(channel, data) {
    var date = new Date( parseInt(data.data.now) / 1000 );
    // hours part from the timestamp
    var hours = date.getHours();
    // minutes part from the timestamp
    var minutes = date.getMinutes();
    // seconds part from the timestamp
    var seconds = date.getSeconds();
    // will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes + ':' + seconds;

    var result = data.data.last;

    document.getElementById('price').innerHTML = result.display + ' USD';
    document.getElementById('now').innerHTML = formattedTime;

    pricelist.push([data.data.now / 1000, parseInt(result.value_int) / 100000]);

    if (pricelist.length > window_size) pricelist = pricelist.slice(1);

    $.plot($("#placeholder"), [pricelist], {xaxis: {mode:"time", timeformat:"%H:%M:%S"}} );
}


var msghub = new MsgHub(MSGHUB_PUBSUB_URL);

msghub.load('bitcoin', {limit: 25}, function (err, data) {
    for (i = 0; i < data.data.length; i++) {
        var price = JSON.parse(data.data[i].message);
        var time = price.data.now;
        var value = price.data.last.value_int;
        pricelist.push([time / 1000, parseInt(value) / 100000]);
    }

    while (pricelist.length > window_size) pricelist = pricelist.slice(1);

    $.plot($("#placeholder"), [pricelist], {xaxis: {mode:"time", timeformat:"%H:%M:%S"}} );

    if (data.next) msghub.load('bitcoin', data.next, arguments.callee);
    else msghub.subscribe('bitcoin', recv_update);
});


