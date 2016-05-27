/**
 * Created by bdraper on 3/9/2016.
 */
(function () {
    'use strict';
    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('MapPeaksController', ['$scope', '$rootScope', '$http', '$cookies', '$location', 'leafletMarkerEvents', 'leafletBoundsHelpers', '$state',
        function ($scope, $rootScope, $http, $cookies, $location, leafletMarkerEvents, leafletBoundsHelpers, $state) {
            $rootScope.$on('mapSiteClickResults', function (event, siteParts) {
                $scope.sitePeaks = [];
                var allSitePeaks = siteParts[1];
                for (var p = 0; p < allSitePeaks.length; p++) {
                    if (allSitePeaks[p].EVENT_NAME == $cookies.get('SessionEventName'))
                        $scope.sitePeaks.push(allSitePeaks[p]);
                }
                $scope.showPeaks = true;
            });
            
            $scope.showPeaks = false;
        }]);//end controller function
})();