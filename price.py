import requests
import json
import time

import sys
#sys.path.append("..")
from pubsub_client import MsgHub

msghub = MsgHub("pubsub.msghub.io", 443, secure=True)
#msghub = MsgHub("pubsub.msghub.io", 58080)
#msghub = MsgHub("198.199.97.15", 12345)

current = int(round(time.time() * 1000))
msghub.erase('bitcoin', {"timeframe": {"max": current - 10800000}})
count = 0

while True:
    try:
        r = requests.get('http://data.mtgox.com/api/1/BTCUSD/ticker', timeout=5)
    
        _current = int(json.loads(r.text)['return']['now']) / 1000
        _price = json.loads(r.text)['return']['last_local']['display']
    
        if _current > current:
            current = _current
            print str(int(_current)) + ", " + _price
            msghub.publish("bitcoin", json.loads(r.text), True)
            msghub.save("bitcoin", json.loads(r.text))

            count = count + 1

        if count > 60:
            msghub.erase('bitcoin', {"timeframe": {"max": current - 10800 * 1000}})
            count = 0
    
        time.sleep(10)
    except Exception as e:
        print e
        time.sleep(1)
        msghub = MsgHub("pubsub.msghub.io", 443, secure=True)
