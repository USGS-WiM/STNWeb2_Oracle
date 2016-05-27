(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');//
    ModalControllers.controller('siteFileModalCtrl', ['$scope', '$cookies', '$http', '$uibModalInstance', '$uibModal', 'SERVER_URL', 'fileTypeList', 'thisFile', 'allMembers', 'fileSource', 'dataFile', 'agencyList', 'fileSite', 'FILE', 'SOURCE', 'DATA_FILE',
        function ($scope, $cookies, $http, $uibModalInstance, $uibModal, SERVER_URL, fileTypeList, thisFile, allMembers, fileSource, dataFile, agencyList, fileSite, FILE, SOURCE, DATA_FILE) {
            //dropdowns
            $scope.serverURL = SERVER_URL;
            $scope.userRole = $cookies.get('usersRole');
            $scope.view = { FILEval: 'detail' };
            $scope.sFileIsUploading = false; //Loading...    
            $scope.fileTypes = fileTypeList;
            $scope.agencies = agencyList;
            $scope.theSite = fileSite;
            $scope.aFile = {}; //holder for file
            $scope.aSource = {}; //holder for file source
            $scope.datafile = {}; //holder for file datafile
            // is interval is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            //#region Datepicker
            $scope.datepickrs = {};
            $scope.dateOptions = {
                startingDay: 1,
                showWeeks: false
            };
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };
            //#endregion

            $scope.updateAgencyForCaption = function () {
                if ($scope.createOReditFile == 'create') {
                    if ($scope.aFile.FILETYPE_ID == 1)
                        $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                } else {
                    if ($scope.fileCopy.FILETYPE_ID == 1)
                        $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.sourceCopy.AGENCY_ID; })[0].AGENCY_NAME;
                }
            };
            //formatting date and time properly for chrome and ff
            var getDateTimeParts = function (d) {
                var y = d.substr(0, 4);
                var m = d.substr(5, 2) - 1; //subtract 1 for index value (January is 0)
                var da = d.substr(8, 2);
                var h = d.substr(11, 2);
                var mi = d.substr(14, 2);
                var sec = d.substr(17, 2);
                var theDate = new Date(y, m, da, h, mi, sec);
                return theDate;
            };
            if (thisFile !== undefined) {
                //edit file
                $scope.createOReditFile = 'edit';
                $scope.whoseFile = thisFile.fileBelongsTo;
                if ($scope.whoseFile == 'Objective Point File') $scope.whoseFile = 'Datum Location File';
                $scope.aFile = thisFile;
                $scope.aFile.fileType = fileTypeList.filter(function (ft) { return ft.FILETYPE_ID == $scope.aFile.FILETYPE_ID; })[0].FILETYPE;
                
                $scope.aFile.FILE_DATE = new Date($scope.aFile.FILE_DATE); //date for validity of form on PUT
                if ($scope.aFile.PHOTO_DATE !== undefined) $scope.aFile.PHOTO_DATE = new Date($scope.aFile.PHOTO_DATE); //date for validity of form on PUT
                if (fileSource !== undefined)  {
                    $scope.aSource = fileSource;
                    $scope.aSource.FULLNAME = $scope.aSource.SOURCE_NAME;
                    $scope.aSource.agencyName = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;                    
                    //add agency name to photo caption
                    $scope.agencyNameForCap = $scope.aSource.agencyName;
                }
                if (dataFile !== undefined) {
                    $scope.ApprovalInfo = {};
                    $scope.datafile = dataFile;
                    $scope.datafile.COLLECT_DATE = new Date($scope.datafile.COLLECT_DATE); //date for validity of form on put
                    $scope.datafile.GOOD_START = getDateTimeParts($scope.datafile.GOOD_START); //date for validity of form on put
                    $scope.datafile.GOOD_END = getDateTimeParts($scope.datafile.GOOD_END); //date for validity of form on put
                    $scope.timeZoneList = ['UTC', 'PST', 'MST', 'CST', 'EST'];
                    if ($scope.datafile.APPROVAL_ID !== undefined && $scope.datafile.APPROVAL_ID !== null && $scope.datafile.APPROVAL_ID >= 1) {
                        DATA_FILE.getDFApproval({ id: $scope.datafile.DATA_FILE_ID }, function success(approvalResponse) {
                            $scope.ApprovalInfo.approvalDate = new Date(approvalResponse.APPROVAL_DATE); //include note that it's displayed in their local time but stored in UTC
                            $scope.ApprovalInfo.Member = allMembers.filter(function (amem) { return amem.MEMBER_ID == approvalResponse.MEMBER_ID; })[0];
                        }, function error(errorResponse) {
                            toastr.error("Error getting data file approval information");
                        });
                    }
                    var aProcessor = $scope.datafile.PROCESSOR_ID !== null ? allMembers.filter(function (amem) { return amem.MEMBER_ID == $scope.datafile.PROCESSOR_ID; })[0] : {};
                    $scope.processor = aProcessor.FNAME !== undefined ? aProcessor.FNAME + ' ' + aProcessor.LNAME : '';
                }
            } else {
                //create file
                $scope.whoseFile = "Site File";
                $scope.createOReditFile = 'create';
                $scope.aFile.FILE_DATE = new Date();
                $scope.aFile.PHOTO_DATE = new Date();
                $scope.aSource = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];
                $scope.aSource.FULLNAME = $scope.aSource.FNAME + " " + $scope.aSource.LNAME;
                $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
            }

            $scope.cancel = function () {
                $scope.sFileIsUploading = false;
                var sendBack = $scope.aFile;
                $uibModalInstance.close(sendBack);
            };

            //create this new file
            $scope.create = function (valid) {
                if (valid) {//only be photo file or other .. no DATA here
                    $scope.sFileIsUploading = true;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    //post source first to get SOURCE_ID
                    var theSource = { SOURCE_NAME: $scope.aSource.FULLNAME, AGENCY_ID: $scope.aSource.AGENCY_ID};
                    //now POST SOURCE, 
                    SOURCE.save(theSource).$promise.then(function (response) {
                        if ($scope.aFile.FILETYPE_ID !== 8) {
                            //then POST fileParts (Services populate PATH)
                            var fileParts = {
                                FileEntity: {
                                    FILETYPE_ID: $scope.aFile.FILETYPE_ID,
                                    FILE_URL: $scope.aFile.FILE_URL,
                                    FILE_DATE: $scope.aFile.FILE_DATE,
                                    PHOTO_DATE: $scope.aFile.PHOTO_DATE,
                                    DESCRIPTION: $scope.aFile.DESCRIPTION,
                                    SITE_ID: $scope.theSite.SITE_ID,
                                    SOURCE_ID: response.SOURCE_ID,
                                    PHOTO_DIRECTION: $scope.aFile.PHOTO_DIRECTION
                                },
                                File: $scope.aFile.File
                            };
                            //need to put the fileParts into correct format for post
                            var fd = new FormData();
                            fd.append("FileEntity", JSON.stringify(fileParts.FileEntity));
                            fd.append("File", fileParts.File);
                            //now POST it (fileparts)
                            FILE.uploadFile(fd).$promise.then(function (fresponse) {
                                toastr.success("File Uploaded");
                                fresponse.fileBelongsTo = "Site File";
                                var state = 'created';
                                //send the file back to be added to the scope list
                                var sendBack = [fresponse, state];
                                $scope.sFileIsUploading = false;
                                $uibModalInstance.close(sendBack);
                            }, function (errorResponse) {
                                $scope.sFileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        } else {
                            //this is a link
                            $scope.aFile.SITE_ID = $scope.theSite.SITE_ID; $scope.aFile.SOURCE_ID = response.SOURCE_ID;
                            FILE.save($scope.aFile).$promise.then(function (fresponse) {
                                toastr.success("File Uploaded");
                                fresponse.fileBelongsTo = "Site File";
                                var state = 'created';
                                //send the file back to be added to the scope list
                                var sendBack = [fresponse, state];
                                $scope.sFileIsUploading = false;
                                $uibModalInstance.close(sendBack);
                            }, function (errorResponse) {
                                $scope.sFileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }//end save link file
                    }, function (errorResponse) {
                        $scope.sFileIsUploading = false;
                        toastr.error("Error saving Source info: " + errorResponse.statusText);
                    });//end source.save()
                }//end valid
            };//end create()

            //update this file
            $scope.save = function (valid) {
                if (valid) {
                    $scope.sFileIsUploading = true;
                    //only photo or other file type (no data file here)
                    //put source or datafile, put file
                    var whatkind = $scope.aFile.fileBelongsTo;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    if ($scope.sourceCopy.SOURCE_ID !== undefined) {
                        $scope.sourceCopy.SOURCE_NAME = $scope.sourceCopy.FULLNAME;
                        SOURCE.update({ id: $scope.sourceCopy.SOURCE_ID }, $scope.sourceCopy).$promise.then(function (sResponse) {
                            $scope.aSource = sResponse;
                            $scope.aSource.FULLNAME = $scope.aSource.SOURCE_NAME;
                            $scope.aSource.agencyName = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                            FILE.update({ id: $scope.fileCopy.FILE_ID }, $scope.fileCopy).$promise.then(function (fileResponse) {
                                toastr.success("File Updated");
                                fileResponse.fileBelongsTo = whatkind;
                                $scope.aFile = fileResponse;
                                $scope.aFile.fileType = fileTypeList.filter(function (ft) { return ft.FILETYPE_ID == $scope.aFile.FILETYPE_ID; })[0].FILETYPE;
                                $scope.aFile.FILE_DATE = new Date($scope.aFile.FILE_DATE); //date for validity of form on PUT
                                if ($scope.aFile.PHOTO_DATE !== undefined) $scope.aFile.PHOTO_DATE = new Date($scope.aFile.PHOTO_DATE); //date for validity of form on PUT
                                $scope.fileCopy = {}; $scope.sourceCopy = {};
                                $scope.view.FILEval = 'detail';
                                $scope.sFileIsUploading = false;                                                                
                            }, function (errorResponse) {
                                $scope.sFileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }, function (errorResponse) {
                            $scope.sFileIsUploading = false; //Loading...
                            toastr.error("Error saving source: " + errorResponse.statusText);
                        });
                    } else {
                        //data file
                        //check timezone and make sure date stays utc
                        if ($scope.dfCopy.TIME_ZONE != "UTC") {
                            //convert it
                            var utcStartDateTime = new Date($scope.dfCopy.GOOD_START).toUTCString();
                            var utcEndDateTime = new Date($scope.dfCopy.GOOD_END).toUTCString();
                            $scope.dfCopy.GOOD_START = utcStartDateTime;
                            $scope.dfCopy.GOOD_END = utcEndDateTime;
                            $scope.dfCopy.TIME_ZONE = 'UTC';
                        } else {
                            //make sure 'GMT' is tacked on so it doesn't try to add hrs to make the already utc a utc in db
                            var si = $scope.dfCopy.GOOD_START.toString().indexOf('GMT') + 3;
                            var ei = $scope.dfCopy.GOOD_END.toString().indexOf('GMT') + 3;
                            $scope.dfCopy.GOOD_START = $scope.dfCopy.GOOD_START.toString().substring(0, si);
                            $scope.dfCopy.GOOD_END = $scope.dfCopy.GOOD_END.toString().substring(0, ei);
                        }

                        DATA_FILE.update({ id: $scope.dfCopy.DATA_FILE_ID }, $scope.dfCopy).$promise.then(function (dfResponse) {
                            $scope.datafile = dfResponse;
                            $scope.datafile.COLLECT_DATE = new Date($scope.datafile.COLLECT_DATE); //date for validity of form on put
                            $scope.datafile.GOOD_START = getDateTimeParts($scope.datafile.GOOD_START); //date for validity of form on put
                            $scope.datafile.GOOD_END = getDateTimeParts($scope.datafile.GOOD_END); //date for validity of form on put
                            var aProcessor = $scope.datafile.PROCESSOR_ID !== null ? allMembers.filter(function (amem) { return amem.MEMBER_ID == $scope.datafile.PROCESSOR_ID; })[0] : {};
                            $scope.processor = aProcessor.FNAME !== undefined ? aProcessor.FNAME + ' ' + aProcessor.LNAME : '';
                            FILE.update({ id: $scope.fileCopy.FILE_ID }, $scope.fileCopy).$promise.then(function (fileResponse) {
                                toastr.success("File Updated");
                                fileResponse.fileBelongsTo = whatkind;
                                $scope.aFile = fileResponse;
                                $scope.aFile.fileType = fileTypeList.filter(function (ft) { return ft.FILETYPE_ID == $scope.aFile.FILETYPE_ID; })[0].FILETYPE;
                                $scope.aFile.FILE_DATE = new Date($scope.aFile.FILE_DATE); //date for validity of form on PUT
                                if ($scope.aFile.PHOTO_DATE !== undefined) $scope.aFile.PHOTO_DATE = new Date($scope.aFile.PHOTO_DATE); //date for validity of form on PUT
                                $scope.fileCopy = {}; $scope.dfCopy = {};
                                $scope.view.FILEval = 'detail';
                                $scope.sFileIsUploading = false;
                            }, function (errorResponse) {
                                $scope.sFileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }, function (errorResponse) {
                            $scope.sFileIsUploading = false; //Loading...
                            toastr.error("Error saving data file: " + errorResponse.statusText);
                        });
                    } //end else (datafile)
                }//end valid
            };//end save()

            //delete this file
            $scope.deleteFile = function () {
                var DeleteModalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return $scope.aFile;
                        },
                        what: function () {
                            return "File";
                        }
                    }
                });

                DeleteModalInstance.result.then(function (fileToRemove) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    FILE.delete({ id: fileToRemove.FILE_ID }).$promise.then(function () {
                        toastr.success("File Removed");
                        var sendBack = ["de", 'deleted'];
                        $uibModalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                });//end DeleteModal.result.then
            };//end delete()

            //edit button clicked. make copy of hwm 
            $scope.wannaEditFILE = function () {
                $scope.view.FILEval = 'edit';
                $scope.fileCopy = angular.copy($scope.aFile);
                $scope.dfCopy = angular.copy($scope.datafile);
                $scope.sourceCopy = angular.copy($scope.aSource);
            };
            $scope.cancelFILEEdit = function () {
                $scope.view.FILEval = 'detail';
                $scope.fileCopy = {};
                $scope.dfCopy = {};
                $scope.sourceCopy = {};
            };
            //approve this datafile (if admin or manager)
            $scope.approveDF = function () {
                //this is valid, show modal to confirm they want to approve it
                var thisDF = $scope.datafile;
                var approveModal = $uibModal.open({
                    template: "<div class='modal-header'><h3 class='modal-title'>Approve Data File</h3></div>" +
                        "<div class='modal-body'><p>Are you ready to approve this Data File?</p></div>" +
                        "<div class='modal-footer'><button class='btn btn-primary' ng-click='approveIt()'>Approve</button><button class='btn btn-warning' ng-click='cancel()'>Cancel</button></div>",
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.approveIt = function () {
                            //delete the site and all things 
                            $uibModalInstance.close(thisDF);
                        };
                    }],
                    size: 'sm'
                });
                approveModal.result.then(function (df) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    DATA_FILE.approveDF({ id: df.DATA_FILE_ID }).$promise.then(function (approvalResponse) {
                        df.APPROVAL_ID = approvalResponse.APPROVAL_ID;
                        $scope.datafile = df;
                        toastr.success("Data File Approved");
                        $scope.ApprovalInfo.approvalDate = new Date(approvalResponse.APPROVAL_DATE); //include note that it's displayed in their local time but stored in UTC
                        $scope.ApprovalInfo.Member = allMembers.filter(function (amem) { return amem.MEMBER_ID == approvalResponse.MEMBER_ID; })[0];
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            
            //approve this hwm (if admin or manager)
            $scope.unApproveDF = function () {
                //this is valid, show modal to confirm they want to approve it
                var thisDF = $scope.datafile;
                var unapproveModal = $uibModal.open({
                    template: "<div class='modal-header'><h3 class='modal-title'>Remove Approval</h3></div>" +
                        "<div class='modal-body'><p>Are you sure you wan to unapprove this Data File?</p></div>" +
                        "<div class='modal-footer'><button class='btn btn-primary' ng-click='unApproveIt()'>Unapprove</button><button class='btn btn-warning' ng-click='cancel()'>Cancel</button></div>",
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.unApproveIt = function () {
                            //delete the site and all things 
                            $uibModalInstance.close(thisDF);
                        };
                    }],
                    size: 'sm'
                });
                unapproveModal.result.then(function (df) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    DATA_FILE.unApproveDF({ id: df.DATA_FILE_ID }).$promise.then(function () {
                        df.APPROVAL_ID = null;
                        $scope.datafile = df;
                        toastr.success("Data File Unapproved");
                        $scope.ApprovalInfo = {};
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
        }]);//end fileModalCtrl

})();