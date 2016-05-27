(function () {
    'use strict';

    var SettingsControllers = angular.module('SettingsControllers');

    SettingsControllers.controller('memberInfoCtrl', ['$scope', '$cookies', '$location', '$http', '$uibModal', '$stateParams', '$filter', '$sce', 'allRoles', 'MEMBER', 'thisMember', 
        function ($scope, $cookies, $location, $http, $uibModal, $stateParams, $filter, $sce, allRoles, MEMBER, thisMember) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //all things both new and existing member page will need
                $scope.aMember = {}; //holder for member (either coming in for edit, or being created for post
                $scope.matchingUsers = true;
                $scope.usernameTooltip = $sce.trustAsHtml('Active Directory user ID. ie: \'mpeppler\' not \'mpeppler@usgs.gov\'.');
                //#region DELETE Member click
                $scope.DeleteMember = function (mem) {
                    //modal
                    var modalInstance = $uibModal.open({
                        templateUrl: 'removemodal.html',
                        controller: 'ConfirmModalCtrl',
                        size: 'sm',
                        resolve: {
                            nameToRemove: function () {
                                return mem;
                            },
                            what: function () {
                                return "Member";
                            }
                        }
                    });
                    modalInstance.result.then(function (nameToRemove) {
                        //yes, remove this keyword
                        var test;
                        //DELETE it
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');

                        MEMBER.deleteMember({ id: nameToRemove.MEMBER_ID }, function success(response) {
                            var delMem = {};
                            delMem.MEMBER_ID = nameToRemove.MEMBER_ID;
                            delMem.Name = nameToRemove.FNAME + " " + nameToRemove.LNAME;
                            var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == nameToRemove.AGENCY_ID; })[0];
                            var ro = allRoles.filter(function (r) { return r.ROLE_ID == nameToRemove.ROLE_ID; })[0];
                            delMem.Agency = ag.AGENCY_NAME;
                            delMem.Role = ro.ROLE_NAME;
                            $scope.memberList.splice($scope.memberList.indexOf(delMem), 1);
                            toastr.success("Member Deleted");
                        }, function error(errorResponse) {
                            toastr.error("Error: " + errorResponse.statusText);
                        }).$promise.then(function () {
                            $location.path('/Members/MembersList').replace();
                        });
                    });
                    //end modal
                };
                //#endregion DELETE Member click

                $scope.pass = {
                    newP: '',
                    confirmP: ''
                };
                $scope.newPass = "";

                //is this creating new member or editing existing?
                if (thisMember !== undefined) {

                    //check to see if the acct User is the same as the user they are looking at
                    $scope.matchingUsers = $stateParams.id == $scope.loggedInUser.ID ? true : false;

                    $scope.aMember = thisMember;
                    $scope.aMember.Role = allRoles.filter(function (r) { return r.ROLE_ID == $scope.aMember.ROLE_ID; })[0].ROLE_NAME;
                    $scope.changePass = false;

                    //change to the user made, put it .. fired on each blur after change made to field
                    $scope.SaveOnBlur = function (v) {
                        if (v) {
                            //ensure they don't delete required field values                        
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            MEMBER.update({ id: $scope.aMember.MEMBER_ID }, $scope.aMember, function success(response) {
                                toastr.success("Member Updated");
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });                        
                        } else {
                            var errorModal = $uibModal.open({
                                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                    '<div class="modal-body"><p>Please populate all required fields.</p></div>' +
                                    '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                                controller:['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                                    $scope.ok = function () {
                                        $uibModalInstance.close();
                                    };
                                }],
                                size: 'sm'
                            });                        
                        }
                    };//end SaveOnBlur

                    //password update section
                    $scope.changeMyPassBtn = function (evt) {
                        $scope.changePass === false ? $scope.changePass = true : $scope.changePass = false;
                    };

                    $scope.ChangePassword = function () {
                        //change User's password
                        if ($scope.pass.newP === "" || $scope.pass.confirmP === "") {
                            var errorModal = $uibModal.open({
                                template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                    '<div class="modal-body"><p>You must first enter a new password.</p></div>' +
                                    '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                                controller:['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                                    $scope.ok = function () {
                                        $uibModalInstance.close();
                                    };
                                }],
                                size: 'sm'
                            });                        
                        } else {
                            MEMBER.changePW({ username: $scope.aMember.USERNAME, newPass: $scope.pass.newP },
                                function success(response) {
                                    toastr.success("Password Updated");
                                    //update creds ONLY IF user logged in is == this updating member
                                    if ($scope.aMember.MEMBER_ID == $scope.loggedInUser.MEMBER_ID) {
                                        var enc = btoa($scope.aMember.USERNAME.concat(":", $scope.pass.newP));
                                        $cookies.put('STNCreds', enc);
                                        $cookies.put('STNUsername', $scope.aMember.USERNAME);
                                        $cookies.put('usersName', $scope.loggedInUser.Name);
                                        $cookies.put('mID', $scope.aMember.MEMBER_ID);
                                        var roleName;
                                        switch ($scope.aMember.ROLE_ID) {
                                            case 1:
                                                roleName = "Admin";
                                                break;
                                            case 2:
                                                roleName = "Manager";
                                                break;
                                            case 3:
                                                roleName = "Field";
                                                break;
                                            case 4:
                                                roleName = "Public";
                                                break;
                                            default:
                                                roleName = "CitizenManager";
                                                break;
                                        }
                                        $cookies.put('usersRole', roleName);
                                    }
                                    $scope.changePass = false;
                                    $scope.pass.newP = '';
                                    $scope.pass.confirmP = '';
                                },
                                function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }
                            );
                        }
                    }; //end ChangePassword()

                    $scope.DontChangePass = function () {
                        //nevermind,  clear input
                        $scope.changePass = false;
                    };
                } //end of $stateParams > 0 (existing)
                else {
                    //this is a new member being created
                    $scope.save = function (valid) {
                        if (valid) {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common.Accept = 'application/json';

                            MEMBER.addMember({ pass: $scope.pass.confirmP }, $scope.aMember, function success(response) {
                                toastr.success("Member Created");
                                //push this new member into the memberList
                                var nm = {};
                                nm.MEMBER_ID = response.MEMBER_ID;
                                nm.Name = response.FNAME + " " + response.LNAME;
                                var ag = $scope.agencyList.filter(function (a) { return a.AGENCY_ID == response.AGENCY_ID; })[0];
                                var ro = allRoles.filter(function (r) { return r.ROLE_ID == response.ROLE_ID; })[0];
                                nm.Agency = ag.AGENCY_NAME;
                                nm.Role = ro.ROLE_NAME;
                                $scope.memberList.push(nm);
                            }).$promise.then(function () {
                                $location.path('/Members/MembersList').replace();
                            });

                        }
                    }; // end save()
                }
            }
        }]);
}());