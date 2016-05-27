(function () {
    'use strict';

    var SettingsControllers = angular.module('SettingsControllers');
    
    SettingsControllers.controller('eventInfoCtrl', ['$scope', '$cookies', '$location', '$http', '$uibModal', '$filter', 'EVENT', 'thisEvent',
        function ($scope, $cookies, $location, $http, $uibModal, $filter, EVENT, thisEvent) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //all things both new and existing events page will need

                //#region Datepicker
                $scope.datepickrs = {};
                $scope.open = function ($event, which) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.datepickrs[which] = true;
                };
                //$scope.format = 'MMM dd, yyyy';
                //#endregion Datepicker

                $scope.anEvent = {};

                //#region DELETE Event click
                $scope.DeleteEvent = function (ev) {
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            nameToRemove: function () {
                                return ev;
                            },
                            what: function () {
                                return "Event";
                            }
                        }
                    });
                    modalInstance.result.then(function (nameToRemove) {
                        //yes, remove this keyword
                        var test;
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');

                        EVENT.delete({ id: nameToRemove.EVENT_ID }, function success(response) {
                            var delEv = {};
                            delEv.EVENT_ID = nameToRemove.EVENT_ID;
                            delEv.Name = nameToRemove.EVENT_NAME;
                            delEv.Type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == nameToRemove.EVENT_TYPE_ID; })[0].TYPE;
                            delEv.Status = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == nameToRemove.EVENT_STATUS_ID; })[0].STATUS;
                            var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == nameToRemove.EVENT_COORDINATOR; })[0];
                            delEv.StartDate = nameToRemove.EVENT_START_DATE;
                            delEv.EndDate = nameToRemove.EVENT_END_DATE;
                            delEv.Coord = coord !== undefined ? coord.FNAME + " " + coord.LNAME : "";
                            var index = 0;
                            for (var i = 0; i < $scope.eventList.length; i++) {
                                if ($scope.eventList[i].EVENT_ID == delEv.EVENT_ID) {
                                    index = i;
                                    i = $scope.eventList.length;
                                }
                            }
                            $scope.eventList.splice(index, 1);
                            toastr.success("Event Deleted");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        }).$promise.then(function () {
                            $location.path('/Events/EventsList').replace();
                        });
                    });
                    //end modal
                };
                //#endregion DELETE Event click

                //called a few times to format just the date (no time)
                var makeAdate = function (d) {
                    var aDate = new Date();
                    if (d !== undefined) {
                        //provided date
                        aDate = new Date(d);
                    }

                    var year = aDate.getFullYear();
                    var month = aDate.getMonth();
                    var day = ('0' + aDate.getDate()).slice(-2);
                    var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                    var dateWOtime = new Date(monthNames[month] + " " + day + ", " + year);
                    return dateWOtime;
                }; //end makeAdate()

                if (thisEvent !== undefined) {
                    $scope.anEvent = thisEvent;
                    $scope.anEvent.EVENT_START_DATE = makeAdate($scope.anEvent.EVENT_START_DATE); $scope.anEvent.EVENT_END_DATE = makeAdate($scope.anEvent.EVENT_END_DATE);
                    $scope.thisEventType = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == thisEvent.EVENT_TYPE_ID; })[0].TYPE;
                    $scope.thisEventStatus = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == thisEvent.EVENT_STATUS_ID; })[0].STATUS;
                    var EC = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == thisEvent.EVENT_COORDINATOR; })[0];
                    $scope.thisEventCoord = EC !== undefined ? EC.FNAME + " " + EC.LNAME : "";

                }//end if thisEvent != null
                else {
                    //this is a new event being created
                    $scope.anEvent.EVENT_START_DATE = makeAdate();
                    $scope.anEvent.EVENT_END_DATE = makeAdate();

                }//end -new event

                //change to the user made, put it .. fired on each blur after change made to field
                $scope.SaveOnBlur = function (v) {
                    if (v) {
                        //ensure they don't delete required field values                    
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        EVENT.update({ id: $scope.anEvent.EVENT_ID }, $scope.anEvent, function success(response) {
                            toastr.success("Event Updated");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        });
                    } else {
                        var errorModal = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                '<div class="modal-body"><p>Please populate all required fields.</p></div>' +
                                '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.close();
                                };
                            }],
                            size: 'sm'
                        });
                        //errorModal.result.then(function () {

                        //});

                    }
                };//end SaveOnBlur

                $scope.save = function (valid) {
                    if (valid) {
                        EVENT.save($scope.anEvent, function success(response) {
                            toastr.success("Event Created");
                            //push this new event into the eventList
                            var E = {};
                            E.EVENT_ID = response.EVENT_ID;
                            E.Name = response.EVENT_NAME;
                            E.Type = $scope.eventTypeList.filter(function (a) { return a.EVENT_TYPE_ID == response.EVENT_TYPE_ID; })[0].TYPE;
                            E.Status = $scope.eventStatList.filter(function (r) { return r.EVENT_STATUS_ID == response.EVENT_STATUS_ID; })[0].STATUS;
                            var coord = $scope.eventCoordList.filter(function (c) { return c.MEMBER_ID == response.EVENT_COORDINATOR; })[0];
                            E.StartDate = response.EVENT_START_DATE;
                            E.EndDate = response.EVENT_END_DATE;
                            E.Coord = coord !== undefined ? coord.FNAME + " " + coord.LNAME : "";
                            $scope.eventList.push(E);
                        }).$promise.then(function () {
                            $location.path('/Events/EventsList').replace();
                        });

                    }
                };//end $scope.save()
            }//end else (checkCreds())
        }]);
    
}());