(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('quickCreateCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$sce', 'whichQuick', 'allHorDatums',
        'allHorCollMethods', 'allStates', 'allCounties', 'allOPTypes', 'allVertDatums', 'allVertColMethods', 'allOPQualities', 'allHWMTypes', 'allHWMQualities', 'allMarkers',
        'allEvents', 'allSensorTypes', 'allSensorBrands', 'allDeployTypes', 'allHousingTypes', 'allSensDeps', 'SITE', 'OBJECTIVE_POINT', 'HWM', 'MEMBER', 'INSTRUMENT', 'INSTRUMENT_STATUS', 'OP_MEASURE',
        function ($scope, $rootScope, $cookies, $location, $state, $http, $uibModal, $filter, $sce, whichQuick, allHorDatums, allHorCollMethods, allStates, allCounties, allOPTypes,
            allVertDatums, allVertColMethods, allOPQualities, allHWMTypes, allHWMQualities, allMarkers, allEvents, allSensorTypes, allSensorBrands, allDeployTypes, allHousingTypes, allSensDeps,
            SITE, OBJECTIVE_POINT, HWM, MEMBER, INSTRUMENT, INSTRUMENT_STATUS, OP_MEASURE) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //global vars
                $scope.CreateWhat = whichQuick;
                $scope.htmlDescriptionTip = $sce.trustAsHtml('Required by NWIS. Can be listed as <em>\'unknown\'</em> or <em>\'Atlantic Ocean\'</em>');
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                MEMBER.query({ id: $cookies.get('mID') }).$promise.then(function (response) {
                    $scope.loggedInMember = response;
                });
                $rootScope.thisPage = "Quick" + whichQuick;
                $scope.quickForm = {}; //forms within the accordion .Site, .OP, .HWM
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
                $scope.EventName = $cookies.get('SessionEventName');
                $scope.aSite = { MEMBER_ID: $cookies.get('mID') };
                $scope.aOP = {DATE_ESTABLISHED: makeAdate("")};
                
                $scope.status = { siteOpen: true, opOpen: false, hwmOpen: false }; //accordion for parts
                $scope.removeOPCarray = []; //holder if they remove any OP controls
                $scope.addedIdentifiers = []; //holder for added Identifiers
                $scope.showControlIDinput = false; //initially hide the area containing added control Identifiers
                //dropdowns
                $scope.horDatumList = allHorDatums; $scope.horCollMethodList = allHorCollMethods;
                $scope.stateList = allStates; $scope.allCountyList = allCounties; $scope.stateCountyList = [];
                $scope.opTypeList = allOPTypes; $scope.vertDatumList = allVertDatums;
                $scope.vertCollMethodList = allVertColMethods; $scope.opQualList = allOPQualities;
                //hwm dropdowns
                if (whichQuick == 'HWM') {
                    $scope.aHWM = { HWM_ENVIRONMENT: 'Riverine', EVENT_ID: $cookies.get('SessionEventID'), BANK: 'N/A', FLAG_DATE: makeAdate(""), STILLWATER: 0, FLAG_MEMBER_ID: $cookies.get('mID') };
                    $scope.hwmTypeList = allHWMTypes; $scope.hwmQualList = allHWMQualities; $scope.markerList = allMarkers;
                }
                //sensor dropdowns
                if (whichQuick == 'Sensor') {
                    var getTimeZoneStamp = function (dsent) {
                        var sendThis = [];
                        var d;

                        if (dsent !== undefined) d = new Date(dsent);
                        else d = new Date();

                        var offset = (d.toString()).substring(35);
                        var zone = "";
                        switch (offset.substr(0, 3)) {
                            case "Cen":
                                zone = 'CST';
                                break;
                            case "Eas":
                                zone = 'EST';
                                break;
                            case "Mou":
                                zone = 'MST';
                                break;
                            case "Pac":
                                zone = 'PST';
                                break;
                        }
                        sendThis = [d, zone];
                        return sendThis;
                    };
                    $scope.depTypeList = allDeployTypes; //get fresh version so not messed up with the Temperature twice
                    $scope.houseTypeList = allHousingTypes;
                    $scope.timeZoneList = ['UTC', 'PST', 'MST', 'CST', 'EST'];
                    $scope.aSensor = { EVENT_ID: $cookies.get('SessionEventID'),  };
                    $scope.aSensStatus = {STATUS_TYPE_ID: 1, MEMBER_ID: $cookies.get('mID')};
                    $scope.eventList = allEvents; $scope.sensorTypeList = allSensorTypes; $scope.sensorBrandList = allSensorBrands;
                    $scope.IntervalType = { type: 'Seconds' }; //default
                    //displaying date / time it user's timezone
                    var DeptimeParts = getTimeZoneStamp();
                    $scope.aSensStatus.TIME_STAMP = DeptimeParts[0];
                    $scope.aSensStatus.TIME_ZONE = DeptimeParts[1]; //will be converted to utc on post/put
                    //$scope.Deployer = $scope.loggedInMember;

                    //get deployment types for sensor type chosen
                    $scope.getDepTypes = function () {
                        $scope.filteredDeploymentTypes = [];
                        var matchingSensDeplist = allSensDeps.filter(function (sd) { return sd.SENSOR_TYPE_ID == $scope.aSensor.SENSOR_TYPE_ID; });

                        for (var y = 0; y < matchingSensDeplist.length; y++) {
                            for (var i = 0; i < $scope.depTypeList.length; i++) {
                                //for each one, if projObjectives has this id, add 'selected:true' else add 'selected:false'
                                if (matchingSensDeplist[y].DEPLOYMENT_TYPE_ID == $scope.depTypeList[i].DEPLOYMENT_TYPE_ID) {
                                    $scope.filteredDeploymentTypes.push($scope.depTypeList[i]);
                                    i = $scope.depTypeList.length; //ensures it doesn't set it as false after setting it as true
                                }
                            }
                        }
                    };

                }
                //default radios
                $scope.FTorMETER = 'ft';
                $scope.FTorCM = 'ft';

                //want to add OP identifier
                $scope.addNewIdentifier = function () {
                    $scope.addedIdentifiers.push({ IDENTIFIER: "", IDENTIFIER_TYPE: "" });
                    $scope.showControlIDinput = true;
                };//end addNewIdentifier for OP

                //is it UTC or local time..make sure it stays UTC
                var dealWithTimeStampb4Send = function () {
                    //check and see if they are not using UTC
                    if ($scope.aSensStatus.TIME_ZONE != "UTC") {
                        //convert it
                        var utcDateTime = new Date($scope.aSensStatus.TIME_STAMP).toUTCString();
                        $scope.aSensStatus.TIME_STAMP = utcDateTime;
                        $scope.aSensStatus.TIME_ZONE = 'UTC';
                    } else {
                        //make sure 'GMT' is tacked on so it doesn't try to add hrs to make the already utc a utc in db
                        var i = $scope.aSensStatus.TIME_STAMP.toString().indexOf('GMT') + 3;
                        $scope.aSensStatus.TIME_STAMP = $scope.aSensStatus.TIME_STAMP.toString().substring(0, i);
                    }
                };

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
                        if (w == 'latlong') $("#SITE_LATITUDE_DD").focus();
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
                        if (w == 'latlong') $("#SITE_longitude_dd").focus();
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
                        if ($scope.aSite.LATITUDE_DD < 0 || $scope.aSite.LATITUDE_DD > 73) {
                            openLatModal('latlong');
                        }
                        if ($scope.aSite.LONGITUDE_DD < -175 || $scope.aSite.LONGITUDE_DD > -60) {
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

                //get address parts and existing sites 
                $scope.getAddress = function () {
                    //clear them all first
                    delete $scope.aSite.ADDRESS; delete $scope.aSite.CITY; delete $scope.aSite.STATE;
                    $scope.stateCountyList = []; delete $scope.aSite.ZIP;
                    if ($scope.DMS.LADeg !== undefined) $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                    if ($scope.DMS.LODeg !== undefined) $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                    if ($scope.aSite.LATITUDE_DD !== undefined && $scope.aSite.LONGITUDE_DD !== undefined) {
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

                                var thisState = undefined;
                                if (components.country !== "United States") {
                                    $scope.aSite.ADDRESS = components.route;
                                    $scope.aSite.CITY = components.administrative_area_level_1;
                                    thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.political; })[0];
                                } else {
                                    $scope.aSite.ADDRESS = components.street_number !== undefined ? components.street_number + " " + components.route : components.route;
                                    $scope.aSite.CITY = components.locality;
                                    thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.administrative_area_level_1; })[0];
                                }//end this is in the US
                                if (thisState !== undefined) {
                                    $scope.aSite.STATE = thisState.STATE_ABBREV;
                                    $scope.stateCountyList = $scope.allCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                                    $scope.aSite.COUNTY = components.country !== "United States" ? removeDiacritics(components.administrative_area_level_1) + " Municipio" : components.administrative_area_level_2;
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
                    } else {
                        //they did not type a lat/long first...
                        var emptyLatLongModal = $uibModal.open({
                            template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                                '<div class="modal-body"><p>Please provide a Latitude and Longitude before clicking Verify Location</p></div>' +
                                '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                            controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                                $scope.ok = function () {
                                    $uibModalInstance.close();
                                };
                            }],
                            size: 'sm'
                        });
                    }
                };//end getAddress()

                //#endregion lat/long stuff
            

                //#region regex/redialect on puerto rico county names with tildes
                /*  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
                    http://www.apache.org/licenses/LICENSE-2.0   Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
                    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.
                */
                var defaultDiacriticsRemovalMap = [
                    { 'base': 'A', 'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
                    { 'base': 'AA', 'letters': '\uA732' },
                    { 'base': 'AE', 'letters': '\u00C6\u01FC\u01E2' },
                    { 'base': 'AO', 'letters': '\uA734' },
                    { 'base': 'AU', 'letters': '\uA736' },
                    { 'base': 'AV', 'letters': '\uA738\uA73A' },
                    { 'base': 'AY', 'letters': '\uA73C' },
                    { 'base': 'B', 'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
                    { 'base': 'C', 'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
                    { 'base': 'D', 'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779' },
                    { 'base': 'DZ', 'letters': '\u01F1\u01C4' },
                    { 'base': 'Dz', 'letters': '\u01F2\u01C5' },
                    { 'base': 'E', 'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
                    { 'base': 'F', 'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
                    { 'base': 'G', 'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
                    { 'base': 'H', 'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
                    { 'base': 'I', 'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
                    { 'base': 'J', 'letters': '\u004A\u24BF\uFF2A\u0134\u0248' },
                    { 'base': 'K', 'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
                    { 'base': 'L', 'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
                    { 'base': 'LJ', 'letters': '\u01C7' },
                    { 'base': 'Lj', 'letters': '\u01C8' },
                    { 'base': 'M', 'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
                    { 'base': 'N', 'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
                    { 'base': 'NJ', 'letters': '\u01CA' },
                    { 'base': 'Nj', 'letters': '\u01CB' },
                    { 'base': 'O', 'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
                    { 'base': 'OI', 'letters': '\u01A2' },
                    { 'base': 'OO', 'letters': '\uA74E' },
                    { 'base': 'OU', 'letters': '\u0222' },
                    { 'base': 'OE', 'letters': '\u008C\u0152' },
                    { 'base': 'oe', 'letters': '\u009C\u0153' },
                    { 'base': 'P', 'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
                    { 'base': 'Q', 'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
                    { 'base': 'R', 'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
                    { 'base': 'S', 'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
                    { 'base': 'T', 'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
                    { 'base': 'TZ', 'letters': '\uA728' },
                    { 'base': 'U', 'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
                    { 'base': 'V', 'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
                    { 'base': 'VY', 'letters': '\uA760' },
                    { 'base': 'W', 'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
                    { 'base': 'X', 'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
                    { 'base': 'Y', 'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
                    { 'base': 'Z', 'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
                    { 'base': 'a', 'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
                    { 'base': 'aa', 'letters': '\uA733' },
                    { 'base': 'ae', 'letters': '\u00E6\u01FD\u01E3' },
                    { 'base': 'ao', 'letters': '\uA735' },
                    { 'base': 'au', 'letters': '\uA737' },
                    { 'base': 'av', 'letters': '\uA739\uA73B' },
                    { 'base': 'ay', 'letters': '\uA73D' },
                    { 'base': 'b', 'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
                    { 'base': 'c', 'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
                    { 'base': 'd', 'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
                    { 'base': 'dz', 'letters': '\u01F3\u01C6' },
                    { 'base': 'e', 'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
                    { 'base': 'f', 'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
                    { 'base': 'g', 'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
                    { 'base': 'h', 'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
                    { 'base': 'hv', 'letters': '\u0195' },
                    { 'base': 'i', 'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
                    { 'base': 'j', 'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
                    { 'base': 'k', 'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
                    { 'base': 'l', 'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
                    { 'base': 'lj', 'letters': '\u01C9' },
                    { 'base': 'm', 'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
                    { 'base': 'n', 'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
                    { 'base': 'nj', 'letters': '\u01CC' },
                    { 'base': 'o', 'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
                    { 'base': 'oi', 'letters': '\u01A3' },
                    { 'base': 'ou', 'letters': '\u0223' },
                    { 'base': 'oo', 'letters': '\uA74F' },
                    { 'base': 'p', 'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
                    { 'base': 'q', 'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
                    { 'base': 'r', 'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
                    { 'base': 's', 'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
                    { 'base': 't', 'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
                    { 'base': 'tz', 'letters': '\uA729' },
                    { 'base': 'u', 'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
                    { 'base': 'v', 'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
                    { 'base': 'vy', 'letters': '\uA761' },
                    { 'base': 'w', 'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
                    { 'base': 'x', 'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
                    { 'base': 'y', 'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
                    { 'base': 'z', 'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' }
                ];
                var diacriticsMap = {};
                for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
                    var letters = defaultDiacriticsRemovalMap[i].letters;
                    for (var j = 0; j < letters.length ; j++) {
                        diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
                    }
                }
                // "what?" version ... http://jsperf.com/diacritics/12
                var removeDiacritics = function (str) {
                    return str.replace(/[^\u0000-\u007E]/g, function (a) {
                        return diacriticsMap[a] || a;
                    });
                };
                //#endregion

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

                //X was clicked next to existing Control Identifier to have it removed, store in remove array for Save()
                $scope.RemoveID = function (opControl) {
                    //only add to remove list if it's an existing one to DELETE
                    var i = $scope.addedIdentifiers.indexOf(opControl);
                    if (opControl.OP_CONTROL_IDENTIFIER_ID !== undefined) {
                        $scope.removeOPCarray.push(opControl);
                        $scope.addedIdentifiers.splice(i, 1);
                    } else {
                        $scope.addedIdentifiers.splice(i, 1);
                    }
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
                $scope.tapedown = { Open: false };
                //sensor section, clicked Show/Hide Tape down information
                var showNeedOPfirstModal = function () {                    
                    var needOPModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">No Datum Location</h3></div>' +
                            '<div class="modal-body"><p>In order to add tape down information, please populate the Datum Location section above first.</p>' +
                            '<p>The following fields are required for the tape down section: <b>Name</b>, <b>Elevation</b> and <b>Vertical Datum</b>.</p></div>' +
                            '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close();
                            };
                        }],
                        size: 'sm'
                    });
                    needOPModal.result.then(function () {
                        $scope.tapedown.Open = false;
                    });
                };
                $scope.tapeDownTable = []; //holder for the op if they choose it from the dropdown for tape down
                $scope.removeOP = function () {                    
                    //they unchecked the op to remove
                    var removeOPMeas = $uibModal.open({
                        backdrop: 'static',
                        keyboard: false,
                        template: '<div class="modal-header"><h3 class="modal-title">Remove OP Measure</h3></div>' +
                            '<div class="modal-body"><p>Are you sure you don\'t want to add this OP Measurement to this quick sensor?</p></div>' +
                            '<div class="modal-footer"><button class="btn btn-primary" ng-enter="ok()" ng-click="ok()">Yes</button><button class="btn btn-primary" ng-click="cancel()">Cancel</button></div>',
                        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close('remove');
                            };
                            $scope.cancel = function () {
                                $uibModalInstance.close('cancel');
                            };
                        }],
                        size: 'sm'
                    });
                    removeOPMeas.result.then(function (yesOrNo) {
                        if (yesOrNo == 'remove') {
                            $scope.tapedown.Open = false;
                            //remove it
                            $scope.tapeDownTable.splice(0, 1);
                            $scope.OPsForTapeDown = [];
                            $scope.OPMeasure = {}; $scope.addTapedown = false;
                            $scope.aSensStatus.SENSOR_ELEVATION = ''; $scope.aSensStatus.WS_ELEVATION = ''; $scope.aSensStatus.GS_ELEVATION = ''; $scope.aSensStatus.VDATUM_ID = '';
                        }
                    });
                };
                $scope.addTapedown = false; //toggle tapedown section                
                $scope.OPsForTapeDown = []; //will hold OP they add in op accordion.. get this when they click the button and show modal if they haven't populated it yet.
                $scope.showTapedownPart = function () {                    
                    if ($scope.tapeDownTable.length < 1) {
                        //they are opening to add tape down information
                        if ($scope.aOP.NAME !== undefined && $scope.aOP.ELEV_FT !== undefined && $scope.aOP.VDATUM_ID !== undefined) {
                            $scope.OPMeasure = {};
                            $scope.OPMeasure.OP_NAME = $scope.aOP.NAME;
                            $scope.OPMeasure.elevation = $scope.aOP.ELEV_FT;
                            $scope.OPMeasure.Vdatum = $scope.vertDatumList.filter(function (vd) { return vd.DATUM_ID == $scope.aOP.VDATUM_ID; })[0].DATUM_ABBREVIATION;
                            $scope.tapeDownTable.push($scope.OPMeasure);

                            $scope.OPsForTapeDown.push($scope.aOP);
                            $scope.addTapedown = true; $scope.tapedown.Open = true;
                            $scope.aSensStatus.VDATUM_ID = $scope.aOP.VDATUM_ID;
                        } else {
                            showNeedOPfirstModal(); 
                        }
                    } else {
                        $scope.addTapedown = true; $scope.tapedown.Open = true;
                    }
                    
                };
                $scope.siteErrors = false; $scope.opErrors = false; $scope.hwmErrors = false; 
                $scope.create = function () {
                    $rootScope.stateIsLoading.showLoading = true;// loading..
                    var theForm = $scope.quickForm.quick; $scope.siteErrors = false; $scope.opErrors = false; $scope.hwmErrors = false;
                    if (theForm.$valid) {
                        //site POST
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        if ($scope.aSite.LATITUDE_DD === undefined) $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                        if ($scope.aSite.LONGITUDE_DD === undefined) $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                        var createdSiteID = 0;                        
                        //POST site
                        SITE.save($scope.aSite, function success(response) {
                            createdSiteID = response.SITE_ID;
                            $scope.aOP.SITE_ID = createdSiteID; $scope.aOP.LATITUDE_DD = response.LATITUDE_DD; $scope.aOP.LONGITUDE_DD = response.LONGITUDE_DD;
                            $scope.aOP.HDATUM_ID = response.HDATUM_ID; $scope.aOP.HCOLLECT_METHOD_ID = response.HCOLLECT_METHOD_ID;
                            if ($scope.CreateWhat == 'HWM') {
                                $scope.aHWM.SITE_ID = createdSiteID; $scope.aHWM.WATERBODY = response.WATERBODY; $scope.aHWM.LATITUDE_DD = response.LATITUDE_DD;
                                $scope.aHWM.LONGITUDE_DD = response.LONGITUDE_DD; $scope.aHWM.HCOLLECT_METHOD_ID = response.HCOLLECT_METHOD_ID;
                                $scope.aHWM.HDATUM_ID = response.HDATUM_ID; $scope.aHWM.FLAG_MEMBER_ID = response.MEMBER_ID; $scope.aHWM.EVENT_ID = $cookies.get('SessionEventID');
                            }
                            //OP stuff POST
                            var createdOP = {};
                            //post
                            formatDefaults($scope.aOP); //$scope.OP.FTorMETER, FTorCM, decDegORdms                               
                            var OPtoPOST = trimOP($scope.aOP); //make it an OBJECTIVE_POINT for saving

                            OBJECTIVE_POINT.save(OPtoPOST, function success(response) {
                                createdOP = response;
                                if ($scope.addedIdentifiers.length > 0) {
                                    //post each one THIS WILL CHANGE SOON TO HAVE OBJECTIVE_POINT_ID already added and not sent along with it
                                    for (var opc = 0; opc < $scope.addedIdentifiers.length; opc++) {
                                        $scope.addedIdentifiers[opc].OBJECTIVE_POINT_ID = response.OBJECTIVE_POINT_ID;
                                        OBJECTIVE_POINT.createOPControlID({ id: response.OBJECTIVE_POINT_ID }, $scope.addedIdentifiers[opc]).$promise;
                                    }
                                }
                                //HWM stuff POST if HWM
                                if ($scope.CreateWhat == 'HWM') {
                                    var createdHWM = {};
                                    //if they entered a survey date or elevation, then set survey member as the flag member (flagging and surveying at same time
                                    if ($scope.aHWM.SURVEY_DATE !== undefined)
                                        $scope.aHWM.SURVEY_MEMBER_ID = $scope.aHWM.FLAG_MEMBER_ID;

                                    if ($scope.aHWM.ELEV_FT !== undefined) {
                                        //make sure they added the survey date if they added an elevation
                                        if ($scope.aHWM.SURVEY_DATE === undefined)
                                            $scope.aHWM.SURVEY_DATE = makeAdate("");

                                        $scope.aHWM.SURVEY_MEMBER_ID = $scope.aHWM.FLAG_MEMBER_ID;
                                    }
                                    HWM.save($scope.aHWM).$promise.then(function (response) {
                                        toastr.success("Quick HWM created");
                                        $rootScope.stateIsLoading.showLoading = false;// loading..
                                        $location.path('/Site/' + createdSiteID + '/SiteDashboard').replace();//.notify(false);
                                        $scope.apply;
                                    });//end HWM.save()
                                }//end HWM creating
                                if ($scope.CreateWhat == 'Sensor') {
                                    var createdSensor = {}; var depSenStat = {};
                                    if ($scope.IntervalType.type == "Minutes")
                                        $scope.aSensor.INTERVAL = $scope.aSensor.INTERVAL * 60;

                                    $scope.aSensor.SITE_ID = createdSiteID;
                                    dealWithTimeStampb4Send(); //UTC or local?
                                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                    $http.defaults.headers.common.Accept = 'application/json';
                                    INSTRUMENT.save($scope.aSensor).$promise.then(function (response) {
                                        //create instrumentstatus too 
                                        createdSensor = response;
                                        $scope.aSensStatus.INSTRUMENT_ID = response.INSTRUMENT_ID;
                                        INSTRUMENT_STATUS.save($scope.aSensStatus).$promise.then(function (statResponse) {
                                            //added tape downs?
                                            if ($scope.tapeDownTable.length > 0) {
                                                var thisTape = $scope.tapeDownTable[0];
                                                thisTape.INSTRUMENT_STATUS_ID = statResponse.INSTRUMENT_STATUS_ID;
                                                thisTape.OBJECTIVE_POINT_ID = createdOP.OBJECTIVE_POINT_ID;
                                                ///POST IT///
                                                OP_MEASURE.addInstStatMeasure({ instrumentStatusId: statResponse.INSTRUMENT_STATUS_ID }, thisTape).$promise;                                                
                                            }
                                            toastr.success("Quick Sensor created");
                                            $rootScope.stateIsLoading.showLoading = false;// loading..
                                            $location.path('/Site/' + createdSiteID + '/SiteDashboard').replace();//.notify(false);
                                            $scope.apply;
                                        });//end Instrument Status save
                                    });//end instrumentSave
                                }//end if sensor
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