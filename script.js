var module = angular.module('demoApp', ['ngMockE2E','ngRoute'])
.config(['$provide', '$routeProvider','$locationProvider',function($provide,$routeProvider,$locationProvider) {
  $provide.decorator('$httpBackend', function($delegate) {
    var proxy = function(method, url, data, callback, headers) {
      var interceptor = function() {
        var _this = this,
          _arguments = arguments;
        setTimeout(function() {
          callback.apply(_this, _arguments);
        }, 2000);
      };
      return $delegate.call(this, method, url, data, interceptor, headers);
    };
    for(var key in $delegate) {
      proxy[key] = $delegate[key];
    }
    return proxy;
  });
 $routeProvider
 .when('/login',{
   templateUrl: 'user.tpl.html',
   controller: 'UserCtrl'
 })
 .when('/report',{
   templateUrl: 'report.tpl.html',
   controller: 'ReportCtrl',
   resolve: {
     reportdata: ['$http', function($http){
       return $http.get('report.json').then(function(data){
         return data.data;
       });
     }]
   }
 })
 .otherwise({redirectedTo: '/login'});
$locationProvider.html5Mode(true);
}]).run(function($httpBackend){
  $httpBackend.whenPOST('/login').respond(function(method, url, data) {
    var details = angular.fromJson(data);
    if(details.email && details.email === 'test@test.com' && details.password && details.password === "test")
       return [200, {loggedIn: true, userid: 'testid'}, {}];
    else return [200, {loggedIn: false}, {}];
  });
//   $httpBackend.whenGET(/^.*\.tpl\.html$/i).passThrough();
  $httpBackend.whenGET(/.*/i).passThrough();
});
module.controller('MainCtrl', ['$scope', function($scope){}]);
module.controller('UserCtrl',['$scope', '$http', '$location', function($scope, $http, $location){
  $scope.data = {};
  $scope.loading = false;
  $scope.postResult = 0;
  $scope.submit = function(){
    $scope.loading = true;
    $http.post('/login', $scope.data).success(function(data){
      $scope.loading = false;
      if(data.loggedIn){
        $scope.postResult = 1;
        $location.url('/report');
      }
      else $scope.postResult = 2;
      console.log('result', data);
    });
  };
}]);
module.controller('ReportCtrl', ['$scope', '$http', 'reportdata', function($scope, $http, reportdata){
$scope.data=reportdata;
}]);