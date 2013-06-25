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

function PortfolioDetailCtrl($scope, $routeParams, Portfolio) {

    var isSecurityInPortfolio = function (symbol) {
        return _.findWhere($scope.portfolio.securities, {symbol: symbol});
    };

    $scope.addSecurity = function () {
        var quote = $scope.searchResult;
        if (quote) {
            var newSecurity = {symbol: quote.symbol};
            if (!isSecurityInPortfolio(newSecurity)) {
                if ($scope.portfolio.securities) {
                    $scope.portfolio.securities.push(newSecurity);
                } else {
                    $scope.portfolio.securities = [newSecurity];
                }
                $scope.portfolio.$save($routeParams, function (portfolio) {
                    $scope.portfolio = portfolio;
                    $scope.searchResult = undefined;
                });
            }
        }
    };

    $scope.removeSecurity = function (symbol) {
        if (confirm('Remove this security? There is no undo...')) {
            console.log(symbol);
            var securityToDelete = _.findWhere($scope.portfolio.securities, {symbol: symbol});
            if (securityToDelete) {
                $scope.portfolio.securities.splice($scope.portfolio.securities.indexOf(securityToDelete), 1);
                $scope.portfolio.$save($routeParams);
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
                StockTrader.quote.get({symbol: symbol}, function (quote) {
                    $scope.searchResult = quote;
                }, function (response) {
                    if (response.status == 404) {
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
    });
}