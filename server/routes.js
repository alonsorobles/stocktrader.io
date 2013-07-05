'use strict';

var _ = require('underscore'),
    path = require('path'),
    PortfolioCtrl = require('./controllers/portfolio'),
    PortfolioSecurityCtrl = require('./controllers/portfolioSecurity'),
    QuoteCtrl = require('./controllers/quote'),
    routes;

routes = [
    {
        path: '/templates/*',
        httpMethod: 'GET',
        middleWare: [function (req, res) {
            var view = path.join('./', req.url);
            res.render(view);
        }]
    },
    {
        path: '/*',
        httpMethod: 'GET',
        middleWare: [ function (req, res) {
            res.render('index');
        }]
    }
];

function registerRoutes(app, routes) {
    _.each(routes, function (route) {
        var args = _.flatten([route.path, route.middleWare], false);

        switch (route.httpMethod.toLocaleUpperCase()) {
            case 'GET':
                app.get.apply(app, args);
                break;
            case 'POST':
                app.post.apply(app, args);
                break;
            case 'PUT':
                app.put.apply(app, args);
                break;
            case 'DELETE':
                app.delete.apply(app, args);
                break;
            default:
                throw new Error('Invalid HTTP method specified for route ' + route.path);
                break;
        }
    });
}

module.exports = function (app) {
    registerRoutes(app, PortfolioCtrl.routes);
    registerRoutes(app, PortfolioSecurityCtrl.routes);
    registerRoutes(app, QuoteCtrl.routes);
    registerRoutes(app, routes);
};