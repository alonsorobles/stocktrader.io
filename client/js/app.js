'use strict';

angular.module('stockTrader', ['portfolioServices'])
    .config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/portfolio-list',
            controller: PortfolioListCtrl
        })
        .when('/portfolio/:portfolioId', {
            templateUrl: 'templates/portfolio-detail',
            controller: PortfolioDetailCtrl
        })
        .otherwise({
            redirectTo: ''
        });
});





