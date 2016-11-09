angular.module('metricsApp').controller('chartsController', function($scope, $rootScope){
//generating the graph
  var lineGraph = new LineGraph();

  $scope.openProject = function(){
                console.log($rootScope.project);
    $scope.dProject = $rootScope.project;  //the project is passed in this var now: $rootScope.project
    $scope.metrics.getMetrics($scope.dProject.id, function (metrics) {
      if(metrics !== "") {
        lineGraph.clear();
        lineGraph.build(430, 240);
        lineGraph.setDateFormat("day_whole");
        lineGraph.setData(metrics);
      }
    });
  };

  function measuring() {
    document.getElementById("start").style.display = "none";
    document.getElementById("pause").style.display = "inline-block";  
   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.browserAction.setIcon({
        path : "img/icons/recording.png",
        tabId: tabs[0].id
      });
    });
  }
  
  function stopped() {
    document.getElementById("start").style.display = "inline-block";
    document.getElementById("pause").style.display = "none";  
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.browserAction.setIcon({
        path : "img/icons/icon128.png",
        tabId: tabs[0].id
      });
    });
  }

//setting the messages to start recording the data
  $scope.startMeasuring = function(){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {request: "start", project: $scope.dProject.id}, null);
    });
    measuring();
  };

  $scope.stopMeasuring = function(project) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {request: "stop", project: $scope.dProject.id}, null);
    });
    stopped();
  };
  
  $scope.openProject();
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {request: "isMeasuring", project: $scope.dProject.id}, function(response) {
      if (response === true) {
        measuring();
      } else {
          stopped();
      }
    });
  });
  
});
