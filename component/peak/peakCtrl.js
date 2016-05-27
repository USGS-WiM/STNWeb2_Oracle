(function () {
   'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('peakCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'thisSite', 'Site_Files', 'thisSitePeaks', 'allVertDatums', 'allHWMQualities', 'allHWMTypes', 'PEAK', 'HWM', 'MEMBER', 'SITE','INST_COLL_CONDITION',
        function ($scope, $rootScope, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, thisSite, Site_Files, thisSitePeaks, allVertDatums, allHWMQualities, allHWMTypes, PEAK, HWM, MEMBER, SITE,INST_COLL_CONDITION) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //global vars
                $scope.peakCount = { total: thisSitePeaks.length };
                $scope.SitePeaks = thisSitePeaks;

                //for this to work, I'd need to bring in HWMs and Data Files(through sensors since that holds event) for this event and filter based on those .. or just add eventid to peak
                $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                    $scope.sessionEventName = newValue !== undefined ? newValue : "All Events";
                    $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
                    if (newValue !== undefined) {
                        $scope.SitePeaks = thisSitePeaks.filter(function (p) { return p.EVENT_NAME == $scope.sessionEventName; });
                        $scope.peakCount = { total: $scope.SitePeaks.length };
                    } else {
                        $scope.SitePeaks = thisSitePeaks;
                        $scope.peakCount = { total: $scope.SitePeaks.length };
                    }
                });

                //create/edit a peak 
                $scope.showPeakModal = function (peakClicked) {
                    $rootScope.stateIsLoading.showLoading = true;// loading..// $(".page-loading").removeClass("hidden"); //loading...
                    var indexClicked = $scope.SitePeaks.indexOf(peakClicked);
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'PEAKmodal.html',
                        controller: 'peakModalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false,
                        windowClass: 'rep-dialog',
                        resolve: {
                            allCollectConditions: function () {
                                return INST_COLL_CONDITION.getAll().$promise;
                            },
                            allVertDatums: function () {
                                return allVertDatums;
                            },
                            thisPeak: function () {
                                if (peakClicked !== 0) {
                                    return PEAK.query({ id: peakClicked.PEAK_SUMMARY_ID }).$promise;
                                } else { return "empty"; }
                            },
                            thisPeakDFs: function () {
                                if (peakClicked !== 0){
                                    return PEAK.getPeakSummaryDFs({id: peakClicked.PEAK_SUMMARY_ID}).$promise;
                                }
                            },
                            peakSite: function () {
                                return thisSite;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return MEMBER.getAll().$promise;
                            },
                            allEventHWMs: function () {
                                return HWM.getFilteredHWMs({ Event: $cookies.get('SessionEventID'), EventStatus: 0 }).$promise;
                            },
                            allSiteFiles: function() {
                                return Site_Files.getAllSiteFiles();
                            },
                            allSiteSensors: function () {
                                return SITE.getSiteSensors({ id: thisSite.SITE_ID }).$promise;
                            }
                        }
                    });

                    modalInstance.result.then(function (createdPeak) {
                        //is there a new Peak,edited peak or just closed modal
                        if (createdPeak[1] == 'created') {
                            $scope.SitePeaks.push(createdPeak[0]);
                            $scope.peakCount.total = $scope.SitePeaks.length;
                        }
                        if (createdPeak[1] == 'updated') {
                            //this is from edit -- refresh page?
                            $scope.SitePeaks[indexClicked] = createdPeak[0];
                        }
                        if (createdPeak[1] == 'deleted') {
                            $scope.SitePeaks.splice(indexClicked, 1);
                            $scope.peakCount.total = $scope.SitePeaks.length;
                        }
                        $rootScope.stateIsLoading.showLoading = false;// loading..
                    });
                }; //end showHWMModal function

            }
        }]);
})();