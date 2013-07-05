'use strict';

var csv = require('csv'),
    http = require('http');

function get(symbols, callback) {
    var yahooUrl = 'http://download.finance.yahoo.com/d/quotes.csv?s=' + symbols.join('+') + '&f=d1l1ophgm3m4xsne1';
    console.log("Requesting data from: " + yahooUrl);
    http.get(yahooUrl, function (yahoo) {
        yahoo.setEncoding('utf8');
        var quotes = [],
            error;
        yahoo.on('data', function (chunk) {
            csv()
                .from(chunk)
                .transform(function (row) {
                    var tradeDate = new Date(row[0]),
                        quote;
                    if (row[11] && row[11].toUpperCase() !== 'N/A') {
                        console.warn('Yahoo! Finance Quote Error for ' + row[9] + ': ' + row[11]);
                    }
                    if (tradeDate) {
                        quote = {
                            lastTradeDate: new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate(), 0, 0, 0, 0),
                            lastPrice: row[1],
                            open: row[2],
                            previousClose: row[3],
                            high: row[4],
                            low: row[5],
                            ma50: row[6],
                            ma200: row[7],
                            exchange: row[8],
                            symbol: row[9],
                            name: row[10]
                        };
                        quotes.push(quote);
                    }
                })
                .on('end', function () {
                    callback(error, quotes);
                })
                .on('error', function (err) {
                    error = err;
                    console.error('Yahoo! Finance CSV Error: ' + err.message);
                });
        });
    })
        .on('error', function (err) {
            callback(err);
        });
}

module.exports = {
    get: get
};