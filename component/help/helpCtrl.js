(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('helpCtrl', ['$scope', 
        function ($scope) {
            $scope.helpInfo = {};
            $scope.helpInfo.fact = "Some really interesting help will be here.";
        }]);

})();