var ListCtrl = function ListCtrl($scope, $http) {
    var result = $http.get('api/portfolios');
    result.success(function (data) {
       $scope.items = data;
    });
};
