(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
//popup confirm box
    ModalControllers.controller('confirmReportModalCtrl', ['$scope', '$uibModalInstance', 
        function ($scope, $uibModalInstance) {

            $scope.ok = function () {
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);

})();