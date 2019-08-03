var request = require('request');
 
var base_url = 'https://tradeogre.com/api/v1';
function get_summary(coin, exchange, tradeogre_id, cb) {
    var summary = {};
    request({ uri: base_url + '/ticker/' + 'BTC-D', json: true }, function (error, response, body) {
        if (error) {
            return cb(error, null);
        } else if (body.Success === true) {
            summary['bid'] = body.Data['bid'].toFixed(8);
            summary['ask'] = body.Data['ask'].toFixed(8);
            summary['volume'] = body.Data['volume'];
            summary['high'] = body.Data['high'].toFixed(8);
            summary['low'] = body.Data['low'].toFixed(8);
            summary['last'] = body.Data['price'].toFixed(8);
            summary['change'] = body.Data['initialprice'].toFixed(8); //Needs more work
            return cb(null, summary);
        } else {
            return cb(error, null);
        }
    });
        
}
function get_trades(coin, exchange, crytopia_id, cb) {
    var req_url = base_url + '/history/' + 'BTC-D';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.Success == true) {
            var tTrades = body.Data;
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
        } else {
            return cb(body.Message, null);
        }
    });
}

function get_orders(coin, exchange, tradeogre_id, cb) {
    var req_url = base_url + '/orders/' + 'BTC-D';
    request({ uri: req_url, json: true }, function (error, response, body) {
        if (body.Success == true) {
            var orders = body.Data;
            var buys = [];
            var sells = [];
            if (orders['buy'].length > 0){
                for (var i = 0; i < orders['buy'].length; i++) {
                    var order = {
                        amount: parseFloat(orders.Buy[i]).toFixed(8),
                        price: parseFloat(orders.Buy[i]).toFixed(8),
                        //  total: parseFloat(orders.Buy[i].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.Buy[i]).toFixed(8) * parseFloat(orders.Buy[i])).toFixed(8)
                    }
                    buys.push(order);
                }
                } else {}
                if (orders['sell'].length > 0) {
                for (var x = 0; x < orders['sell'].length; x++) {
                    var order = {
                        amount: parseFloat(orders.Sell[x]).toFixed(8),
                        price: parseFloat(orders.Sell[x]).toFixed(8),
                        //    total: parseFloat(orders.Sell[x].Total).toFixed(8)
                        // Necessary because API will return 0.00 for small volume transactions
                        total: (parseFloat(orders.Sell[x]).toFixed(8) * parseFloat(orders.Sell[x])).toFixed(8)
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

