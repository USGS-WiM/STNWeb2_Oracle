(function () {
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('sensorCtrl', ['$scope', '$rootScope', '$q', '$cookies', '$location', '$state', '$http', '$uibModal', '$filter', '$timeout', 'thisSite', 'Instrument_Service', 'thisSiteSensors', 'allSensorBrands', 'allAgencies', 'allVertDatums', 'allDeployTypes', 'allSensorTypes', 'allSensDeps', 'allHousingTypes', 'allEvents', 'allFileTypes', 'INSTRUMENT', 'INSTRUMENT_STATUS', 'SITE', 'MEMBER', 'DEPLOYMENT_TYPE', 'STATUS_TYPE', 'INST_COLL_CONDITION',
        function ($scope, $rootScope, $q, $cookies, $location, $state, $http, $uibModal, $filter, $timeout, thisSite, Instrument_Service, thisSiteSensors, allSensorBrands, allAgencies, allVertDatums, allDeployTypes, allSensorTypes, allSensDeps, allHousingTypes, allEvents, allFileTypes, INSTRUMENT, INSTRUMENT_STATUS, SITE, MEMBER, DEPLOYMENT_TYPE, STATUS_TYPE, INST_COLL_CONDITION) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                //global vars
                $scope.sensorCount = { total: thisSiteSensors.length }; 
                $scope.deployTypeList = angular.copy(allDeployTypes);
                var tempDepTypeID = 0;
                //fix deployment types so that "Temperature" becomes 2 : Temperature (Met sensor)-SensorType:2 and Temperature (pressure transducer)-SensorType:1 -- just for proposed
                for (var d = 0; d < $scope.deployTypeList.length; d++) {
                    if ($scope.deployTypeList[d].METHOD === "Temperature") {
                        tempDepTypeID = $scope.deployTypeList[d].DEPLOYMENT_TYPE_ID;
                        $scope.deployTypeList[d].METHOD = "Temperature (Met sensor)";
                    }
                }
                $scope.deployTypeList.push({DEPLOYMENT_TYPE_ID: tempDepTypeID, METHOD: "Temperature (Pressure Transducer)" });

                $scope.sensDepTypes = allSensDeps;
                $scope.showProposed = false; //they want to add a proposed sensor, open options
                $scope.SiteSensors = thisSiteSensors;
                Instrument_Service.setAllSiteSensors($scope.SiteSensors);
                //to pass to the sensor modals for sensor files
                var SensFileTypes = allFileTypes.filter(function (sft) {
                    //Photo (1), Data (2), Historic (3), Field Sheets (4), Level Notes (5), Other (7), Link (8), Sketch (10)
                    return sft.FILETYPE === 'Photo' || sft.FILETYPE === 'Data' || sft.FILETYPE === 'Historic Citation' || sft.FILETYPE === 'Field Sheets' || sft.FILETYPE === 'Level Notes' ||
                       sft.FILETYPE === 'Other' || sft.FILETYPE === 'Link' || sft.FILETYPE === 'Sketch';
                });
                //show/hide proposed sensors to add
                $scope.showHideProposed = function () {
                    $scope.showProposed = !$scope.showProposed;
                };
           
                //add these checked Proposed sensors to this site
                $scope.AddProposed = function () {                    
                    var Time_STAMP = new Date();
                    for (var dt = 0; dt < $scope.deployTypeList.length; dt++) {
                        if ($scope.deployTypeList[dt].selected === true) {
                            var proposedToAdd = {}; var propStatToAdd = {};
                            if ($scope.deployTypeList[dt].METHOD.substring(0, 4) == "Temp") {
                                //temperature proposed sensor
                                proposedToAdd = {
                                    DEPLOYMENT_TYPE_ID: $scope.deployTypeList[dt].DEPLOYMENT_TYPE_ID,
                                    SITE_ID: thisSite.SITE_ID,
                                    SENSOR_TYPE_ID: $scope.deployTypeList[dt].METHOD == "Temperature (Pressure Transducer)" ? 1 : 2,
                                };
                            } else {
                                //any other type
                                proposedToAdd = {
                                    DEPLOYMENT_TYPE_ID: $scope.deployTypeList[dt].DEPLOYMENT_TYPE_ID,
                                    SITE_ID: thisSite.SITE_ID,
                                    SENSOR_TYPE_ID: $scope.sensDepTypes.filter(function (sdt) { return sdt.DEPLOYMENT_TYPE_ID == $scope.deployTypeList[dt].DEPLOYMENT_TYPE_ID; })[0].SENSOR_TYPE_ID,                                    
                                };
                            }
                            //now post it (Instrument first, then Instrument Status
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common.Accept = 'application/json';

                            INSTRUMENT.save(proposedToAdd).$promise.then(function (response) {
                                var createdPropSensor = {
                                    DEPLOYMENT_TYPE_ID: response.DEPLOYMENT_TYPE_ID,
                                    SITE_ID: response.SITE_ID,
                                    SENSOR_TYPE_ID: response.SENSOR_TYPE_ID,
                                    INSTRUMENT_ID: response.INSTRUMENT_ID,
                                    Deployment_Type: $scope.deployTypeList.filter(function (dtl) { return dtl.DEPLOYMENT_TYPE_ID == response.DEPLOYMENT_TYPE_ID;})[0].METHOD
                                };
                                propStatToAdd = { INSTRUMENT_ID: response.INSTRUMENT_ID, STATUS_TYPE_ID: 4, MEMBER_ID: $cookies.get('mID'), TIME_STAMP: Time_STAMP, TIME_ZONE: 'UTC', };

                                INSTRUMENT_STATUS.save(propStatToAdd).$promise.then(function (statResponse) {
                                    propStatToAdd.Status = 'Proposed'; propStatToAdd.INSTRUMENT_STATUS_ID = statResponse.INSTRUMENT_STATUS_ID;
                                    //statResponse.Status = 'Proposed';
                                    var instToPushToList = {
                                        Instrument: createdPropSensor,
                                        InstrumentStats: [propStatToAdd]
                                    };
                                    $scope.SiteSensors.push(instToPushToList);
                                    $scope.sensorCount = { total: $scope.SiteSensors.length };
                                    //clean up ...all unchecked and then hide
                                    for (var dep = 0; dep < $scope.deployTypeList.length; dep++) {
                                        $scope.deployTypeList[dep].selected = false;
                                    }
                                    $timeout(function () {
                                        // anything you want can go here and will safely be run on the next digest.
                                        $scope.showProposed = false;
                                        toastr.success("Proposed sensor created");                                        
                                    });

                                });//end INSTRUMENT_STATUS.save
                            }); //end INSTRUMENT.save
                        }//end if selected == true
                    }//end foreach deployTypeList
                };//end AddProposed()

                //want to retrieve this deployed sensor
                $scope.showRetrieveModal = function (sensorClicked) {
                    //need statusTypes, CollectConditions               
                    var indexClicked = $scope.SiteSensors.indexOf(sensorClicked); var allindex = thisSiteSensors.indexOf(sensorClicked);
                    $rootScope.stateIsLoading.showLoading = true;// loading..//$(".page-loading").removeClass("hidden"); //loading...

                    var modalInstance = $uibModal.open({
                        templateUrl: 'SensorRetrievalModal.html',
                        controller: 'sensorRetrievalModalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        windowClass: 'rep-dialog',
                        resolve: {                           
                            thisSensor: function () {
                                return sensorClicked !== 0 ? sensorClicked : "empty";
                            },
                            SensorSite: function () {
                                return thisSite;
                            },
                            allEventList: function () {
                                return allEvents;
                            },
                            siteOPs: function () {
                                return SITE.getSiteOPs({ id: thisSite.SITE_ID }).$promise;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return MEMBER.getAll().$promise;
                            },
                            allStatusTypes: function () {
                                return STATUS_TYPE.getAll().$promise;
                            },
                            allInstCollCond: function () {
                                return INST_COLL_CONDITION.getAll().$promise;
                            },
                            allVDatumList: function () {
                                return allVertDatums;
                            }
                        }
                    });
                    modalInstance.result.then(function (retrievedSensor) {
                        if (retrievedSensor[1] == 'retrieved') {
                            $scope.SiteSensors[indexClicked] = retrievedSensor[0]; thisSiteSensors[allindex] = retrievedSensor[0];
                        }
                        if (retrievedSensor[1] == 'deletedR') {
                            var indexClicked1 = $scope.SiteSensors.indexOf(sensorClicked);
                            $scope.SiteSensors.splice(indexClicked1, 1);
                            $scope.sensorCount.total = $scope.SiteSensors.length;
                        }
                        $rootScope.stateIsLoading.showLoading = false; // loading..
                    });
                };//end showRetrieveModal

                //want to deploy a proposed sensor, edit a deployed sensor or create a new deployed sensor
                $scope.showSensorModal = function (sensorClicked) {
                    var passAllLists = [allSensorTypes, allSensorBrands, allHousingTypes, allSensDeps, allEvents, SensFileTypes, allVertDatums];
                    var indexClicked = $scope.SiteSensors.indexOf(sensorClicked);
                    $rootScope.stateIsLoading.showLoading = true;// loading..// $(".page-loading").removeClass("hidden"); //loading...
                    
                    //if this is a create, show the sensormodal.html, if looking at deployed sensor, go to the depsensormodal.html
                    var modalInstance = $uibModal.open({
                        templateUrl: sensorClicked === 0 || sensorClicked.InstrumentStats[0].STATUS_TYPE_ID === 4 ? 'Sensormodal.html' : 'DepSensormodal.html',
                        controller: 'sensorModalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false,
                        windowClass: 'rep-dialog',
                        resolve: {
                            allDropdowns: function () {
                                return passAllLists;
                            },
                            allDepTypes: function () {
                                return DEPLOYMENT_TYPE.getAll().$promise;
                            },
                            thisSensor: function () {
                                return sensorClicked !== 0 ? sensorClicked : "empty";
                            },
                            SensorSite: function () {
                                return thisSite;
                            },
                            siteOPs: function () {
                                return SITE.getSiteOPs({ id: thisSite.SITE_ID }).$promise;
                            },
                            agencyList: function () {
                                return allAgencies;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return MEMBER.getAll().$promise;
                            }
                        }
                    });
                    modalInstance.result.then(function (createdSensor) {
                        var i = $scope.SiteSensors.indexOf(sensorClicked); var si = thisSiteSensors.indexOf(sensorClicked);
                        //'deployP' -> createdSensor[1] will be: 'proposedDeployed' deploy new -> createdSensor[1] will be: 'newDeployed';
                        if (createdSensor[1] == 'proposedDeployed') {
                            $scope.SiteSensors[i] = createdSensor[0];
                            thisSiteSensors[si] = createdSensor[0];
                            Instrument_Service.setAllSiteSensors($scope.SiteSensors);
                        }
                        if (createdSensor[1] == 'newDeployed') {
                            $scope.SiteSensors.push(createdSensor[0]); 
                            $scope.sensorCount.total = $scope.SiteSensors.length;
                            Instrument_Service.setAllSiteSensors($scope.SiteSensors);
                        }
                        if (createdSensor[1] === undefined) {
                            //this is from edit -- refresh page?
                            //update the list
                            $scope.SiteSensors[indexClicked] = createdSensor[0];
                            $rootScope.stateIsLoading.showLoading = false;// loading..
                        }
                        if (createdSensor[1] == 'deleted') {
                            $scope.SiteSensors.splice(i, 1);
                            $scope.sensorCount.total = $scope.SiteSensors.length;
                            Instrument_Service.setAllSiteSensors($scope.SiteSensors);
                        }
                        $rootScope.stateIsLoading.showLoading = false;// loading..
                    });
                };

                //want to see the retrieved sensor (can edit deployed part and retrieved part on here)
                $scope.showFullSensorModal = function (sensorClicked) {
                    //send all deployed stuff and retrieved stuff to modal
                    var deployedStuff = [allSensorTypes, allSensorBrands, allHousingTypes, allSensDeps, SensFileTypes, allVertDatums];
                    var retrievedStuff = [];
                    var indexClicked = $scope.SiteSensors.indexOf(sensorClicked);
                    $rootScope.stateIsLoading.showLoading = true;// loading..// $(".page-loading").removeClass("hidden"); //loading...

                    var modalInstance = $uibModal.open({
                        templateUrl: 'fullSensormodal.html',
                        controller: 'fullSensorModalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false,
                        windowClass: 'rep-dialog',
                        resolve: {
                            allDepDropdowns: function () {
                                return deployedStuff;
                            },
                            allStatusTypes: function () {
                                return STATUS_TYPE.getAll().$promise;
                            },
                            allInstCollCond: function () {
                                return INST_COLL_CONDITION.getAll().$promise;
                            },
                            allEvents: function () {
                                return allEvents;
                            },
                            allDepTypes: function () {
                                return DEPLOYMENT_TYPE.getAll().$promise;
                            },
                            thisSensor: function () {
                                return sensorClicked !== 0 ? sensorClicked : "empty";
                            },
                            SensorSite: function () {
                                return thisSite;
                            },
                            siteOPs: function () {
                                return SITE.getSiteOPs({ id: thisSite.SITE_ID }).$promise;
                            },
                            agencyList: function () {
                                return allAgencies;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return MEMBER.getAll().$promise;
                            }
                        }
                    });
                    modalInstance.result.then(function (createdSensor) {
                        //update the list
                        $scope.SiteSensors[indexClicked] = createdSensor[0];
                        $rootScope.stateIsLoading.showLoading = false;// loading..
                    });

                };

                // watch for the session event to change and update
                $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                    $scope.sessionEventName = newValue !== undefined ? newValue : "All Events";
                    $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
                    if (newValue !== undefined) {
                        $scope.SiteSensors = thisSiteSensors.filter(function (h) { return (h.Instrument.EVENT_ID == $cookies.get('SessionEventID')) || h.InstrumentStats[0].STATUS_TYPE_ID == 4; });
                        $scope.sensorCount = { total: $scope.SiteSensors.length };
                    } else {
                        $scope.SiteSensors = thisSiteSensors;
                        $scope.sensorCount = { total: $scope.SiteSensors.length };
                    }
                });
            } //end else not auth
        }]);
})();