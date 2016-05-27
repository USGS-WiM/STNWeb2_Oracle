(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
    ModalControllers.controller('ProjAlertModalCtrl', ['$scope', '$uibModalInstance', 'ProjAlert', 
        function ($scope, $uibModalInstance, ProjAlert) {
            $scope.ProjAlertParts = ProjAlert;
            $scope.ok = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);

})();