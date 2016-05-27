//(function () {
//    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
//    'use strict';

//    var STNControllers = angular.module('STNControllers');

//    STNControllers.controller('homeCtrl', ['$scope', '$state', '$rootScope', '$location', '$cookies', '$http', 'SITE',
//        function ($scope, $state, $rootScope, $location, $cookies, $http, SITE) {
//            //if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
//            //    $scope.auth = false;
//            //    $location.path('/login');
//            //} else {
//                //good to go
//                //$rootScope.thisPage = "Home";
                
//                //$scope.message = "Many of the supplemental GIS data layers found in the map tab are from a range of sources and are not maintained by WiM. We offer" +
//                //    "these map layers as a  decision-support supplement to the main STN sites layer, but we cannot guarantee their performance and availability." +
//                //    "Many of these externally maintained layers are large datasets and may load slowly depending on network" +
//                //    "conditions, and in some cases may fail to load when bandwidth is low.";

//                //$rootScope.searchTerm = { searchBy: 'bySiteNo' };
//                //$rootScope.IndexSearchSites = function () {
//                //    switch ($scope.searchTerm.searchBy) {
//                //        case 'bySiteNo':
//                //            SITE.query({ bySiteNo: $scope.searchTerm.term }, function success(resp) {
//                //                siteSearchResponse(resp);
//                //            }, function error(errorResponse) {
//                //                siteSearchResponse(errorResponse);
//                //            }).$promise;
//                //            break;
//                //        case 'bySiteId':
//                //            SITE.query({ bySiteId: $scope.searchTerm.term }).$promise.then(function (resp) {
//                //                siteSearchResponse(resp);
//                //            }), function (errorResponse) {
//                //                siteSearchResponse(errorResponse);
//                //            };
//                //            break;
//                //        case 'bySiteName':
//                //            SITE.query({ bySiteName: $scope.searchTerm.term }).$promise.then(function (resp) {
//                //                siteSearchResponse(resp);
//                //            }), function (errorResponse) {
//                //                siteSearchResponse(errorResponse);
//                //            };
//                //            break;
//                //    }
//                //};
//                //var siteSearchResponse = function (s) {
//                //    if (s.status !== undefined) {
//                //        //errorstatus show modal with error message 'no site found'
//                //        var errorModal = $uibModal.open({
//                //            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
//                //                '<div class="modal-body"><p>No site found. For more site search options, go to the Site Search navigation tab to search for site.</p></div>' +
//                //                '<div class="modal-footer"><button class="btn btn-primary" ng-click="ok()">OK</button></div>',
//                //            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
//                //                $scope.ok = function () {
//                //                    $uibModalInstance.close();
//                //                };
//                //            }],
//                //            size: 'sm'

//                //        });
//                //        errorModal.result.then(function () {
//                //            $rootScope.searchTerm = { searchBy: 'bySiteNo' };
//                //        });

//                //    } else {
//                //        //reset search and go to the site dash
//                //        $rootScope.searchTerm = { searchBy: 'bySiteNo' };
//                //        $state.go('site.dashboard', { id: s.SITE_ID });
//                //    }
//                //};

//            //}//end good to go
//        }]);

//})();