/**
 * Created by bdraper on 3/9/2016.
 */
(function () {
    'use strict';
    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('MapSiteInfoController', ['$scope', '$http', '$rootScope', '$cookies', '$location', 'SITE', 'leafletMarkerEvents', 'leafletBoundsHelpers', '$state', 'spinnerService',
        function ($scope, $http, $rootScope, $cookies, $location, SITE,  leafletMarkerEvents, leafletBoundsHelpers, $state, spinnerService) {
            $scope.status = { siteOpen: true }; //accordion for siteInfo
            $rootScope.$on('mapSiteClickResults', function (event, siteParts) {
                $scope.aSite = siteParts[0];
                //only 6 decimal places for lat/long

                $scope.aSite.LATITUDE_DD = parseFloat($scope.aSite.LATITUDE_DD.toFixed(6));
                $scope.aSite.LONGITUDE_DD = parseFloat($scope.aSite.LONGITUDE_DD.toFixed(6));
                spinnerService.hide("siteInfoSpinner");
            });

            $scope.goToSiteDashboard = function () {
                $state.go('site.dashboard', { id: $scope.aSite.SITE_ID });
            };
        }]);//end controller function
})();
