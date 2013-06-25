'use strict';

angular.module('portfolioServices', ['ngResource'])
    .factory('Portfolio', function ($resource) {
        return $resource('/api/portfolio/:portfolioId');
    }).factory('Quote', function($resource) {
        return $resource('/api/quote/:symbol');
    }).factory('PortfolioSecurity', function ($resource) {
        return $resource('/api/portfolio/:portfolioId/security/:symbol', {portfolioId: '@portfolioId'});
    });