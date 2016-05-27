(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('quickHWMCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter',
        'allHorDatums', 'allHorCollMethods', 'allStates', 'allCounties', 'allOPTypes', 'allVertDatums', 'allVertColMethods', 
        'allOPQualities', 'allHWMTypes', 'allHWMQualities', 'allMarkers', 'SITE', 'OBJECTIVE_POINT', 'HWM', 
        function ($scope, $rootScope, $cookies, $location, $state, $http, $uibModal, $filter, allHorDatums, allHorCollMethods, allStates,
        allCounties, allOPTypes, allVertDatums, allVertColMethods, allOPQualities, allHWMTypes, allHWMQualities, allMarkers, SITE, OBJECTIVE_POINT, HWM) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //global vars
                $rootScope.thisPage = "Quick HWM";
                $scope.qhwmForm = {}; //forms within the accordion .Site, .OP, .HWM
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
                $scope.decDegORdms = {};
                $scope.aSite = { MEMBER_ID: $cookies.get('mID') };
                $scope.aOP = {DATE_ESTABLISHED: makeAdate("")};
                $scope.aHWM = { HWM_ENVIRONMENT: 'Riverine', BANK: 'N/A', FLAG_DATE: makeAdate(""), STILLWATER:0 };
                $scope.status = { siteOpen: true, opOpen: false, hwmOpen: false }; //accordion for parts
                $scope.removeOPCarray = []; //holder if they remove any OP controls
                $scope.addedIdentifiers = []; //holder for added Identifiers
                $scope.showControlIDinput = false; //initially hide the area containing added control Identifiers
                //dropdowns
                $scope.horDatumList = allHorDatums; $scope.horCollMethodList = allHorCollMethods;
                $scope.stateList = allStates; $scope.allCountyList = allCounties; $scope.stateCountyList = [];
                $scope.opTypeList = allOPTypes; $scope.vertDatumList = allVertDatums;
                $scope.vertCollMethodList = allVertColMethods; $scope.opQualList = allOPQualities;
                $scope.hwmTypeList = allHWMTypes; $scope.hwmQualList = allHWMQualities; $scope.markerList = allMarkers;
                //default radios
                $scope.FTorMETER = 'ft';
                $scope.FTorCM = 'ft';

                //want to add identifier
                $scope.addNewIdentifier = function () {
                    $scope.addedIdentifiers.push({ OBJECTIVE_POINT_ID: $scope.aOP.OBJECTIVE_POINT_ID, IDENTIFIER: "", IDENTIFIER_TYPE: "" });
                    $scope.showControlIDinput = true;
                };//end addNewIdentifier for OP

                //#region Datepicker
                $scope.datepickrs = {};
                $scope.open = function ($event, which) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.datepickrs[which] = true;
                };
                //#endregion

                //#region lat/long stuff
            
                $scope.decDegORdms.val = 'dd';
                $scope.DMS = {}; //holder of deg min sec values

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
                    if ($scope.decDegORdms.val == "dd") {
                        //they clicked Dec Deg..
                        if ($scope.DMS.LADeg !== undefined) {
                            //convert what's here for each lat and long
                            $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                            $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                            var test;
                        }
                    } else {
                        //they clicked dms (convert lat/long to dms)
                        if ($scope.aSite.LATITUDE_DD !== undefined) {
                            var latDMS = (deg_to_dms($scope.aSite.LATITUDE_DD)).toString();
                            var ladDMSarray = latDMS.split(':');
                            $scope.DMS.LADeg = ladDMSarray[0];
                            $scope.DMS.LAMin = ladDMSarray[1];
                            $scope.DMS.LASec = ladDMSarray[2];

                            var longDMS = deg_to_dms($scope.aSite.LONGITUDE_DD);
                            var longDMSarray = longDMS.split(':');
                            $scope.DMS.LODeg = longDMSarray[0] * -1;
                            $scope.DMS.LOMin = longDMSarray[1];
                            $scope.DMS.LOSec = longDMSarray[2];
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

                //get address parts and existing sites 
                $scope.getAddress = function () {
                    //clear them all first
                    delete $scope.aSite.ADDRESS; delete $scope.aSite.CITY; delete $scope.aSite.STATE;
                    $scope.stateCountyList = []; delete $scope.aSite.ZIP;

                    $rootScope.stateIsLoading.showLoading = true; //loading...
                    var geocoder = new google.maps.Geocoder(); //reverse address lookup
                    var latlng = new google.maps.LatLng($scope.aSite.LATITUDE_DD, $scope.aSite.LONGITUDE_DD);
                    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            //parse the results out into components ('street_number', 'route', 'locality', 'administrative_area_level_2', 'administrative_area_level_1', 'postal_code'
                            var address_components = results[0].address_components;
                            var components = {};
                            $.each(address_components, function (k, v1) {
                                $.each(v1.types, function (k2, v2) {
                                    components[v2] = v1.long_name;
                                });
                            });

                            $scope.aSite.ADDRESS = components.street_number !== undefined ? components.street_number + " " + components.route : components.route;
                            $scope.aSite.CITY = components.locality;

                            var thisState = $scope.stateList.filter(function (s) { return s.STATE_NAME == components.administrative_area_level_1; })[0];
                            if (thisState !== undefined) {
                                $scope.aSite.STATE = thisState.STATE_ABBREV;
                                $scope.stateCountyList = $scope.allCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                                $scope.aSite.COUNTY = components.administrative_area_level_2;
                                $scope.aSite.ZIP = components.postal_code;                                
                                $rootScope.stateIsLoading.showLoading = false;// loading..
                                $scope.$apply();
                            } else {
                                $rootScope.stateIsLoading.showLoading = false;// loading..
                                toastr.error("The Latitude/Longitude did not return a location within the U.S.");
                            }
                        } else {
                            $rootScope.stateIsLoading.showLoading = false;// loading..
                            toastr.error("There was an error getting address. Please try again.");
                        }
                       
                    });
                    // 
                };//end getAddress()

                //#endregion lat/long stuff
            
                // watch for the session event to change and update
                $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                    $scope.sessionEventName = newValue !== undefined ? newValue : "All Events";
                    $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
                });

                //when SITE.state changes, update county list
                $scope.updateCountyList = function (s) {
                    var thisState = $scope.stateList.filter(function (st) { return st.STATE_ABBREV == s; })[0];
                    $scope.stateCountyList = $scope.allCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                };//end updateCountyList() for Site

                //make uncertainty cleared and disabled when 'unquantified' is checked
                $scope.UnquantChecked = function () {
                    if ($scope.aOP.UNQUANTIFIED == 1)
                        $scope.aOP.UNCERTAINTY = null;
                };//end unquantChecked() for op

                //just need an OBJECTIVE_POINT object to post/put
                var trimOP = function (op) {
                    var OBJ_PT = {
                        OBJECTIVE_POINT_ID: op.OBJECTIVE_POINT_ID !== undefined ? op.OBJECTIVE_POINT_ID : 0,
                        NAME: op.NAME,
                        DESCRIPTION: op.DESCRIPTION,
                        ELEV_FT: op.ELEV_FT !== undefined ? op.ELEV_FT : null,
                        DATE_ESTABLISHED: op.DATE_ESTABLISHED,
                        OP_IS_DESTROYED: op.OP_IS_DESTROYED !== undefined ? op.OP_IS_DESTROYED : 0,
                        OP_NOTES: op.OP_NOTES !== undefined ? op.OP_NOTES : null,
                        SITE_ID: op.SITE_ID,
                        VDATUM_ID: op.VDATUM_ID !== undefined ? op.VDATUM_ID : 0,
                        LATITUDE_DD: op.LATITUDE_DD,
                        LONGITUDE_DD: op.LONGITUDE_DD,
                        HDATUM_ID: op.HDATUM_ID !== undefined ? op.HDATUM_ID : 0,
                        HCOLLECT_METHOD_ID: op.HCOLLECT_METHOD_ID !== undefined ? op.HCOLLECT_METHOD_ID : 0,
                        VCOLLECT_METHOD_ID: op.VCOLLECT_METHOD_ID !== undefined ? op.VCOLLECT_METHOD_ID : 0,
                        OP_TYPE_ID: op.OP_TYPE_ID,
                        DATE_RECOVERED: op.DATE_RECOVERED !== undefined ? op.DATE_RECOVERED : null,
                        UNCERTAINTY: op.UNCERTAINTY !== undefined ? op.UNCERTAINTY : null,
                        UNQUANTIFIED: op.UNQUANTIFIED !== undefined ? op.UNQUANTIFIED : null,
                        OP_QUALITY_ID: op.OP_QUALITY_ID !== undefined ? op.OP_QUALITY_ID : null,
                    };
                    return OBJ_PT;
                };

                //fix default radios and lat/long
                var formatDefaults = function (theOP) {
                    //$scope.OP.FTorMETER needs to be 'ft'. if 'meter' ==convert value to ft 
                    if (theOP.FTorMETER == "meter") {
                        $scope.aOP.FTorMETER = 'ft';
                        $scope.aOP.ELEV_FT = $scope.aOP.ELEV_FT * 3.2808;
                    }
                    //$scope.OP.FTorCM needs to be 'ft'. if 'cm' ==convert value to ft 
                    if (theOP.FTorCM == "cm") {
                        $scope.aOP.FTorCM = 'ft';
                        $scope.aOP.UNCERTAINTY = $scope.aOP.UNCERTAINTY / 30.48;
                    }
                };

                $scope.siteErrors = false; $scope.opErrors = false; $scope.hwmErrors = false; 
                $scope.create = function () {
                    $rootScope.stateIsLoading.showLoading = true;// loading..
                    var theForm = $scope.qhwmForm.quickHWM; $scope.siteErrors = false; $scope.opErrors = false; $scope.hwmErrors = false;
                    if (theForm.$valid) {
                        //site POST
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common.Accept = 'application/json';

                        var createdSiteID = 0;
                        if ($scope.aSite.LONGITUDE_DD > 0)
                            $scope.aSite.LONGITUDE_DD = $scope.aSite.LONGITUDE_DD * (-1);
                        //POST site
                        SITE.save($scope.aSite, function success(response) {
                            createdSiteID = response.SITE_ID;
                            $scope.aOP.SITE_ID = createdSiteID; $scope.aOP.LATITUDE_DD = response.LATITUDE_DD; $scope.aOP.LONGITUDE_DD = response.LONGITUDE_DD;
                            $scope.aOP.HDATUM_ID = response.HDATUM_ID; $scope.aOP.HCOLLECT_METHOD_ID = response.HCOLLECT_METHOD_ID;

                            $scope.aHWM.SITE_ID = createdSiteID; $scope.aHWM.WATERBODY = response.WATERBODY; $scope.aHWM.LATITUDE_DD = response.LATITUDE_DD;
                            $scope.aHWM.LONGITUDE_DD = response.LONGITUDE_DD; $scope.aHWM.HCOLLECT_METHOD_ID = response.HCOLLECT_METHOD_ID;
                            $scope.aHWM.HDATUM_ID = response.HDATUM_ID; $scope.aHWM.FLAG_TEAM_ID = response.MEMBER_ID; $scope.aHWM.EVENT_ID = $cookies.get('SessionEventID');

                            //OP stuff POST
                            var createdOP = {};
                            //post
                            formatDefaults($scope.aOP); //$scope.OP.FTorMETER, FTorCM, decDegORdms                               
                            var OPtoPOST = trimOP($scope.aOP); //make it an OBJECTIVE_POINT for saving

                            OBJECTIVE_POINT.save(OPtoPOST, function success(response) {
                                createdOP = response;
                                if ($scope.addedIdentifiers.length > 0) {
                                    //post each one
                                    for (var opc = 0; opc < $scope.addedIdentifiers.length; opc++)
                                        OBJECTIVE_POINT.createOPControlID({ id: response.OBJECTIVE_POINT_ID }, $scope.addedIdentifiers[opc]).$promise;
                                }
                                //HWM stuff POST
                                var createdHWM = {};
                                //if they entered a survey date or elevation, then set survey member as the flag member (flagging and surveying at same time
                                if ($scope.aHWM.SURVEY_DATE !== undefined)
                                    $scope.aHWM.SURVEY_TEAM_ID = $scope.aHWM.FLAG_TEAM_ID;

                                if ($scope.aHWM.ELEV_FT !== undefined) {
                                    //make sure they added the survey date if they added an elevation
                                    if ($scope.aHWM.SURVEY_DATE === undefined)
                                        $scope.aHWM.SURVEY_DATE = makeAdate("");

                                    $scope.aHWM.SURVEY_TEAM_ID = $scope.aHWM.FLAG_TEAM_ID;
                                }
                                HWM.save($scope.aHWM).$promise.then(function (response) {
                                    toastr.success("Quick HWM created");
                                    $rootScope.stateIsLoading.showLoading = false;// loading..
                                    $location.path('/Site/' + createdSiteID + '/SiteDashboard').replace();//.notify(false);
                                    $scope.apply;
                                });//end HWM.save()
                            });//end OP.save()
                        });//end SITE.save()

                    } else {
                        $rootScope.stateIsLoading.showLoading = false;// loading..
                        $scope.status.siteOpen = true;
                        $scope.status.opOpen = true;
                        $scope.status.hwmOpen = true;

                        angular.element("[name='" + theForm.$name + "']").find('.ng-invalid:visible:first').focus();

                        if (theForm.SITE_DESCRIPTION.$invalid || theForm.LATITUDE_DD.$invalid || theForm.LONGITUDE_DD.$invalid || theForm.HDATUM_ID.$invalid || theForm.HCOLLECT_METHOD_ID.$invalid || theForm.WATERBODY.$invalid || theForm.STATE.$invalidv || theForm.COUNTY.$invalid) {
                            $scope.siteErrors = true;
                        }
                        if (theForm.OP_TYPE_ID.$invalid || theForm.NAME.$invalid || theForm.DESCRIPTION.$invalid || theForm.de.$invalid) {
                            $scope.opErrors = true;
                        }
                        if (theForm.HWM_TYPE_ID.$invalid || theForm.HWM_ENVIRONMENT.$invalid || theForm.HWM_QUALITY_ID.$invalid || theForm.fd.$invalid) {
                            $scope.hwmErrors = true;
                        }
                        toastr.error("Quick HWM not created.");
                    }
                };


            }//end else (logged in)
        }]);
  
})();