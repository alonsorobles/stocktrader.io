'use strict';

angular.module('portfolioServices', ['ngResource'])
    .factory('Portfolio', function ($resource) {
        return $resource('/api/portfolio/:portfolioId');
    });