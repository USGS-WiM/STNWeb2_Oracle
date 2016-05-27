(function () {
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('siteSearchCtrl', ['$scope', '$cookies', '$rootScope', '$location', 'stateList', 'sensorTypes', 'networkNames', 'SITE', 
        function ($scope, $cookies, $rootScope, $location, stateList, sensorTypes, networkNames, SITE) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                $rootScope.thisPage = "Site Search";
                $rootScope.activeMenu = "sites"; // report, settings
                             
                // watch for the session event to change and update
                $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                    $scope.sessionEvent = $cookies.get('SessionEventName') !== null && $cookies.get('SessionEventName') !== undefined ? $cookies.get('SessionEventName') : "All Events";
                });
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

                // change sorting order
                $scope.sort_by = function (newSortingOrder) {
                    if ($scope.sortingOrder == newSortingOrder) {
                        $scope.reverse = !$scope.reverse;
                    }
                    $scope.sortingOrder = newSortingOrder;
                    // icon setup
                    $('th i').each(function () {
                        // icon reset
                        $(this).removeClass().addClass('glyphicon glyphicon-sort');
                    });
                    if ($scope.reverse) {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-up');
                    } else {
                        $('th.' + newSortingOrder + ' i').removeClass().addClass('glyphicon glyphicon-chevron-down');
                    }
                };

                //if they are coming back here, see if a search has been stored last time.
                if ($rootScope.searchParams !== undefined) {
                    var thisSearch = $rootScope.searchParams;
                    $scope.sessionEvent = Number(thisSearch.event);
                    //for each state, selected=true
                    //go through states and add selected Property.
                    for (var i = 0; i < $scope.states.length; i++) {
                        //for each one, if response has this id, add 'selected:true' else add 'selected:false'
                        for (var y = 0; y < thisSearch.state.length; y++) {
                            if (thisSearch.state[y] == $scope.states[i].STATE_ABBREV) {
                                $scope.states[i].selected = true;
                                y = thisSearch.state.length; //ensures it doesn't set it as false after setting it as true
                            } else
                                $scope.states[i].selected = false;
                        }
                        if (thisSearch.state.length === 0)
                            $scope.states[i].selected = false;
                    }
                    $scope.chosenStates = thisSearch.state;
                    $scope.Chosen.sensor = thisSearch.SensorType;
                    $scope.Chosen.network = thisSearch.NetworkName;
                    $scope.checkboxModel.hwmOnly = thisSearch.HWMOnly;
                    $scope.checkboxModel.senOnly = thisSearch.SensorOnly;
                    $scope.checkboxModel.rdgOnly = thisSearch.RDGOnly;
                    $scope.checkboxModel.opDefined = thisSearch.OPDefined;
                    SITE.getAll({
                        Event: $scope.sessionEvent,
                        State: $scope.chosenStates.join(),
                        SensorType: $scope.Chosen.sensor,
                        NetworkName: $scope.Chosen.network,
                        HWMOnly: $scope.checkboxModel.hwmOnly,
                        SensorOnly: $scope.checkboxModel.senOnly,
                        RDGOnly: $scope.checkboxModel.rdgOnly,
                        OPDefined: $scope.checkboxModel.opDefined
                    },
                    function success(response) {
                        $scope.siteList = response;
                        $scope.siteResponse = true;
                        $rootScope.stateIsLoading.showLoading = false; // loading..
                    }, function error(errorResponse) {
                        $rootScope.stateIsLoading.showLoading = false; // loading..
                        alert("Error: " + errorResponse.statusText);
                    });
                }
                //filter options chosen, go get these sites to show in a table
                $scope.searchSites = function () {
                    $rootScope.stateIsLoading.showLoading = true; // loading..
                    //store search in case they leave and click back
                   
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
                        $scope.siteList = response;
                        $scope.siteResponse = true;
                        $rootScope.stateIsLoading.showLoading = false; // loading..
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
                };
            }
        }]);
})();