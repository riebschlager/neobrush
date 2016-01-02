var uiApp = angular.module('UiApp', []);

uiApp.controller('UiController', function($scope) {

  $scope.sketch = sketch;

  $scope.colorSources = [
    'img/source-0.jpg',
    'img/source-1.jpg',
    'img/source-2.jpg',
    'img/source-3.jpg',
    'img/source-4.jpg',
    'img/source-5.jpg',
    'img/source-6.jpg',
    'img/source-7.jpg',
    'img/source-8.jpg'
  ];

  $scope.activeColorSource = $scope.colorSources[0];

  $scope.setColorSource = function(colorSource) {
    sketch.updateSource(colorSource);
    $scope.activeColorSource = colorSource;
  };

  $scope.presets = [{
    name: 'Brushey',
    numberOfLines: 100,
    easing: 0.25,
    easingJitter: 0.1,
    speed: 0.3,
    speedJitter: 0.1,
    vertices: 8,
    verticesJitter: 1
  }, {
    name: 'Stripey',
    numberOfLines: 11,
    easing: 0.1,
    easingJitter: 0,
    speed: 0.1,
    speedJitter: 0,
    vertices: 30,
    verticesJitter: 1
  }, {
    name: 'Thin',
    numberOfLines: 30,
    easing: 0.67,
    easingJitter: 0,
    speed: 0.18,
    speedJitter: 0.1,
    vertices: 25,
    verticesJitter: 4
  }, {
    name: 'Fuzzy',
    numberOfLines: 25,
    easing: 0.42,
    easingJitter: 0.1,
    speed: 0.45,
    speedJitter: 0.02,
    vertices: 8,
    verticesJitter: 1
  }, {
    name: 'Nutso',
    numberOfLines: 200,
    easing: 0.28,
    easingJitter: 0.19,
    speed: 0.12,
    speedJitter: 0.47,
    vertices: 11,
    verticesJitter: 2
  }];

  sketch.ui = $scope.ui = $scope.presets[0];

  $scope.choosePreset = function(preset) {
    sketch.ui = $scope.ui = preset;
  };

  $scope.update = function() {
    sketch.ui = $scope.ui;
  };

});
