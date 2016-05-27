(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
    ModalControllers.controller('OPmodalCtrl', ['$scope', '$rootScope', '$cookies', '$http', '$sce', '$uibModalInstance', '$uibModal', 'SERVER_URL', 'Site_Files', 'allDropdowns', 'thisOP', 'thisOPControls', 'opSite', 'agencyList', 'allMembers', 'OBJECTIVE_POINT', 'OP_CONTROL_IDENTIFIER', 'OP_MEASURE', 'SOURCE', 'FILE',
        function ($scope, $rootScope, $cookies, $http, $sce, $uibModalInstance, $uibModal, SERVER_URL, Site_Files, allDropdowns, thisOP, thisOPControls, opSite, agencyList, allMembers, OBJECTIVE_POINT, OP_CONTROL_IDENTIFIER, OP_MEASURE, SOURCE, FILE) {
            //defaults for radio buttons
            //dropdowns
            $scope.serverURL = SERVER_URL;
            $scope.view = { OPval: 'detail' };
            $scope.fileIsUploading = false; //Loading...    
            $scope.dl = { dlOpen: true, dlFileOpen: false };//accordions
            $scope.OPTypeList = allDropdowns[0];
            $scope.HDList = allDropdowns[1];
            $scope.HCollectMethodList = allDropdowns[2];
            $scope.VDatumList = allDropdowns[3];
            $scope.VCollectMethodList = allDropdowns[4];
            $scope.OPQualityList = allDropdowns[5];
            $scope.fileTypeList = allDropdowns[6]; //used if creating/editing OP file            
            $scope.htmlDescriptionTip = $sce.trustAsHtml('Please describe location and type of mark <em>ie. \'chiseled square on third sidewalk block on the south side of the street\'</em>');
            $scope.HWMfileIsUploading = false; //Loading...    
            $scope.OP = {};
            $scope.removeOPCarray = []; //holder if they remove any OP controls
            $scope.thisOPsite = opSite; //this OP's SITE
            $scope.addedIdentifiers = []; //holder for added Identifiers
            $scope.showControlIDinput = false; //initially hide the area containing added control Identifiers
            $scope.DMS = {}; //object for Deg Min Sec values
            $scope.allSFiles = Site_Files.getAllSiteFiles();
            $scope.OPFiles = thisOP !== "empty" ? $scope.allSFiles.filter(function (sf) { return sf.OBJECTIVE_POINT_ID == thisOP.OBJECTIVE_POINT_ID; }) : [];// opFiles; //holder for op files added
            $scope.opImageFiles = $scope.OPFiles.filter(function (opf) { return opf.FILETYPE_ID === 1; }); //image files for carousel
            $scope.showFileForm = false; //hidden form to add file to op
            //make uncertainty cleared and disabled when 'unquantified' is checked
            $scope.UnquantChecked = function () {
                if ($scope.OP.UNQUANTIFIED == 1)
                    $scope.OP.UNCERTAINTY = "";
            };
            
            //#region FILE STUFF
            //show a modal with the larger image as a preview on the photo file for this op
            $scope.showImageModal = function (image) {
                var imageModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Image File Preview</h3></div>' +
                        '<div class="modal-body"><img ng-src="{{setSRC}}" /></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller:['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.imageId = image;
                        $scope.setSRC = SERVER_URL + '/Files/' + $scope.imageId + '/Item';
                    }],
                    size: 'md'
                });
            };

            //want to add or edit file
            $scope.showFile = function (file) {
                $scope.fileTypes = $scope.fileTypeList;
                $scope.agencies = agencyList;
                $scope.existFileIndex = -1; $scope.existIMGFileIndex = -1; $scope.allSFileIndex = -1; //indexes for splice/change
                $scope.aFile = {}; //holder for file
                $scope.aSource = {}; //holder for file source
                //OP will not have datafile     $scope.datafile = {}; //holder for file datafile
                if (file !== 0) {
                    //edit op file
                    $scope.existFileIndex = $scope.OPFiles.indexOf(file); $scope.allSFileIndex = $scope.allSFiles.indexOf(file);
                    $scope.existIMGFileIndex = $scope.opImageFiles.length > 0 ? $scope.opImageFiles.indexOf(file) : -1;
                    $scope.aFile = angular.copy(file);
                    $scope.aFile.FILE_DATE = new Date($scope.aFile.FILE_DATE); //date for validity of form on PUT
                    if ($scope.aFile.PHOTO_DATE !== undefined) $scope.aFile.PHOTO_DATE = new Date($scope.aFile.PHOTO_DATE); //date for validity of form on PUT
                    if (file.SOURCE_ID !== null) {
                        SOURCE.query({ id: file.SOURCE_ID }).$promise.then(function (s) {
                            $scope.aSource = s;
                            $scope.aSource.FULLNAME = $scope.aSource.SOURCE_NAME;
                        });
                    }//end if source
                }//end existing file
                else {
                    $scope.aFile.FILE_DATE = new Date(); $scope.aFile.PHOTO_DATE = new Date();
                    $scope.aSource = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];
                    $scope.aSource.FULLNAME = $scope.aSource.FNAME + " " + $scope.aSource.LNAME;
                } //end new file
                $scope.showFileForm = true;
                //add agency name to photo caption
                if ($scope.aFile.FILETYPE_ID == 1)
                    $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                $scope.updateAgencyForCaption = function () {
                    if ($scope.aFile.FILETYPE_ID == 1)
                        $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                };
            };
            //create this new file
            $scope.createFile = function (valid) {
                if (valid) {
                    $scope.fileIsUploading = true;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    //post source first to get SOURCE_ID
                    if ($scope.aSource.AGENCY_ID !== null) {
                        var theSource = { SOURCE_NAME: $scope.aSource.FULLNAME, AGENCY_ID: $scope.aSource.AGENCY_ID};
                        //now POST SOURCE, 
                        SOURCE.save(theSource).$promise.then(function (response) {
                            //then POST fileParts (Services populate PATH)
                            var fileParts = {
                                FileEntity: {
                                    FILETYPE_ID: $scope.aFile.FILETYPE_ID,
                                    FILE_URL: $scope.aFile.FILE_URL,
                                    FILE_DATE: $scope.aFile.FILE_DATE,
                                    PHOTO_DATE: $scope.aFile.PHOTO_DATE,
                                    DESCRIPTION: $scope.aFile.DESCRIPTION,
                                    SITE_ID: $scope.thisOPsite.SITE_ID,
                                    SOURCE_ID: response.SOURCE_ID,
                                    PHOTO_DIRECTION: $scope.aFile.PHOTO_DIRECTION,
                                    LATITUDE_DD: $scope.aFile.LATITUDE_DD,
                                    LONGITUDE_DD: $scope.aFile.LONGITUDE_DD,
                                    OBJECTIVE_POINT_ID: $scope.OP.OBJECTIVE_POINT_ID
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
                                fresponse.fileBelongsTo = "Objective Point File";
                                $scope.OPFiles.push(fresponse);
                                $scope.allSFiles.push(fresponse);
                                Site_Files.setAllSiteFiles($scope.allSFiles); //updates the file list on the sitedashboard
                                if (fresponse.FILETYPE_ID === 1) $scope.opImageFiles.push(fresponse);
                                $scope.showFileForm = false; $scope.fileIsUploading = false;
                            }, function (errorResponse) {
                                $scope.fileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }, function (errorResponse) {
                            $scope.fileIsUploading = false;
                            toastr.error("Error saving Source info: " + errorResponse.statusText);
                        });//end source.save()
                    }
                }//end valid
            };//end create()

            //update this file
            $scope.saveFile = function (valid) {
                if (valid) {
                    $scope.fileIsUploading = true;
                    //only photo or other file type (no data file here)
                    //put source or datafile, put file
                    var whatkind = $scope.aFile.fileBelongsTo;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    if ($scope.aSource.SOURCE_ID !== undefined) {
                        $scope.aSource.SOURCE_NAME = $scope.aSource.FULLNAME;
                        SOURCE.update({ id: $scope.aSource.SOURCE_ID }, $scope.aSource).$promise.then(function () {
                            FILE.update({ id: $scope.aFile.FILE_ID }, $scope.aFile).$promise.then(function (fileResponse) {
                                toastr.success("File Updated");
                                fileResponse.fileBelongsTo = "Objective Point File";
                                $scope.OPFiles[$scope.existFileIndex] = fileResponse;
                                $scope.allSFiles[$scope.allSFileIndex] = fileResponse;
                                Site_Files.setAllSiteFiles($scope.allSFiles); //updates the file list on the sitedashboard
                                $scope.showFileForm = false; $scope.fileIsUploading = false;
                            }, function (errorResponse) {
                                $scope.fileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }, function (errorResponse) {
                            $scope.fileIsUploading = false; //Loading...
                            toastr.error("Error saving source: " + errorResponse.statusText);
                        });
                    }
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
                        $scope.OPFiles.splice($scope.existFileIndex, 1);
                        $scope.allSFiles.splice($scope.allSFileIndex, 1);
                        $scope.opImageFiles.splice($scope.existIMGFileIndex, 1);
                        Site_Files.setAllSiteFiles($scope.allSFiles); //updates the file list on the sitedashboard
                        $scope.showFileForm = false; 
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                });//end DeleteModal.result.then
            };//end delete()

            $scope.cancelFile = function () {
                $scope.aFile = {};
                $scope.aSource = {};
              //  $scope.datafile = {};
                $scope.showFileForm = false;
            };
            //#endregion FILE STUFF

            //called a few times to format just the date (no time)
            var makeAdate = function (d) {
                var aDate = new Date();
                if (d !== "" && d !== undefined) {
                    //provided date
                    aDate = new Date(d);
                }

                var year = aDate.getFullYear();
                var month = aDate.getMonth();
                var day = ('0' + aDate.getDate()).slice(-2);
                var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var dateWOtime = new Date(monthNames[month] + " " + day + ", " + year);
                return dateWOtime;
            };

            if (thisOP != "empty") {
                $scope.opModalHeader = "Datum Location Information";
                $scope.createOReditOP = 'edit';
                //#region existing OP
                $scope.OP = angular.copy(thisOP); //set a copy so list view doesnt change if they cancel from here after making changes
                //formatted as date for datepicker
                $scope.OP.DATE_ESTABLISHED = makeAdate($scope.OP.DATE_ESTABLISHED);
                //check if VDATUM_ID == 0, if so make undefined
                if ($scope.OP.VDATUM_ID === 0) delete $scope.OP.VDATUM_ID;

                if ($scope.OP.DATE_RECOVERED !== null)
                    $scope.OP.DATE_RECOVERED = makeAdate($scope.OP.DATE_RECOVERED);

                if (thisOPControls.length > 0) {
                    $scope.addedIdentifiers = thisOPControls;
                    $scope.showControlIDinput = true;
                }
                $scope.OP.opType = $scope.OP.OP_TYPE_ID > 0 ? $scope.OPTypeList.filter(function (t) { return t.OBJECTIVE_POINT_TYPE_ID == $scope.OP.OP_TYPE_ID; })[0].OP_TYPE : '';
                $scope.OP.quality = $scope.OP.OP_QUALITY_ID > 0 ? $scope.OPQualityList.filter(function (q) { return q.OP_QUALITY_ID == $scope.OP.OP_QUALITY_ID; })[0].QUALITY : '';
                $scope.OP.hdatum = $scope.OP.HDATUM_ID > 0 ? $scope.HDList.filter(function (hd) { return hd.DATUM_ID == $scope.OP.HDATUM_ID; })[0].DATUM_NAME : '';
                $scope.OP.hCollectMethod = $scope.OP.HCOLLECT_METHOD_ID > 0 ? $scope.HCollectMethodList.filter(function (hc) { return hc.HCOLLECT_METHOD_ID == $scope.OP.HCOLLECT_METHOD_ID; })[0].HCOLLECT_METHOD : '';
                $scope.OP.vDatum = $scope.OP.VDATUM_ID > 0 ? $scope.VDatumList.filter(function (vd) { return vd.DATUM_ID == $scope.OP.VDATUM_ID; })[0].DATUM_NAME : '';
                $scope.OP.vCollectMethod = $scope.OP.VCOLLECT_METHOD_ID > 0 ? $scope.VCollectMethodList.filter(function (vc) { return vc.VCOLLECT_METHOD_ID == $scope.OP.VCOLLECT_METHOD_ID; })[0].VCOLLECT_METHOD : '';

                //#endregion 
            } else {
                $scope.opModalHeader = "Create new Datum Location";
                $scope.createOReditOP = 'create';
                //#region new OP 
                $scope.OP.LATITUDE_DD = opSite.LATITUDE_DD;
                $scope.OP.LONGITUDE_DD = opSite.LONGITUDE_DD;
                $scope.OP.HDATUM_ID = opSite.HDATUM_ID;
                //default today for establised date
                $scope.OP.DATE_ESTABLISHED = makeAdate("");
                //#endregion
            }

            //default radios (has to come after OP is set one way or another)
            $scope.OP.decDegORdms = 'dd';
            $scope.OP.FTorMETER = 'ft';
            $scope.OP.FTorCM = 'ft';

            //want to add identifier
            $scope.addNewIdentifier = function () {
                if ($scope.createOReditOP == 'edit') 
                    $scope.addedIdentifiersCopy.push({ OBJECTIVE_POINT_ID: $scope.OP.OBJECTIVE_POINT_ID, IDENTIFIER: "", IDENTIFIER_TYPE: "" });
                else 
                    $scope.addedIdentifiers.push({ IDENTIFIER: "", IDENTIFIER_TYPE: "" });

                $scope.showControlIDinput = true;
                

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

            //lat/long =is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            //convert deg min sec to dec degrees
            var azimuth = function (deg, min, sec) {
                var azi = 0;
                if (deg < 0) {
                    azi = -1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
                    return (-1.0 * azi).toFixed(5);
                }
                else {
                    azi = 1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
                    return (azi).toFixed(5);
                }
            };

            //convert dec degrees to dms
            var deg_to_dms = function (deg) {
                if (deg < 0) {
                    deg = deg.toString();

                    //longitude, remove the - sign
                    deg = deg.substring(1);
                }
                var d = Math.floor(deg);
                var minfloat = (deg - d) * 60;
                var m = Math.floor(minfloat);
                var s = ((minfloat - m) * 60).toFixed(3);

                return ("" + d + ":" + m + ":" + s);
            };

            //they changed radio button for dms dec deg
            $scope.latLongChange = function () {
                if ($scope.createOReditOP == 'edit') {
                    if ($scope.opCopy.decDegORdms == "dd") {
                        //they clicked Dec Deg..
                        if ($scope.DMS.LADeg !== undefined) {
                            //convert what's here for each lat and long
                            $scope.opCopy.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                            $scope.opCopy.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                            //clear
                            $scope.DMS = {};
                        }
                    } else {
                        //they clicked dms (convert lat/long to dms)
                        if ($scope.opCopy.LATITUDE_DD !== undefined) {
                            var latDMS = (deg_to_dms($scope.opCopy.LATITUDE_DD)).toString();
                            var ladDMSarray = latDMS.split(':');
                            $scope.DMS.LADeg = ladDMSarray[0];
                            $scope.DMS.LAMin = ladDMSarray[1];
                            $scope.DMS.LASec = ladDMSarray[2];

                            var longDMS = deg_to_dms($scope.opCopy.LONGITUDE_DD);
                            var longDMSarray = longDMS.split(':');
                            $scope.DMS.LODeg = longDMSarray[0] * -1;
                            $scope.DMS.LOMin = longDMSarray[1];
                            $scope.DMS.LOSec = longDMSarray[2];
                            //clear
                            $scope.opCopy.LATITUDE_DD = undefined; $scope.opCopy.LONGITUDE_DD = undefined;
                        }
                    }
                } else {
                    if ($scope.OP.decDegORdms == "dd") {
                        //they clicked Dec Deg..
                        if ($scope.DMS.LADeg !== undefined) {
                            //convert what's here for each lat and long
                            $scope.OP.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                            $scope.OP.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                            //clear
                            $scope.DMS = {};
                        }
                    } else {
                        //they clicked dms (convert lat/long to dms)
                        if ($scope.OP.LATITUDE_DD !== undefined) {
                            var create_latDMS = (deg_to_dms($scope.OP.LATITUDE_DD)).toString();
                            var create_ladDMSarray = create_latDMS.split(':');
                            $scope.DMS.LADeg = create_ladDMSarray[0];
                            $scope.DMS.LAMin = create_ladDMSarray[1];
                            $scope.DMS.LASec = create_ladDMSarray[2];

                            var create_longDMS = deg_to_dms($scope.OP.LONGITUDE_DD);
                            var create_longDMSarray = create_longDMS.split(':');
                            $scope.DMS.LODeg = create_longDMSarray[0] * -1;
                            $scope.DMS.LOMin = create_longDMSarray[1];
                            $scope.DMS.LOSec = create_longDMSarray[2];
                            //clear
                            $scope.OP.LATITUDE_DD = undefined; $scope.OP.LONGITUDE_DD = undefined;
                        }
                    }
                }
            };

            //just need an OBJECTIVE_POINT object to post/put
            var trimOP = function (op) {
                var OBJ_PT = {
                    NAME: op.NAME,
                    DESCRIPTION: op.DESCRIPTION,
                    ELEV_FT: op.ELEV_FT !== undefined ? op.ELEV_FT : null,
                    DATE_ESTABLISHED: op.DATE_ESTABLISHED,
                    OP_IS_DESTROYED: op.OP_IS_DESTROYED !== undefined ? op.OP_IS_DESTROYED : 0,
                    OP_NOTES: op.OP_NOTES !== undefined ? op.OP_NOTES : null,
                    SITE_ID: $scope.thisOPsite.SITE_ID,
                    VDATUM_ID: op.VDATUM_ID !== undefined ? op.VDATUM_ID : 0,
                    LATITUDE_DD: op.LATITUDE_DD,
                    LONGITUDE_DD: op.LONGITUDE_DD,
                    HDATUM_ID: op.HDATUM_ID !== undefined ? op.HDATUM_ID : 0,
                    HCOLLECT_METHOD_ID: op.HCOLLECT_METHOD_ID !== undefined ? op.HCOLLECT_METHOD_ID : 0,
                    VCOLLECT_METHOD_ID: op.VCOLLECT_METHOD_ID !== undefined ? op.VCOLLECT_METHOD_ID : 0,
                    OP_TYPE_ID: op.OP_TYPE_ID,
                    DATE_RECOVERED: op.DATE_RECOVERED !== undefined ? op.DATE_RECOVERED : null,
                    UNCERTAINTY: op.UNCERTAINTY !== undefined && op.UNCERTAINTY !== "" ? op.UNCERTAINTY : null,
                    UNQUANTIFIED: op.UNQUANTIFIED !== undefined ? op.UNQUANTIFIED : null,
                    OP_QUALITY_ID: op.OP_QUALITY_ID !== undefined ? op.OP_QUALITY_ID : null,
                };
                return OBJ_PT;
            };

            //cancel modal
            $scope.cancel = function () {
                $uibModalInstance.close();
             //   $uibModalInstance.dismiss('cancel');
            };

            //fix default radios and lat/long
            var formatDefaults = function (theOP) {
                //$scope.OP.FTorMETER needs to be 'ft'. if 'meter' ==convert value to ft 
                if (theOP.FTorMETER == "meter") {
                    $scope.OP.FTorMETER = 'ft';
                    $scope.OP.ELEV_FT = $scope.OP.ELEV_FT * 3.2808;
                }
                //$scope.OP.FTorCM needs to be 'ft'. if 'cm' ==convert value to ft 
                if (theOP.FTorCM == "cm") {
                    $scope.OP.FTorCM = 'ft';
                    $scope.OP.UNCERTAINTY = $scope.OP.UNCERTAINTY / 30.48;
                }
                //$scope.OP.decDegORdms needs to be 'dd'. if 'dms' ==convert $scope.DMS values to dd
                if (theOP.decDegORdms == "dms") {
                    $scope.OP.decDegORdms = 'dd';
                    $scope.OP.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    $scope.OP.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    $scope.DMS = {};
                    $scope.OP.SITE_ID = $scope.thisOPsite.SITE_ID;
                }
            };

            //Create this OP
            $scope.create = function () {
                if (this.OPForm.$valid) {                    
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    var createdOP = {};
                    //post
                    formatDefaults($scope.OP); //$scope.OP.FTorMETER, FTorCM, decDegORdms                               
                    var OPtoPOST = trimOP($scope.OP); //make it an OBJECTIVE_POINT for saving                    

                    OBJECTIVE_POINT.save(OPtoPOST, function success(response) {
                        toastr.success("Datum Location created");
                        createdOP = response;
                        if ($scope.addedIdentifiers.length > 0) {
                            //post each one THIS WILL CHANGE SOON TO HAVE OBJECTIVE_POINT_ID already added and not sent along with it
                            for (var opc = 0; opc < $scope.addedIdentifiers.length; opc++)
                                OBJECTIVE_POINT.createOPControlID({ id: response.OBJECTIVE_POINT_ID }, $scope.addedIdentifiers[opc]).$promise;
                        }
                    }, function error(errorResponse) {
                        toastr.error("Error creating Datum Location: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        var sendBack = [createdOP, 'created'];
                        $uibModalInstance.close(sendBack);
                    });
                }
            }; //end Create

            //X was clicked next to existing Control Identifier to have it removed, store in remove array for Save()
            $scope.RemoveID = function (opControl) {
                //only add to remove list if it's an existing one to DELETE
                if ($scope.addedIdentifiersCopy != undefined) {
		     var i = $scope.addedIdentifiersCopy.indexOf(opControl);
                     if (opControl.OP_CONTROL_IDENTIFIER_ID !== undefined) {
                         $scope.removeOPCarray.push(opControl);
                         $scope.addedIdentifiersCopy.splice(i, 1);
                     } else {
                         $scope.addedIdentifiersCopy.splice(i, 1);
                     }
                } else {
		     //this is a create
                     var i = $scope.addedIdentifiers.indexOf(opControl);
                     $scope.addedIdentifiers.splice(i, 1);
                 }
            };

            //Save this OP
            $scope.save = function (valid) {
                if (valid) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    if ($scope.DMS.LADeg !== undefined) $scope.opCopy.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    if ($scope.DMS.LODeg !== undefined) $scope.opCopy.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    var updatedOP = {};
                    //if there's an OP_CONTROL_IDENTIFIER_ID, PUT .. else POST
                    if ($scope.addedIdentifiersCopy.length > 0) {
                        for (var i = 0; i < $scope.addedIdentifiersCopy.length; i++) {
                            if ($scope.addedIdentifiersCopy[i].OP_CONTROL_IDENTIFIER_ID !== undefined) {
                                //existing: PUTvar ind = $scope.chosenHWMList.map(function (hwm) { return hwm.HWM_ID; }).indexOf(aHWM.HWM_ID); //not working:: $scope.chosenHWMList.indexOf(aHWM);
                                var existIndex = $scope.addedIdentifiers.map(function (i) { return i.OP_CONTROL_IDENTIFIER_ID; }).indexOf($scope.addedIdentifiersCopy[i].OP_CONTROL_IDENTIFIER_ID);
                                OP_CONTROL_IDENTIFIER.update({ id: $scope.addedIdentifiersCopy[i].OP_CONTROL_IDENTIFIER_ID }, $scope.addedIdentifiersCopy[i]).$promise.then(function (response){
                                    $scope.addedIdentifiers[existIndex] = response;
                                });
                            } else {
                                //post each one
                                OBJECTIVE_POINT.createOPControlID({ id: $scope.OP.OBJECTIVE_POINT_ID }, $scope.addedIdentifiersCopy[i]).$promise.then(function (response){
                                    $scope.addedIdentifiers.push(response);
                                });
                            }
                        }//end foreach addedIdentifier
                    }//end if there's addedidentifiers

                    //if there's any in removeOPCarray, DELETE those
                    if ($scope.removeOPCarray.length > 0) {
                        for (var r = 0; r < $scope.removeOPCarray.length; r++) {
                            var deIndex = $scope.addedIdentifiers.map(function (ri) { return ri.OP_CONTROL_IDENTIFIER_ID; }).indexOf($scope.removeOPCarray[r].OP_CONTROL_IDENTIFIER_ID);
                            OP_CONTROL_IDENTIFIER.delete({ id: $scope.removeOPCarray[r].OP_CONTROL_IDENTIFIER_ID }).$promise.then(function () {
                                $scope.addedIdentifiers.splice(deIndex,1);
                            });
                        }//end foreach removeOPCarray
                    }//end if there's removeOPCs

                    //look at OP.FTorMETER ("ft"), OP.FTorCM ("ft"), and OP.decDegORdms ("dd"), make sure site_ID is on there and send it to trim before PUT                
                    formatDefaults($scope.opCopy); //$scope.OP.FTorMETER, FTorCM, decDegORdms
                    var OPtoPOST = trimOP($scope.opCopy);
                    OPtoPOST.OBJECTIVE_POINT_ID = $scope.opCopy.OBJECTIVE_POINT_ID;
                    //$http.defaults.headers.common['X-HTTP-Method-Override'] = 'PUT';
                    OBJECTIVE_POINT.update({ id: OPtoPOST.OBJECTIVE_POINT_ID }, OPtoPOST, function success(response) {
                        toastr.success("Datum Location updated");
                        $scope.OP = response; thisOP = response;
                        $scope.OP.DATE_ESTABLISHED = makeAdate($scope.OP.DATE_ESTABLISHED);
                        if ($scope.OP.DATE_RECOVERED !== null)
                            $scope.OP.DATE_RECOVERED = makeAdate($scope.OP.DATE_RECOVERED);
                        $scope.OP.opType = $scope.OP.OP_TYPE_ID > 0 ? $scope.OPTypeList.filter(function (t) { return t.OBJECTIVE_POINT_TYPE_ID == $scope.OP.OP_TYPE_ID; })[0].OP_TYPE : '';
                        $scope.OP.quality = $scope.OP.OP_QUALITY_ID > 0 ? $scope.OPQualityList.filter(function (q) { return q.OP_QUALITY_ID == $scope.OP.OP_QUALITY_ID; })[0].QUALITY : '';
                        $scope.OP.hdatum = $scope.OP.HDATUM_ID > 0 ? $scope.HDList.filter(function (hd) { return hd.DATUM_ID == $scope.OP.HDATUM_ID; })[0].DATUM_NAME : '';
                        $scope.OP.hCollectMethod = $scope.OP.HCOLLECT_METHOD_ID > 0 ? $scope.HCollectMethodList.filter(function (hc) { return hc.HCOLLECT_METHOD_ID == $scope.OP.HCOLLECT_METHOD_ID; })[0].HCOLLECT_METHOD : '';
                        $scope.OP.vDatum = $scope.OP.VDATUM_ID > 0 ? $scope.VDatumList.filter(function (vd) { return vd.DATUM_ID == $scope.OP.VDATUM_ID; })[0].DATUM_NAME : '';
                        $scope.OP.vCollectMethod = $scope.OP.VCOLLECT_METHOD_ID > 0 ? $scope.VCollectMethodList.filter(function (vc) { return vc.VCOLLECT_METHOD_ID == $scope.OP.VCOLLECT_METHOD_ID; })[0].VCOLLECT_METHOD : '';
                        $scope.opCopy = {};
                        $scope.addedIdentifiersCopy = []; $scope.view.OPval = 'detail';
                        //    delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                    }, function error(errorResponse) {
                        toastr.error("Error updating Datum Location: " + errorResponse.statusText);
                    }).$promise;
                }//end valid
            }; //end Save

            //delete this OP from the SITE
            $scope.deleteOP = function () {
                OP_MEASURE.getDatumLocationOPMeasures({ objectivePointId: $scope.OP.OBJECTIVE_POINT_ID }).$promise.then(function (result) {
                    if (result.length > 0) {
                        var opOnTapedownModal = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Cannot Delete</h3></div>' +
                                '<div class="modal-body"><p>This Datum Location is being used for one or more sensor tape downs. Please delete the tape down before deleting the datum location.</p></div>' +
                                '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.dismiss();
                                };
                            }],
                            size: 'sm'
                        });
                    } else {
                        //no tapedowns, proceed
                        var DeleteModalInstance = $uibModal.open({
                            templateUrl: 'removemodal.html',
                            controller: 'ConfirmModalCtrl',
                            size: 'sm',
                            resolve: {
                                nameToRemove: function () {
                                    return $scope.OP;
                                },
                                what: function () {
                                    return "Objective Point";
                                }
                            }
                        });
                        DeleteModalInstance.result.then(function (opToRemove) {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            OBJECTIVE_POINT.delete({ id: opToRemove.OBJECTIVE_POINT_ID }, opToRemove).$promise.then(function () {
                                $scope.OPFiles = []; //clear out hwmFiles for this hwm
                                $scope.opImageFiles = []; //clear out image files for this hwm
                                //now remove all these files from SiteFiles
                                var l = $scope.allSFiles.length;
                                while (l--) {
                                    if ($scope.allSFiles[l].OBJECTIVE_POINT_ID == opToRemove.OBJECTIVE_POINT_ID) $scope.allSFiles.splice(l, 1);
                                }
                                //updates the file list on the sitedashboard
                                Site_Files.setAllSiteFiles($scope.allSFiles);

                                toastr.success("Datum Location Removed");
                                var sendBack = ["de", 'deleted'];
                                $uibModalInstance.close(sendBack);
                            }, function error(errorResponse) {
                                toastr.error("Error: " + errorResponse.statusText);
                            });
                        }, function () {
                            //logic for cancel
                        });//end modal
                    }//end else (proceed with delete)
                }); //end get opmeasurements
            }; //end delete

            //lat modal 
            var openLatModal = function (w) {
                var latModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Latitude must be between 0 and 73.0</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                    }],
                    size: 'sm'
                });
                latModal.result.then(function (fieldFocus) {
                    if (w == 'latlong') $("#LATITUDE_DD").focus();
                    else $("#LaDeg").focus();
                });
            };

            //long modal
            var openLongModal = function (w) {
                var longModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Longitude must be between -175.0 and -60.0</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                    }],
                    size: 'sm'
                });
                longModal.result.then(function (fieldFocus) {
                    if (w == 'latlong') $("#LONGITUDE_DD").focus();
                    else $("#LoDeg").focus();
                });
            };

            //make sure lat/long are right number range
            $scope.checkValue = function (d) {
                if (d == 'dms') {
                    //check the degree value
                    if ($scope.DMS.LADeg < 0 || $scope.DMS.LADeg > 73) {
                        openLatModal('dms');
                    }
                    if ($scope.DMS.LODeg < -175 || $scope.DMS.LODeg > -60) {
                        openLongModal('dms');
                    }
                } else {
                    //check the latitude/longitude
                    var op = $scope.view.OPval == 'edit' ? $scope.opCopy : $scope.OP;
                    if (op.LATITUDE_DD < 0 || op.LATITUDE_DD > 73) {
                        openLatModal('latlong');
                    }
                    if (op.LONGITUDE_DD < -175 || op.LONGITUDE_DD > -60) {
                        openLongModal('latlong');
                    }
                }
            };

            //edit button clicked. make copy of hwm 
            $scope.wannaEditOP = function () {
                $scope.view.OPval = 'edit';
                $scope.opCopy = angular.copy($scope.OP);
                $scope.opCopy.decDegORdms = 'dd';
                $scope.addedIdentifiersCopy = angular.copy($scope.addedIdentifiers);
            };
            $scope.cancelOPEdit = function () {
                $scope.view.OPval = 'detail';
                $scope.opCopy = [];               
            };
            $rootScope.stateIsLoading.showLoading = false;// loading..
            
        }]);//end OPmodalCtrl

})();