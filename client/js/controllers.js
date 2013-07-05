'use strict';

function PortfolioListCtrl($scope, Portfolio) {

    $scope.addPortfolio = function (newPortfolioName) {
        if (newPortfolioName) {
            var newPortfolio = new Portfolio({name: newPortfolioName});
            newPortfolio.$save(function (portfolio) {
                $scope.portfolios.push(portfolio);
                $scope.newPortfolioName = '';
            });
        }
    };

    $scope.removePortfolio = function (portfolio) {
        if (confirm('Remove your "' + portfolio.name + '" portfolio? There is no undo...')) {
            portfolio.$delete({portfolioId: portfolio._id});
            $scope.portfolios.splice($scope.portfolios.indexOf(portfolio), 1);
        }
    };

    $scope.orderBy = 'name';
    $scope.portfolios = Portfolio.query();
}

function PortfolioDetailCtrl($scope, $routeParams, Portfolio, Quote, PortfolioSecurity) {

    var isSecurityInPortfolio = function (symbol) {
        return _.findWhere($scope.portfolio.securities, {symbol: symbol});
    };

    function calculateTrends(security) {
        security.change = security.lastPrice - security.previousClose;
        if (security.change > 0) {
            security.changeClass = 'text-success';
            security.changePrefix = '+';
        } else if (security.change < 0) {
            security.changeClass = 'text-error';
        }
        security.changePercentage = (Math.abs(security.change) / security.previousClose) * 100;
        if (security.yahooFinanceMovingAverage.d50 < security.yahooFinanceMovingAverage.d200) {
            security.trendClass = 'badge-important';
            security.trendIcon = 'icon-arrow-down';
        } else if (security.yahooFinanceMovingAverage.d50 > security.yahooFinanceMovingAverage.d200) {
            security.trendClass = 'badge-success';
            security.trendIcon = 'icon-arrow-up';
        } else {
            security.trendIcon = 'icon-minus';
        }
        return security;
    }

    $scope.addSecurity = function (symbol) {
        if (symbol) {
            var newSecurity = {symbol: symbol};
            if (!isSecurityInPortfolio(newSecurity)) {
                newSecurity = new PortfolioSecurity({portfolioId: $routeParams.portfolioId, symbol: symbol});
                newSecurity.$save(function (security) {
                    var calculatedSecurity = calculateTrends(security);
                    $scope.securities.push(calculatedSecurity);

                    if ($scope.portfolio.securities) {
                        $scope.portfolio.securities = [];
                    }
                    $scope.portfolio.securities.push(calculatedSecurity);

                    $scope.searchResult = undefined;
                });
            }
        }
    };

    $scope.removeSecurity = function (symbol) {
        if (confirm('Remove this security? There is no undo...')) {
            var securityToDelete = _.findWhere($scope.portfolio.securities, {symbol: symbol});
            if (securityToDelete) {
                PortfolioSecurity.delete({portfolioId: $routeParams.portfolioId, symbol: symbol});
                $scope.portfolio.securities.splice($scope.portfolio.securities.indexOf(securityToDelete), 1);
                $scope.securities.splice($scope.portfolio.securities.indexOf(securityToDelete), 1);
            }
        }
    };

    $scope.doSymbolSearch = function () {
        $scope.searchInfo = undefined;
        $scope.searchError = undefined;
        $scope.searchResult = undefined;
        var symbol = $scope.searchSymbol.toLocaleUpperCase();
        if (symbol) {
            if (isSecurityInPortfolio(symbol)) {
                $scope.searchInfo = 'Silly trader! ' + symbol + ' is already in this portfolio.';
            } else {
                Quote.get({symbol: symbol}, function (quote) {
                    $scope.searchResult = quote;
                }, function (response) {
                    if (response.status === 404) {
                        $scope.searchError = 'We searched and searched... but alas, we could not find ' + symbol + '.';
                    }
                });
            }
        }
        $scope.searchSymbol = '';
    };

    $scope.sort = 'symbol';

    Portfolio.get($routeParams, function (portfolio) {
        $scope.portfolio = portfolio;
        $scope.securities = [];
        _.each($scope.portfolio.securities, function (security) {
            $scope.securities.push(calculateTrends(security));
        });
    });
}