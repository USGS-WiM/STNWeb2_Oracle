(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('objectivePointCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'OBJECTIVE_POINT', 'MEMBER', 'thisSite', 'thisSiteOPs', 'allOPTypes', 'allHorDatums', 'allHorCollMethods', 'allVertDatums', 'allVertColMethods', 'allOPQualities', 'allFileTypes', 'allAgencies',
        function ($scope, $rootScope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, OBJECTIVE_POINT, MEMBER, thisSite, thisSiteOPs, allOPTypes, allHorDatums, allHorCollMethods, allVertDatums, allVertColMethods, allOPQualities, allFileTypes, allAgencies) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //global vars
                $scope.opCount = { total: thisSiteOPs.length };
                $scope.SiteObjectivePoints = thisSiteOPs;

                $scope.showOPModal = function (OPclicked) {
                    $scope.opFileTypes = allFileTypes.filter(function (oft) {
                        return oft.FILETYPE === 'Photo' || oft.FILETYPE === 'Field Sheets' || oft.FILETYPE === 'Level Notes' ||
                            oft.FILETYPE === 'Other' || oft.FILETYPE === 'NGS Datasheet' || oft.FILETYPE === 'Sketch';
                    });
                    var passAllLists = [allOPTypes, allHorDatums, allHorCollMethods, allVertDatums, allVertColMethods, allOPQualities, $scope.opFileTypes];
                    var indexClicked = $scope.SiteObjectivePoints.indexOf(OPclicked);
                    $rootScope.stateIsLoading = { showLoading: true }; //Loading...
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl : 'OPmodal.html',
                        controller: 'OPmodalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false,
                        windowClass: 'rep-dialog',
                        resolve: {
                            allDropdowns: function () {
                                return passAllLists;
                            },
                            thisOP: function () {
                                return OPclicked !== 0 ? OPclicked: "empty";
                            },
                            thisOPControls: function () {
                                if (OPclicked !== 0) {
                                    return OBJECTIVE_POINT.getOPControls({id: OPclicked.OBJECTIVE_POINT_ID}).$promise;
                                }
                            },
                            opSite: function () {
                                return thisSite;
                            },
                            agencyList: function () {
                                return allAgencies;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return MEMBER.getAll().$promise;
                            },
                        }
                    });
                    modalInstance.result.then(function (createdOP) {
                        //is there a new op or just closed modal
                        $rootScope.stateIsLoading = { showLoading: false }; //Loading...
                        if (createdOP !== undefined) {
                            if (createdOP[1] == 'created') {
                                $scope.SiteObjectivePoints.push(createdOP[0]);
                                $scope.opCount.total = $scope.SiteObjectivePoints.length;
                            }
                            if (createdOP[1] === undefined) {
                                //this is from edit -- refresh page?
                                //update the list
                                var iClicked = $scope.SiteObjectivePoints.indexOf(OPclicked);
                                $scope.SiteObjectivePoints[iClicked] = createdOP;
                            }                            
                            if (createdOP[1] == 'deleted') {
                                var indexClicked1 = $scope.SiteObjectivePoints.indexOf(OPclicked);
                                $scope.SiteObjectivePoints.splice(indexClicked1, 1);
                                $scope.opCount.total = $scope.SiteObjectivePoints.length;
                            }
                        }
                    });
                };
            }
        }]);
})();