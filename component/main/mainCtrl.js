(function () {
    'use strict';

    var STNControllers = angular.module('STNControllers'); 
    STNControllers.controller('mainCtrl', ['$scope', '$rootScope', '$cookies', '$uibModal', '$location', '$state',
        function ($scope, $rootScope, $cookies, $uibModal, $location, $state) {
            $rootScope.isAuth = {};        
            $rootScope.activeMenu = 'home'; //scope var for setting active class
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $rootScope.isAuth.val = false;
                $location.path('/login');
            } else {
                $rootScope.isAuth.val = true;
                $rootScope.usersName = $cookies.get('usersName');
                $rootScope.userID = $cookies.get('mID');
                var EventName = $cookies.get('SessionEventName');
                if (EventName !== null && EventName !== undefined)
                    $rootScope.sessionEvent = "Session Event: " + EventName + ".";                
                
                $state.go('map');
            }
        }]);
})();