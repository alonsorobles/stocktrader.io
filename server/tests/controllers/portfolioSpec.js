'use strict';

var expect = require('chai').expect,
    PortfolioCtrl = require('../../controllers/portfolio');

describe('Portfolio controller', function() {

    var req = {},
        res = {};

    describe('#index(req, res)', function() {
        it('should return a list of portfolios', function(done) {

            res.json  = function(data) {
                expect(data).to.be.a('array');
                done();
            };

            PortfolioCtrl.index(req, res);
        });
    });
});