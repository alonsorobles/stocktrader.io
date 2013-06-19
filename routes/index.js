var path = require('path');

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', {title: 'stocktrader.io'});
};