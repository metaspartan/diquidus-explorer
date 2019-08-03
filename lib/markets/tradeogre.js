var request = require('request');
 
var base_url = 'https://tradeogre.com/api/v1';
function get_summary(coin, exchange, tradeogre_id, cb) {
    var summary = {};
    request({ uri: base_url + '/ticker/' + tradeogre_id, json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.success === true) {
			console.log(body.success);
            summary['bid'] = parseFloat(body['bid']).toFixed(8);
            summary['ask'] = parseFloat(body['ask']).toFixed(8);
            summary['volume'] = body['volume'];
            summary['high'] = parseFloat(body['high']).toFixed(8);
            summary['low'] = parseFloat(body['low']).toFixed(8);
            summary['last'] = parseFloat(body['price']).toFixed(8);
            summary['change'] = parseFloat(body['initialprice']).toFixed(8); //Needs more work
            return cb(null, summary);
        } else {
            return cb(error, null);
        }
    });
        
}
function get_trades(coin, exchange, tradeogre_id, cb) {
    var req_url = base_url + '/history/' + tradeogre_id;
    request({ uri: req_url, json: true }, function (error, response, body) {
		if (body.success == 0) {
		  return cb(body.error, null, null);
		} else {
            var tTrades = body;
            var trades = [];
            for (var i = 0; i < tTrades.length; i++) {
                var Trade = {
                    ordertype: tTrades[i].type,
                    amount: parseFloat(tTrades[i].quantity).toFixed(8),
                    price: parseFloat(tTrades[i].price).toFixed(8),
                    //  total: parseFloat(tTrades[i].Total).toFixed(8)
                    // Necessary because API will return 0.00 for small volume transactions
                    total: (parseFloat(tTrades[i].quantity).toFixed(8) * parseFloat(tTrades[i].price)).toFixed(8),
                    timestamp: tTrades[i].date
                }
                trades.push(Trade);
            }
            return cb(null, trades);
        }
    });
}

//Under construction
function get_orders(coin, exchange, tradeogre_id, cb) {
    var req_url = base_url + '/orders/' + tradeogre_id;
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.success == true) {
            var orders = body;
			var buyorders = body.buy;
			var sellorders = body.sell;
            var buys = [];
            var sells = [];
            if (buyorders.length > 0){
                for (var i = 0; i < buyorders.length; i++) {
                    var order = {
                        amount: parseFloat(buyorders).toFixed(8),
                        price: parseFloat(buyorders).toFixed(8),
                        //  total: parseFloat(orders.Buy[i].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(buyorders).toFixed(8) * parseFloat(buyorders)).toFixed(8)
                    }
                    buys.push(order);
                }
                } else {}
                if (sellorders.length > 0) {
                for (var x = 0; x < sellorders.length; x++) {
                    var order = {
                        amount: parseFloat(sellorders).toFixed(8),
                        price: parseFloat(sellorders).toFixed(8),
                        //    total: parseFloat(orders.Sell[x].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(sellorders).toFixed(8) * parseFloat(sellorders)).toFixed(8)
                    }
                    sells.push(order);
                }
            } else {
            }
            return cb(null, buys, sells);
            } else {
            return cb(body.Message, [], [])
        }
    });
}


module.exports = {
    get_data: function (coin, exchange, tradeogre_id, cb) {
        var error = null;
        get_orders(coin, exchange, tradeogre_id, function (err, buys, sells) {
            if (err) { error = err; }
            get_trades(coin, exchange, tradeogre_id, function (err, trades) {
                if (err) { error = err; }
                get_summary(coin, exchange, tradeogre_id, function (err, stats) {
                    if (err) { error = err; }
                    return cb(error, { buys: buys, sells: sells, chartdata: [], trades: trades, stats: stats });
                });
            });
        });
    }
};

