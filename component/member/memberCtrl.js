(function () {
    'use strict';

    var SettingsControllers = angular.module('SettingsControllers');

    SettingsControllers.controller('memberCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$filter', 'MEMBER', 'allRoles', 'allAgencies', 
        function ($scope, $rootScope, $cookies, $location, $http, $filter, MEMBER, allRoles, allAgencies) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //all things both new and existing member page will need
                $rootScope.thisPage = "Settings/Members";
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

                $scope.loggedInUser = {};
                $scope.loggedInUser.Name = $cookies.get('usersName'); //User's NAME
                $scope.loggedInUser.ID = $cookies.get('mID');
                $scope.loggedInUser.Role = $cookies.get('usersRole');

                switch ($scope.loggedInUser.Role) {
                    case 'Admin':
                        $scope.roleList = allRoles.filter(function (r) { return r.ROLE_ID <= 3; });
                        break;
                    case 'Manager':
                        $scope.roleList = allRoles.filter(function (r) { return r.ROLE_ID == 3; });
                        break;
                }
//                $scope.roleList = allRoles;
                $scope.agencyList = allAgencies;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                MEMBER.getAll().$promise.then(function (response) {
                    $scope.memberList = [];
                    for (var x = 0; x < response.length; x++) {
                        var M = {};
                        M.MEMBER_ID = response[x].MEMBER_ID;
                        M.Name = response[x].FNAME + " " + response[x].LNAME;
                        var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == response[x].AGENCY_ID; })[0];
                        var ro = allRoles.filter(function (r) { return r.ROLE_ID == response[x].ROLE_ID; })[0];
                        M.Agency = ag.AGENCY_NAME;
                        M.Role = ro.ROLE_NAME;

                        $scope.memberList.push(M);
                    }
                });
            }
        }]);
}());