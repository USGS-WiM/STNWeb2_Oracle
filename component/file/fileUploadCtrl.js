//(function () {
//    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
//    'use strict';

//    var STNControllers = angular.module('STNControllers');

//    STNControllers.controller('fileUploadCtrl', ['$scope', '$location', '$cookies', 'Upload', 'multipartForm', 'fileTypeList', 'agencyList',
//        function ($scope, $location, $cookies, Upload, multipartForm, fileTypeList, agencyList) {
//            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
//                $scope.auth = false;
//                $location.path('/login');
//            } else {
//                $scope.loggedInMember = {};
//                $scope.loggedInMember.fullName = $cookies.get('usersName');
//                $scope.loggedInMember.ID = $cookies.get('mID');
//                $scope.map = "Welcome to the new STN File upload Page!!";
//                $scope.allFileTypes = fileTypeList;
//                $scope.allAgencies = agencyList;
//                $scope.fileType = 0;
//                $scope.aFile = {};
//                $scope.toggleCaptionPreview = false;
//                //#region Datepicker
//                $scope.datepickrs = {};

//                $scope.open = function ($event, which) {
//                    $event.preventDefault();
//                    $event.stopPropagation();

//                    $scope.datepickrs[which] = true;
//                };
//                $scope.format = 'MMM dd, yyyy';
//                //#endregion Datepicker

//                $scope.fileTypeChange = function () {
//                    $scope.fileType = $scope.aFile.FILETYPE_ID;
//                };

//                //  lat/long =is number
//                $scope.isNum = function (evt) {
//                    var theEvent = evt || window.event;
//                    var key = theEvent.keyCode || theEvent.which;
//                    if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
//                        theEvent.returnValue = false;
//                        if (theEvent.preventDefault) theEvent.preventDefault();
//                    }
//                };

//                // photo file caption
//                $scope.ShowCaption = function () {
//                    if ($scope.toggleCaptionPreview === true) {
//                        $scope.toggleCaptionPreview = false;
//                        $scope.photoCaption = "";
//                    } else {
//                        $scope.toggleCaptionPreview = true;
//                        $scope.photoCaption = "This is the photo caption.";
//                    }
//                };

//                $scope.zones = [{ name: 'UTC' }, { name: 'PST' }, { name: 'MST' }, { name: 'CST' }, { name: 'EST' }];
//                $scope.elevationStats = {};

//                //submit file / datafile / 
//                $scope.submit = function () {
//                    if ($scope.aFile.File) {
//                        //determine if it's a data file or photo or all other to know which fields and objects to populate /create
//                        //if loggedInMember.fullname != getuserNAME() .. they changed it.. need to create a source
//                        //$scope.aFile -- all parts are here
//                        //post the file.. then if datafile, post the dataFile..then upload to s3
//                        var fileParts = {
//                            FileEntity: {
//                                FILETYPE_ID: $scope.aFile.FILETYPE_ID,
//                                FILE_URL: $scope.aFile.FILE_URL,
//                                PROCESSOR_ID: $scope.loggedInMember.ID,
//                                FILE_DATE: $scope.aFile.FILE_DATE,
//                                DESCRIPTION: $scope.aFile.DESCRIPTION,
//                                HWM_ID: $scope.aFile.HWM_ID !== undefined ? $scope.aFile.HWM_ID : 0,
//                                SITE_ID: $scope.aFile.SITE_ID,
//                                INSTRUMENT_ID: $scope.aFile.INSTRUMENT_ID !== undefined ? $scope.aFile.INSTRUMENT_ID : 0
//                            },
//                            File: $scope.aFile.File
//                        };

//                        //$cookies.STNCreds before post https://www.youtube.com/watch?v=vLHgpOG1cW4
//                        multipartForm.post(fileParts);

//                    }
//                };
//            }
//        }]);

//})();