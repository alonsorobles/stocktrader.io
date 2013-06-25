'use strict';

angular.module('stockTrader', ['portfolioServices'])
    .config(function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'templates/portfolio-list.html',
            controller: PortfolioListCtrl
        })
        .when('/portfolio/:portfolioId', {
            templateUrl: 'templates/portfolio-detail.html',
            controller: PortfolioDetailCtrl
        })
        .otherwise({
            redirectTo: ''
        });
});





