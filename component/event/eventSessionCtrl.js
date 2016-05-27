(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('eventSessionCtrl', ['$scope', '$rootScope', '$cookies', '$uibModal', '$location', '$state', 'EVENT', 'EVENT_TYPE', 'STATE',
        function ($scope, $rootScope, $cookies, $uibModal, $location, $state, EVENT, EVENT_TYPE, STATE) {
            $scope.openEventModal = function () {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'ChooseEvent.html',
                    controller: 'eventSessionModalCtrl',
                    size: 'md',
                    backdrop: 'static',
                    keyboard: false,
                    windowClass: 'rep-dialog',
                    resolve: {
                        allEvents: function () {
                            return EVENT.getAll().$promise;
                        },
                        allEventTypes: function () {
                            return EVENT_TYPE.getAll().$promise;
                        },
                        allStates: function () {
                            return STATE.getAll().$promise;
                        }
                    }
                });
                modalInstance.result.then(function (r) {
                    //nothing to do here
                });
            };

        }]);
})();