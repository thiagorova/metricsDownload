var myApp = angular.module('metricsApp', ['ui.router']);
myApp.config(function($stateProvider) {
  var states = [
    {
      name:'none',
      url:'/',
      templateUrl:'projects.html'
    },
    {
      name: 'empty',
      url: '/empty',
      templateUrl: 'empty.html'
    },

    {
      name: 'projects',
      url: '/projects',
      templateUrl: 'projects.html'

    },
    {
      name: 'create',
      url: '/create',
      templateUrl: 'create.html'
    },
    {
      name: 'charts',
      url: '/charts',
      templateUrl: 'charts.html'
    }
  ]

  // Loop over the state definitions and register them
  states.forEach(function(state) {
    $stateProvider.state(state);
  });

});

myApp.controller('indexController', function($scope, $location, $state){
  $scope.metrics = new Metrics("replace_this_text_with_you_API_key");
  $state.go("projects");
});
