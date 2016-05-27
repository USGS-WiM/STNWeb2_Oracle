(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
    ModalControllers.controller('hwmModalCtrl', ['$scope', '$rootScope', '$cookies', '$http', '$sce', '$uibModalInstance', '$uibModal', 'SERVER_URL', 'allDropdowns', 'Site_Files', 'thisHWM', 'hwmApproval', 'agencyList', 'hwmSite', 'allMembers', 'HWM', 'SOURCE', 'FILE',
        function ($scope, $rootScope, $cookies, $http, $sce, $uibModalInstance, $uibModal, SERVER_URL, allDropdowns, Site_Files, thisHWM, hwmApproval, agencyList, hwmSite, allMembers, HWM, SOURCE, FILE) {
            //dropdowns
            $scope.view = { HWMval: 'detail' };
            $scope.h = { hOpen: true, hFileOpen: false }; //accordions
            $scope.hwmTypeList = allDropdowns[0];
            $scope.hwmQualList = allDropdowns[1];
            $scope.HDatumsList = allDropdowns[2];
            $scope.hCollMList = allDropdowns[3];
            $scope.VDatumsList = allDropdowns[4];
            $scope.vCollMList = allDropdowns[5];
            $scope.markerList = allDropdowns[6];
            $scope.eventList = allDropdowns[7];            
            $scope.fileTypeList = allDropdowns[8]; //used if creating/editing HWM file    
            
            $scope.allSFiles = Site_Files.getAllSiteFiles();
            $scope.HWMFiles = thisHWM !== "empty" ? $scope.allSFiles.filter(function (sf) { return sf.HWM_ID == thisHWM.HWM_ID; }) : [];// holder for hwm files added
            $scope.hwmImageFiles = $scope.HWMFiles.filter(function (hf) { return hf.FILETYPE_ID === 1; }); //image files for carousel
            $scope.showFileForm = false; //hidden form to add file to hwm
            $scope.userRole = $cookies.get('usersRole');
            $scope.FlagMember = ""; //just for show on page
            $scope.SurveyMember = ""; //just for show on page
            $scope.showEventDD = false; //toggle to show/hide event dd (admin only)
            $scope.adminChanged = {}; //will hold EVENT_ID if admin changes it. apply when PUTting
            $scope.serverURL = SERVER_URL; //constant with stntest.wim.usgs.gov/STNServices2 
            //button click to show event dropdown to change it on existing hwm (admin only)
            $scope.showChangeEventDD = function () {
                $scope.showEventDD = !$scope.showEventDD;
            };

            //change event = apply it to the $scope.EventName
            $scope.ChangeEvent = function () {
                $scope.EventName = $scope.eventList.filter(function (el) { return el.EVENT_ID == $scope.adminChanged.EVENT_ID; })[0].EVENT_NAME;
            };
            // $scope.sessionEvent = $cookies.get('SessionEventName');
            $scope.LoggedInMember = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];

            $scope.aHWM = {};
            $scope.DMS = {};
            $scope.thisHWMsite = hwmSite;
            $scope.ApprovalInfo = {}; //when it gets approved or if it is approved, populate this with member and date
            //Datepicker
            $scope.datepickrs = {};
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
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
                if ($scope.createOReditHWM == 'edit') {
                    if ($scope.hwmCopy.decDegORdms == "dd") {
                        //they clicked Dec Deg..
                        if ($scope.DMS.LADeg !== undefined) {
                            //convert what's here for each lat and long
                            $scope.hwmCopy.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                            $scope.hwmCopy.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                            //clear
                            $scope.DMS = {};
                        }
                    } else {
                        //they clicked dms (convert lat/long to dms)
                        if ($scope.hwmCopy.LATITUDE_DD !== undefined) {
                            var latDMS = (deg_to_dms($scope.hwmCopy.LATITUDE_DD)).toString();
                            var ladDMSarray = latDMS.split(':');
                            $scope.DMS.LADeg = ladDMSarray[0];
                            $scope.DMS.LAMin = ladDMSarray[1];
                            $scope.DMS.LASec = ladDMSarray[2];

                            var longDMS = deg_to_dms($scope.hwmCopy.LONGITUDE_DD);
                            var longDMSarray = longDMS.split(':');
                            $scope.DMS.LODeg = longDMSarray[0] * -1;
                            $scope.DMS.LOMin = longDMSarray[1];
                            $scope.DMS.LOSec = longDMSarray[2];
                            //clear
                            $scope.hwmCopy.LATITUDE_DD = undefined; $scope.hwmCopy.LONGITUDE_DD = undefined;
                        }
                    }
                } else {
                    //create view
                    if ($scope.aHWM.decDegORdms == "dd") {
                        //they clicked Dec Deg..
                        if ($scope.DMS.LADeg !== undefined) {
                            //convert what's here for each lat and long
                            $scope.aHWM.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                            $scope.aHWM.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                            //clear
                            $scope.DMS = {};
                        }
                    } else {
                        //they clicked dms (convert lat/long to dms)
                        if ($scope.aHWM.LATITUDE_DD !== undefined) {
                            var create_latDMS = (deg_to_dms($scope.aHWM.LATITUDE_DD)).toString();
                            var create_ladDMSarray = create_latDMS.split(':');
                            $scope.DMS.LADeg = create_ladDMSarray[0];
                            $scope.DMS.LAMin = create_ladDMSarray[1];
                            $scope.DMS.LASec = create_ladDMSarray[2];

                            var create_longDMS = deg_to_dms($scope.aHWM.LONGITUDE_DD);
                            var create_longDMSarray = create_longDMS.split(':');
                            $scope.DMS.LODeg = create_longDMSarray[0] * -1;
                            $scope.DMS.LOMin = create_longDMSarray[1];
                            $scope.DMS.LOSec = create_longDMSarray[2];
                            //clear
                            $scope.aHWM.LATITUDE_DD = undefined; $scope.aHWM.LONGITUDE_DD = undefined;
                        }
                    }
                }
            };

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
                    var h = $scope.view.HWMval == 'edit' ? $scope.hwmCopy : $scope.aHWM;
                    if (h.LATITUDE_DD < 0 || h.LATITUDE_DD > 73) {
                        openLatModal('latlong');
                    }
                    if (h.LONGITUDE_DD < -175 || h.LONGITUDE_DD > -60) {
                        openLongModal('latlong');
                    }
                }
            };
            //  lat/long =is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

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
            };//end makeAdate()

            if (thisHWM != "empty") {
                //#region existing HWM
                $scope.createOReditHWM = 'edit';
                $scope.aHWM = angular.copy(thisHWM);
                //get all the names for details view
                $scope.aHWM.HWM_Type = $scope.hwmTypeList.filter(function (ht) { return ht.HWM_TYPE_ID == $scope.aHWM.HWM_TYPE_ID; })[0].HWM_TYPE;
                if ($scope.aHWM.STILLWATER !== null) {
                    $scope.aHWM.Tranquil = $scope.aHWM.STILLWATER > 0 ? 'Yes' : 'No';
                }
                $scope.aHWM.Marker = $scope.aHWM.MARKER_ID > 0 ? $scope.markerList.filter(function (m) { return m.MARKER_ID == $scope.aHWM.MARKER_ID; })[0].MARKER1 : '';
                $scope.aHWM.Quality = $scope.aHWM.HWM_QUALITY_ID > 0 ? $scope.hwmQualList.filter(function (hq) { return hq.HWM_QUALITY_ID == $scope.aHWM.HWM_QUALITY_ID; })[0].HWM_QUALITY : '';
                $scope.aHWM.hdatum = $scope.aHWM.HDATUM_ID > 0 ? $scope.HDatumsList.filter(function (hd) { return hd.DATUM_ID == $scope.aHWM.HDATUM_ID; })[0].DATUM_NAME : '';
                $scope.aHWM.hCollectMethod = $scope.aHWM.HCOLLECT_METHOD_ID > 0 ? $scope.hCollMList.filter(function (hc) { return hc.HCOLLECT_METHOD_ID == $scope.aHWM.HCOLLECT_METHOD_ID; })[0].HCOLLECT_METHOD : '';
                $scope.aHWM.vDatum = $scope.aHWM.VDATUM_ID > 0 ? $scope.VDatumsList.filter(function (vd) { return vd.DATUM_ID == $scope.aHWM.VDATUM_ID; })[0].DATUM_NAME : '';
                $scope.aHWM.vCollectMethod = $scope.aHWM.VCOLLECT_METHOD_ID > 0 ? $scope.vCollMList.filter(function (vc) { return vc.VCOLLECT_METHOD_ID == $scope.aHWM.VCOLLECT_METHOD_ID; })[0].VCOLLECT_METHOD : '';

                $scope.hwmModalHeader = "HWM Information";
                //get this hwm's event name
                $scope.EventName = $scope.aHWM.EVENT_ID > 0 ? $scope.eventList.filter(function (e) { return e.EVENT_ID == $scope.aHWM.EVENT_ID; })[0].EVENT_NAME : 'None provided';
                //date formatting
                $scope.aHWM.FLAG_DATE = makeAdate($scope.aHWM.FLAG_DATE);                
                //if this is surveyed, date format and get survey member's name
                if ($scope.aHWM.SURVEY_DATE !== null) {
                    $scope.aHWM.SURVEY_DATE = makeAdate($scope.aHWM.SURVEY_DATE);
                    $scope.SurveyMember = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aHWM.SURVEY_MEMBER_ID; })[0];
                }
                //get flagging member's name
                $scope.FlagMember = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aHWM.FLAG_MEMBER_ID; })[0];
                //#endregion existing HWM
            } else {
                //#region new HWM
                $scope.hwmModalHeader = "Create new HWM";
                $scope.createOReditHWM = 'create';
                //use site's LAT, LONG, WATERBODY, HDATUM, HCOLLECTMETHOD, set FLAGDATE with today
                $scope.aHWM = {
                    SITE_ID: $scope.thisHWMsite.SITE_ID,
                    EVENT_ID: $cookies.get('SessionEventID'),
                    HWM_ENVIRONMENT: 'Riverine',
                    BANK: 'N/A',
                    STILLWATER: 0,
                    LATITUDE_DD: hwmSite.LATITUDE_DD,
                    LONGITUDE_DD: hwmSite.LONGITUDE_DD,
                    WATERBODY: hwmSite.WATERBODY,
                    HDATUM_ID: hwmSite.HDATUM_ID,
                    HCOLLECT_METHOD_ID: hwmSite.HCOLLECT_METHOD_ID,
                    FLAG_DATE: makeAdate(""),
                    FLAG_MEMBER_ID: $scope.LoggedInMember.MEMBER_ID
                };
                $scope.EventName = $cookies.get('SessionEventName');
                $scope.FlagMember = $scope.LoggedInMember;
                //#endregion new HWM
            }
            //radio button defaults
            $scope.aHWM.decDegORdms = 'dd';
            $scope.FTorCM = 'ft';

            $scope.create = function (valid) {
                if (valid) {
                    var createdHWM = {};
                    if ($scope.DMS.LADeg !== undefined) $scope.aHWM.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    if ($scope.DMS.LODeg !== undefined) $scope.aHWM.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    //if they entered a survey date or elevation, then set survey member as the flag member (flagging and surveying at same time
                    if ($scope.aHWM.SURVEY_DATE !== undefined && $scope.aHWM.SURVEY_DATE !== null)
                        $scope.aHWM.SURVEY_MEMBER_ID = $scope.FLAG_MEMBER_ID;

                    if ($scope.FTorCM == "cm") {
                        $scope.FTorCM = 'ft';
                        if ($scope.aHWM.UNCERTAINTY !== undefined)
                            $scope.aHWM.UNCERTAINTY = $scope.aHWM.UNCERTAINTY / 30.48;
                    }

                    if ($scope.aHWM.ELEV_FT !== undefined && $scope.aHWM.ELEV_FT !== null) {
                        //make sure they added the survey date if they added an elevation
                        if ($scope.aHWM.SURVEY_DATE === undefined)
                            $scope.aHWM.SURVEY_DATE = makeAdate("");

                        $scope.aHWM.SURVEY_MEMBER_ID = $scope.aHWM.FLAG_MEMBER_ID;
                    }

                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    HWM.save($scope.aHWM).$promise.then(function (response) {
                        createdHWM = response;
                        toastr.success("HWM created");
                        var sendBack = [createdHWM, 'created'];
                        $uibModalInstance.close(sendBack);
                    });
                }
            };//end create()

            //approve this hwm (if admin or manager)
            $scope.approveHWM = function () {
                //this is valid, show modal to confirm they want to approve it
                var thisHWM = $scope.aHWM;
                var approveModal = $uibModal.open({
                    template: "<div class='modal-header'><h3 class='modal-title'>Approve HWM</h3></div>" +
                        "<div class='modal-body'><p>Are you ready to approve this HWM?</p><p>The surveyed elevation is {{approveHWM.ELEV_FT || '---'}}</p><p>The height above ground is {{approveHWM.HEIGHT_ABOVE_GND || '---'}}</p></div>" +
                        "<div class='modal-footer'><button class='btn btn-primary' ng-click='approveIt()'>Approve</button><button class='btn btn-warning' ng-click='cancel()'>Cancel</button></div>",
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.approveHWM = thisHWM;
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.approveIt = function () {
                            $uibModalInstance.close(thisHWM);
                        };
                    }],
                    size: 'sm'
                });
                approveModal.result.then(function (h) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    HWM.approveHWM({ id: h.HWM_ID }).$promise.then(function (approvalResponse) {
                        h.APPROVAL_ID = approvalResponse.APPROVAL_ID;
                        toastr.success("HWM Approved");
                        $scope.ApprovalInfo.approvalDate = new Date(approvalResponse.APPROVAL_DATE); //include note that it's displayed in their local time but stored in UTC
                        $scope.ApprovalInfo.Member = allMembers.filter(function (amem) { return amem.MEMBER_ID == approvalResponse.MEMBER_ID; })[0];
                        //var sendBack = [h, 'updated'];
                        //$uibModalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            //approve this hwm (if admin or manager)
            $scope.unApproveHWM = function () {
                //this is valid, show modal to confirm they want to approve it
                var thisHWM = $scope.aHWM;
                var unapproveModal = $uibModal.open({
                    template: "<div class='modal-header'><h3 class='modal-title'>Remove Approval</h3></div>" +
                        "<div class='modal-body'><p>Are you sure you wan to unapprove this HWM?</p></div>" +
                        "<div class='modal-footer'><button class='btn btn-primary' ng-click='unApproveIt()'>Unapprove</button><button class='btn btn-warning' ng-click='cancel()'>Cancel</button></div>",
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.approveHWM = thisHWM;
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.unApproveIt = function () {
                            $uibModalInstance.close(thisHWM);
                        };
                    }],
                    size: 'sm'
                });
                unapproveModal.result.then(function (h) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    HWM.unApproveHWM({ id: h.HWM_ID }).$promise.then(function () {
                        h.APPROVAL_ID = null;
                        toastr.success("HWM Unapproved");
                        $scope.ApprovalInfo = {};
                        //var sendBack = [h, 'updated'];
                        //$uibModalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };
            
            //save aHWM
            $scope.save = function (valid) {
                if (valid) {
                    var updatedHWM = {};
                    if ($scope.DMS.LADeg !== undefined) $scope.hwmCopy.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    if ($scope.DMS.LODeg !== undefined) $scope.hwmCopy.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    if ($scope.adminChanged.EVENT_ID !== undefined) {
                        //admin changed the event for this hwm..
                        $scope.hwmCopy.EVENT_ID = $scope.adminChanged.EVENT_ID;
                    }
                    //if they added a survey date, apply survey member as logged in member
                    if ($scope.hwmCopy.SURVEY_DATE !== undefined)
                        $scope.hwmCopy.SURVEY_MEMBER_ID = $cookies.get('mID');

                    if ($scope.FTorCM == "cm") {
                        $scope.FTorCM = 'ft';
                        if ($scope.hwmCopy.UNCERTAINTY !== undefined)
                            $scope.hwmCopy.UNCERTAINTY = $scope.hwmCopy.UNCERTAINTY / 30.48;
                    }

                    if ($scope.hwmCopy.ELEV_FT !== undefined && $scope.hwmCopy.ELEV_FT !== null) {
                        //make sure they added the survey date if they added an elevation
                        if ($scope.hwmCopy.SURVEY_DATE === undefined)
                            $scope.hwmCopy.SURVEY_DATE = makeAdate("");

                        $scope.hwmCopy.SURVEY_MEMBER_ID = $cookies.get('mID');
                    }

                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    HWM.update({ id: $scope.hwmCopy.HWM_ID }, $scope.hwmCopy).$promise.then(function (response) {
                        toastr.success("HWM updated");
                        $scope.aHWM = response; thisHWM = response;
                        //get all the names for details view
                        $scope.aHWM.HWM_Type = $scope.hwmTypeList.filter(function (ht) { return ht.HWM_TYPE_ID == $scope.aHWM.HWM_TYPE_ID; })[0].HWM_TYPE;
                        if ($scope.aHWM.STILLWATER !== null) {
                            $scope.aHWM.Tranquil = $scope.aHWM.STILLWATER > 0 ? 'Yes' : 'No';
                        }
                        $scope.aHWM.Marker = $scope.aHWM.MARKER_ID > 0 ? $scope.markerList.filter(function (m) { return m.MARKER_ID == $scope.aHWM.MARKER_ID; })[0].MARKER1 : '';
                        $scope.aHWM.Quality = $scope.aHWM.HWM_QUALITY_ID > 0 ? $scope.hwmQualList.filter(function (hq) { return hq.HWM_QUALITY_ID == $scope.aHWM.HWM_QUALITY_ID; })[0].HWM_QUALITY : '';
                        $scope.aHWM.hdatum = $scope.aHWM.HDATUM_ID > 0 ? $scope.HDatumsList.filter(function (hd) { return hd.DATUM_ID == $scope.aHWM.HDATUM_ID; })[0].DATUM_NAME : '';
                        $scope.aHWM.hCollectMethod = $scope.aHWM.HCOLLECT_METHOD_ID > 0 ? $scope.hCollMList.filter(function (hc) { return hc.HCOLLECT_METHOD_ID == $scope.aHWM.HCOLLECT_METHOD_ID; })[0].HCOLLECT_METHOD : '';
                        $scope.aHWM.vDatum = $scope.aHWM.VDATUM_ID > 0 ? $scope.VDatumsList.filter(function (vd) { return vd.DATUM_ID == $scope.aHWM.VDATUM_ID; })[0].DATUM_NAME : '';
                        $scope.aHWM.vCollectMethod = $scope.aHWM.VCOLLECT_METHOD_ID > 0 ? $scope.vCollMList.filter(function (vc) { return vc.VCOLLECT_METHOD_ID == $scope.aHWM.VCOLLECT_METHOD_ID; })[0].VCOLLECT_METHOD : '';
                        $scope.aHWM.FLAG_DATE = makeAdate($scope.aHWM.FLAG_DATE);
                        //is it approved?
                        if (hwmApproval !== undefined) {
                            $scope.ApprovalInfo.approvalDate = new Date(hwmApproval.APPROVAL_DATE); //include note that it's displayed in their local time but stored in UTC
                            $scope.ApprovalInfo.Member = allMembers.filter(function (amem) { return amem.MEMBER_ID == hwmApproval.MEMBER_ID; })[0];

                        }
                        //if this is surveyed, date format and get survey member's name
                        if ($scope.aHWM.SURVEY_DATE !== null) {
                            $scope.aHWM.SURVEY_DATE = makeAdate($scope.aHWM.SURVEY_DATE);
                            $scope.SurveyMember = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aHWM.SURVEY_MEMBER_ID; })[0];
                        }

                        //get flagging member's name
                        $scope.FlagMember = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aHWM.FLAG_MEMBER_ID; })[0];

                        $scope.hwmCopy = {};
                        $scope.view.HWMval = 'detail';
                        //var sendBack = [updatedHWM, 'updated'];
                        //$uibModalInstance.close(sendBack);
                    });
                }
            };//end save()

            //delete aHWM
            $scope.deleteHWM = function () {
                //TODO:: Delete the files for this hwm too or reassign to the Site?? Services or client handling?
                var DeleteModalInstance = $uibModal.open({
                    templateUrl: 'removemodal.html',
                    controller: 'ConfirmModalCtrl',
                    size: 'sm',
                    resolve: {
                        nameToRemove: function () {
                            return $scope.aHWM;
                        },
                        what: function () {
                            return "HWM";
                        }
                    }
                });

                DeleteModalInstance.result.then(function (hwmToRemove) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    HWM.delete({ id: hwmToRemove.HWM_ID }, hwmToRemove).$promise.then(function () {
                        $scope.HWMFiles = []; //clear out hwmFiles for this hwm
                        $scope.hwmImageFiles = []; //clear out image files for this hwm
                        //now remove all these files from SiteFiles
                        var l = $scope.allSFiles.length;
                        while (l--) {
                            if ($scope.allSFiles[l].HWM_ID == hwmToRemove.HWM_ID) $scope.allSFiles.splice(l, 1);
                        }
                        //updates the file list on the sitedashboard
                        Site_Files.setAllSiteFiles($scope.allSFiles); 
                        toastr.success("HWM Removed");
                        var sendBack = ["de", 'deleted'];
                        $uibModalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };

            //cancel
            $scope.cancel = function () {
                $rootScope.stateIsLoading.showLoading = false; // loading.. 
                var sendBack = $scope.aHWM;
                $uibModalInstance.close(sendBack);
            };

            //edit button clicked. make copy of hwm 
            $scope.wannaEditHWM = function () {
                $scope.view.HWMval = 'edit'; 
                $scope.hwmCopy = angular.copy($scope.aHWM);
                $scope.hwmCopy.decDegORdms = 'dd';
            };
            $scope.cancelHWMEdit = function () {
                $scope.view.HWMval = 'detail';
                $scope.hwmCopy = []; 
                $scope.adminChanged = {};
                $scope.EventName = $scope.eventList.filter(function (e) { return e.EVENT_ID == $scope.aHWM.EVENT_ID; })[0].EVENT_NAME;
            };

            //#region FILE STUFF
            //show a modal with the larger image as a preview on the photo file for this hwm
            $scope.showImageModal = function (image) {
                var imageModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Image File Preview</h3></div>' +
                        '<div class="modal-body"><img ng-src="{{setSRC}}" /></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
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
                //HWM will not have datafile 
                if (file !== 0) {
                    //edit hwm file
                    $scope.existFileIndex = $scope.HWMFiles.indexOf(file);
                    $scope.allSFileIndex = $scope.allSFiles.indexOf(file);
                    $scope.existIMGFileIndex = $scope.hwmImageFiles.length > 0 ? $scope.hwmImageFiles.indexOf(file) : -1;
                    $scope.aFile = angular.copy(file);
                    $scope.aFile.FILE_DATE = new Date($scope.aFile.FILE_DATE); //date for validity of form on PUT
                    if ($scope.aFile.PHOTO_DATE !== undefined) $scope.aFile.PHOTO_DATE = new Date($scope.aFile.PHOTO_DATE); //date for validity of form on PUT
                    if (file.SOURCE_ID !== null) {
                        SOURCE.query({ id: file.SOURCE_ID }).$promise.then(function (s) {
                            $scope.aSource = s;
                            $scope.aSource.FULLNAME = $scope.aSource.SOURCE_NAME;
                            $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                        });
                    }//end if source
                }//end existing file
                else {
                    $scope.aFile.FILE_DATE = new Date(); $scope.aFile.PHOTO_DATE = new Date();
                    $scope.aSource = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];
                    $scope.aSource.FULLNAME = $scope.aSource.FNAME + " " + $scope.aSource.LNAME;
                    $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                } //end new file
                $scope.showFileForm = true;

                  
                $scope.updateAgencyForCaption = function () {
                    if ($scope.aFile.FILETYPE_ID == 1)
                        $scope.agencyNameForCap = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.aSource.AGENCY_ID; })[0].AGENCY_NAME;
                };
            };
            //create this new file
            $scope.createFile = function (valid) {
                if (valid) {
                    $scope.HWMfileIsUploading = true;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    var theSource = { SOURCE_NAME: $scope.aSource.FULLNAME, AGENCY_ID: $scope.aSource.AGENCY_ID };
                    //post source first to get SOURCE_ID
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
                                    SITE_ID: $scope.thisHWMsite.SITE_ID,
                                    SOURCE_ID: response.SOURCE_ID,
                                    PHOTO_DIRECTION: $scope.aFile.PHOTO_DIRECTION,
                                    LATITUDE_DD: $scope.aFile.LATITUDE_DD,
                                    LONGITUDE_DD: $scope.aFile.LONGITUDE_DD,
                                    HWM_ID: $scope.aHWM.HWM_ID
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
                                fresponse.fileBelongsTo = "HWM File";
                                $scope.HWMFiles.push(fresponse);
                                $scope.allSFiles.push(fresponse);
                                Site_Files.setAllSiteFiles($scope.allSFiles); //updates the file list on the sitedashboard
                                if (fresponse.FILETYPE_ID === 1) $scope.hwmImageFiles.push(fresponse);
                                $scope.showFileForm = false; $scope.HWMfileIsUploading = false;
                            }, function (errorResponse) {
                                $scope.HWMfileIsUploading = false;
                                toastr.error("Error uploading file: " + errorResponse.statusText);
                            });
                        } else {
                            $scope.aFile.SOURCE_ID = response.SOURCE_ID; $scope.aFile.SITE_ID = $scope.thisHWMsite.SITE_ID; $scope.aFile.HWM_ID = $scope.aHWM.HWM_ID;
                            FILE.save($scope.aFile).$promise.then(function (fresponse) {
                                toastr.success("Link saved");
                                fresponse.fileBelongsTo = "HWM File";
                                $scope.HWMFiles.push(fresponse);
                                $scope.allSFiles.push(fresponse);
                                Site_Files.setAllSiteFiles($scope.allSFiles); //updates the file list on the sitedashboard                                
                                $scope.showFileForm = false; $scope.HWMfileIsUploading = false;
                            }, function (errorResponse) {
                                $scope.HWMfileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }//end else
                    }, function (errorResponse) {
                        $scope.HWMfileIsUploading = false;
                        toastr.error("Error creating Source info: " + errorResponse.statusText);
                    });//end source.save()              
                }//end valid
            };//end create()

            //update this file
            $scope.saveFile = function (valid) {
                if (valid) {
                    $scope.HWMfileIsUploading = true;
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
                                fileResponse.fileBelongsTo = "HWM File";
                                $scope.HWMFiles[$scope.existFileIndex] = fileResponse;
                                $scope.allSFiles[$scope.allSFileIndex] = fileResponse;
                                Site_Files.setAllSiteFiles($scope.allSFiles); //updates the file list on the sitedashboard
                                $scope.showFileForm = false; $scope.HWMfileIsUploading = false;
                            }, function (errorResponse) {
                                $scope.HWMfileIsUploading = false;
                                toastr.error("Error saving file: " + errorResponse.statusText);
                            });
                        }, function (errorResponse) {
                            $scope.HWMfileIsUploading = false; //Loading...
                            toastr.error("Error saving file: " + errorResponse.statusText);
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
                        $scope.HWMFiles.splice($scope.existFileIndex, 1);
                        $scope.allSFiles.splice($scope.allSFileIndex, 1);
                        $scope.hwmImageFiles.splice($scope.existIMGFileIndex, 1);
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
            $rootScope.stateIsLoading.showLoading = false; // loading..
        }]); //end HWM
})();