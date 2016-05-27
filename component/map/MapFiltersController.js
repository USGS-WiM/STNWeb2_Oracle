/**
 * Created by bdraper on 4/7/2016.
 */
(function () {
    'use strict';
    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('MapFiltersController', ['$scope', '$http', '$rootScope', '$cookies', '$location', 'SITE', 'Map_Filter', '$state',  'stateList', 'sensorTypes', 'networkNames', 'spinnerService',
        function ($scope, $http, $rootScope, $cookies, $location, SITE, Map_Filter, $state, stateList, sensorTypes, networkNames, spinnerService) {
            $scope.status = { siteOpen: true }; //accordion for siteInfo

            $scope.states = stateList;
            $scope.senTypes = sensorTypes;
            $scope.netNames = networkNames;
            $scope.Chosen = {};
            $scope.chosenStates = []; //used to join each abbrev to pass to call
            $scope.siteResponse = false;
            $scope.checkboxModel = {
                hwmOnly: 0,
                senOnly: 0,
                rdgOnly: 0,
                opDefined: 0
            };

            $scope.searchSites = function () {
                //$rootScope.stateIsLoading.showLoading = true; // loading..
                //store search in case they leave and click back
                spinnerService.show("mapSpinner");
                var stateString = $scope.chosenStates.join();
                $scope.siteResponse = false;
                $scope.siteList = [];
                var evID = $cookies.get('SessionEventID') !== null && $cookies.get('SessionEventID') !== undefined ? $cookies.get('SessionEventID') : 0;
                $rootScope.searchParams = {
                    event: evID,
                    state: $scope.chosenStates,
                    SensorType: $scope.Chosen.sensor,
                    NetworkName: $scope.Chosen.network,
                    HWMOnly: $scope.checkboxModel.hwmOnly,
                    SensorOnly: $scope.checkboxModel.senOnly,
                    RDGOnly: $scope.checkboxModel.rdgOnly,
                    OPDefined: $scope.checkboxModel.opDefined
                };
                SITE.getAll({
                        Event: evID,
                        State: stateString,
                        SensorType: $scope.Chosen.sensor,
                        NetworkName: $scope.Chosen.network,
                        HWMOnly: $scope.checkboxModel.hwmOnly,
                        SensorOnly: $scope.checkboxModel.senOnly,
                        RDGOnly: $scope.checkboxModel.rdgOnly,
                        OPDefined: $scope.checkboxModel.opDefined
                    },
                    function success(response) {
                        // $scope.siteList = response;
                        // $scope.siteResponse = true;
                        spinnerService.hide("mapSpinner");
                        //$rootScope.stateIsLoading.showLoading = false; // loading..
                        Map_Filter.setFilteredSites(response);

                    }, function error(errorResponse) {
                        $rootScope.stateIsLoading.showLoading = false; // loading..
                        alert("Error: " + errorResponse.statusText);
                    });
            };//end searchSites click action

            //add each state to an array to be joined in the GET
            $scope.stateClick = function (data) {
                if (data.selected === true) {
                    $scope.chosenStates.push(data.STATE_ABBREV);
                }
                if (data.selected === false) {
                    var ind = $scope.chosenStates.indexOf(data.STATE_ABBREV);
                    if (ind >= 0) {
                        $scope.chosenStates.splice(ind, 1);
                    }
                }
            };

            //clear the filter choices (start over)
            $scope.clearFilters = function () {
                spinnerService.show("mapSpinner");
                $scope.checkboxModel = {
                    hwmOnly: 0,
                    senOnly: 0,
                    rdgOnly: 0,
                    opDefined: 0
                };
                $scope.Chosen = {};
                $scope.chosenStates = [];
                angular.forEach($scope.states, function (st) {
                    st.selected = false;
                });
                var evID = $cookies.get('SessionEventID') !== null && $cookies.get('SessionEventID') !== undefined ? $cookies.get('SessionEventID') : 0;
                SITE.getAll({
                        Event: evID
                },
                function success(response) {
                    //spinnerService.hide("mapSpinner");
                    Map_Filter.setFilteredSites(response);
                    spinnerService.hide("mapSpinner");
                }, function error(errorResponse) {

                });
            };

            // $rootScope.$on('mapSiteClick', function (event, siteParts) {
            //     $scope.aSite = siteParts[0];
            //     //only 6 decimal places for lat/long
            //     $scope.aSite.LATITUDE_DD = parseFloat($scope.aSite.LATITUDE_DD.toFixed(6));
            //     $scope.aSite.LONGITUDE_DD = parseFloat($scope.aSite.LONGITUDE_DD.toFixed(6));
            // });

        }]);//end controller function
})();
