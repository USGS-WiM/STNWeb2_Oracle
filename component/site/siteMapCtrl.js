(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('siteMapCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', 'siteId',
        function ($scope, $rootScope, $cookies, $location, $state, siteId) {
            $scope.mapStuff = "here's the map accordion content";
            $scope.thisSiteID = siteId;
        }]);//end controller
})();