(function () {
    "use strict";

    var ModalControllers = angular.module('ModalControllers');

    //popup confirm box
    ModalControllers.controller('ConfirmModalCtrl', ['$scope', '$uibModalInstance', 'nameToRemove', 'what', 
        function ($scope, $uibModalInstance, nameToRemove, what) {
            //#region switch (long)
            switch (what) {
                case "Member":
                    $scope.nameToRmv = nameToRemove.FNAME + " " + nameToRemove.LNAME;
                    break;
                case "Event":
                    $scope.nameToRmv = nameToRemove.EVENT_NAME;
                    break;
                case "Agency":
                    $scope.nameToRmv = nameToRemove.AGENCY_NAME;
                    break;
                case "Contact Type":
                    $scope.nameToRmv = nameToRemove.TYPE;
                    break;
                case "Deployment Priority":
                    $scope.nameToRmv = nameToRemove.PRIORITY_NAME;
                    break;
                case "Event Status":
                    $scope.nameToRmv = nameToRemove.STATUS;
                    break;
                case "File Type":
                    $scope.nameToRmv = nameToRemove.FILETYPE;
                    break;
                case "Horizontal Collection Method":
                    $scope.nameToRmv = nameToRemove.HCOLLECT_METHOD;
                    break;
                case "Horizontal Datum":
                    $scope.nameToRmv = nameToRemove.DATUM_NAME;
                    break;
                case "Housing Type":
                    $scope.nameToRmv = nameToRemove.TYPE_NAME;
                    break;
                case "HWM Quality":
                    $scope.nameToRmv = nameToRemove.HWM_QUALITY;
                    break;
                case "HWM Type":
                    $scope.nameToRmv = nameToRemove.HWM_TYPE;
                    break;
                case "Instrument Collection Condition":
                    $scope.nameToRmv = nameToRemove.CONDITION;
                    break;
                case "Marker":
                    $scope.nameToRmv = nameToRemove.MARKER1;
                    break;
                case "Network Name":
                    $scope.nameToRmv = nameToRemove.NAME;
                    break;
                case "Objective Point Quality":
                    $scope.nameToRmv = nameToRemove.QUALITY;
                    break;
                case "Objective Point Type":
                    $scope.nameToRmv = nameToRemove.OP_TYPE;
                    break;
                case "Sensor Brand":
                    $scope.nameToRmv = nameToRemove.BRAND_NAME;
                    break;
                case "Deployment Type":
                    $scope.nameToRmv = nameToRemove.METHOD;
                    break;
                case "Status Type":
                    $scope.nameToRmv = nameToRemove.STATUS;
                    break;
                case "Sensor Type":
                    $scope.nameToRmv = nameToRemove.SENSOR;
                    break;
                case "Network Type":
                    $scope.nameToRmv = nameToRemove.NETWORK_TYPE_NAME;
                    break;
                case "Vertical Collection Method":
                    $scope.nameToRmv = nameToRemove.VCOLLECT_METHOD;
                    break;
                case "Vertical Datum":
                    $scope.nameToRmv = nameToRemove.DATUM_ABBREVIATION;
                    break;
                case "Objective Point":
                    $scope.nameToRmv = nameToRemove.NAME;
                    break;
                case "HWM":
                    var aDate = new Date(nameToRemove.FLAG_DATE);
                    var year = aDate.getFullYear();
                    var month = aDate.getMonth();
                    var day = ('0' + aDate.getDate()).slice(-2);
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    var dateWOtime = monthNames[month] + " " + day + ", " + year;
                
                    $scope.nameToRmv = "Flagged on: " + dateWOtime;
                    break;
                case "Sensor":
                    $scope.nameToRmv = nameToRemove.Deployment_Type;
                    break;
                case "File":
                    var f = nameToRemove.PATH !== undefined || nameToRemove.PATH !== null ? nameToRemove.PATH : nameToRemove.FILE_URL;
                    f = f !== null || f !== undefined ? f : nameToRemove.FILE_ID;
                    $scope.nameToRmv = f;
                    break;
                case "Peak":
                    $scope.nameToRmv = nameToRemove.PEAK_SUMMARY_ID;
                    break;
            }
            //#endregion

            $scope.what = what;

            $scope.ok = function () {
                $uibModalInstance.close(nameToRemove);
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }]);
}());