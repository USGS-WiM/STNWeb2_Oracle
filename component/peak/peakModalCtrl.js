(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var ModalControllers = angular.module('ModalControllers');
    ModalControllers.controller('peakModalCtrl', ['$scope', '$rootScope', '$cookies', '$http', '$uibModalInstance', '$uibModal', 'SERVER_URL', 'allVertDatums', 'allCollectConditions', 'thisPeak', 'peakSite', 'allMembers', 'allEventHWMs', 'allSiteSensors', 'allSiteFiles', 'thisPeakDFs', 'DATA_FILE', 'PEAK', 'HWM',
        function ($scope, $rootScope, $cookies, $http, $uibModalInstance, $uibModal, SERVER_URL, allVertDatums, allCollectConditions, thisPeak, peakSite, allMembers, allEventHWMs, allSiteSensors, allSiteFiles, thisPeakDFs, DATA_FILE, PEAK, HWM) {
            $scope.serverURL = SERVER_URL;
            //dropdowns
            $scope.VDatumsList = allVertDatums;
            $scope.thisSite = peakSite;
            $scope.memberList = allMembers;
            $scope.loggedInRole = $cookies.get('usersRole');
            //need a datafile for this kind of sensor, check files for presence of df to set flag on sensor
            var determineDFPresent = function (f) {
                for (var x = 0; x < f.length; x++) {
                    if (f[x].FILETYPE_ID == 2) {
                        return true;
                    }
                }
                return false;
            };
            //add selected prop now for data files/sensor files for later use
            for (var sf = 0; sf < allSiteFiles.length; sf++) {
                if (allSiteFiles[sf].fileBelongsTo == 'DataFile File' || allSiteFiles[sf].fileBelongsTo == 'Sensor File') {
                    allSiteFiles[sf].selected = false;
                }
            }

            $scope.eventSiteHWMs = allEventHWMs.filter(function (h) { return h.SITE_ID == peakSite.SITE_ID; });
            angular.forEach($scope.eventSiteHWMs, function (esh) {
                esh.selected = false;
                esh.files = allSiteFiles.filter(function (sf) { return sf.HWM_ID == esh.HWM_ID && sf.fileBelongsTo == "HWM File"; });
            });
            
            $scope.eventSiteSensors = allSiteSensors.filter(function (s) { return s.Instrument.EVENT_ID == $cookies.get('SessionEventID'); }); //maybe go from here to get all datafiles for each sensor
            angular.forEach($scope.eventSiteSensors, function (ess) {
                // if ess.Instrument.Sensor_type == 2, 5, or 6 .. and there are no files.. show red ! with text
                ess.CollectCondition = ess.Instrument.INST_COLLECTION_ID !== null && ess.Instrument.INST_COLLECTION_ID > 0 ?
                    allCollectConditions.filter(function (cc) { return cc.ID == ess.Instrument.INST_COLLECTION_ID; })[0].CONDITION :
                    '';
                //store if this is retrieved (if not, show ! for them to retrieve it in order to complete the peak
                ess.isRetrieved = ess.InstrumentStats[0].Status == 'Retrieved' ? true : false;
                ess.files = allSiteFiles.filter(function (sf) { return sf.INSTRUMENT_ID == ess.Instrument.INSTRUMENT_ID && (sf.fileBelongsTo == "DataFile File" || sf.fileBelongsTo == "Sensor File"); });
                //var hasDF = {value:true}; (2: Met Station, 5: Rapid Deployment Gage, 6: Rain Gage)
                if (ess.Instrument.SENSOR_TYPE_ID == 2 || ess.Instrument.SENSOR_TYPE_ID == 5 || ess.Instrument.SENSOR_TYPE_ID == 6) {
                    if (ess.files.length === 0) ess.NeedDF = true;
                    else {
                        if (!determineDFPresent(ess.files)) ess.NeedDF = true;
                    }
                }//end if this is a datafile requiring sensor
            });

            
            // $scope.siteFilesForSensors = allSiteFiles.filter(function (f) { return f.INSTRUMENT_ID !== null && f.INSTRUMENT_ID > 0; });
            $scope.timeZoneList = ['UTC', 'PST', 'MST', 'CST', 'EST'];
            $scope.LoggedInMember = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];
            $scope.chosenHWMList = [];//holder of chosen hwms for this peak
            $scope.removedChosenHWMList = []; //holder for removed ones for PUT (if this is edit)
            $scope.chosenDFList = []; //holder for chosen datafile for this peak
            $scope.removedChosenDFList = []; //holder for removed ones for PUT (if this is edit)
            $scope.hwmDetail = false; //show/hide hwm box of hwm details
            $scope.HWMBox = {}; //holds binding for what to show in hwm detail box
            $scope.sensorDetail = false; //show/hide sensor box of sensor details
            $scope.SensorBox = {}; //holds binding for what to show in the sensor detail box
            $scope.dataFileDetail = false; //show/hide datafile box of datafile details
            $scope.DFBox = {}; //holds binding for what to show in the datafile detail box
            $scope.aPeak = {};
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
            //get timezone and timestamp for their timezone for showing.. post/put will convert it to utc
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

            //Datepicker
            $scope.dateOptions = {
                startingDay: 1,
                showWeeks: false
            };
            $scope.datepickrs = {};
            $scope.open = function ($event, which) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.datepickrs[which] = true;
            };

            //is it UTC or local time..make sure it stays UTC
            var dealWithTimeStampb4Send = function () {
                //check and see if they are not using UTC
                if ($scope.aPeak.TIME_ZONE != "UTC") {
                    //convert it
                    var utcDateTime = new Date($scope.aPeak.PEAK_DATE).toUTCString();
                    $scope.aPeak.PEAK_DATE = utcDateTime;
                    $scope.aPeak.TIME_ZONE = 'UTC';
                } else {
                    //make sure 'GMT' is tacked on so it doesn't try to add hrs to make the already utc a utc in db
                    var i = $scope.aPeak.PEAK_DATE.toString().indexOf('GMT') + 3;
                    $scope.aPeak.PEAK_DATE = $scope.aPeak.PEAK_DATE.toString().substring(0, i);
                }
            };

            //cancel
            $scope.cancel = function () {
                $rootScope.stateIsLoading.showLoading = false; // loading.. 
                $uibModalInstance.dismiss('cancel');
            };
            
            //is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            if (thisPeak != "empty") {
                //#region existing PEAK
                $scope.aPeak = angular.copy(thisPeak);
                $scope.aPeak.PEAK_DATE = { date: getDateTimeParts($scope.aPeak.PEAK_DATE), time: getDateTimeParts($scope.aPeak.PEAK_DATE) };
                //get peak creator name
                $scope.PeakCreator = allMembers.filter(function (m) { return m.MEMBER_ID == $scope.aPeak.MEMBER_ID; })[0];
                //check off those hwms used for this peak
                for (var h = 0; h < $scope.eventSiteHWMs.length; h++) {
                    if ($scope.eventSiteHWMs[h].PEAK_SUMMARY_ID == $scope.aPeak.PEAK_SUMMARY_ID)
                        $scope.eventSiteHWMs[h].selected = true;
                }
                //check off those hwms used for this peak
                //for each eventSiteSensor.. for each file within each sensor... if dataFileID == any of the peakDFs datafileID ====> make that file.selected =true
                for (var s = 0; s < $scope.eventSiteSensors.length; s++) {
                    //for each eventSiteSensor
                    var essI = s;
                    for (var df = 0; df < $scope.eventSiteSensors[essI].files.length; df++) {
                        //for each file within this eventSiteSensor
                        var isThere = thisPeakDFs.filter(function (pdf) { return pdf.DATA_FILE_ID == $scope.eventSiteSensors[essI].files[df].DATA_FILE_ID; })[0];
                        if (isThere !== undefined) $scope.eventSiteSensors[essI].files[df].selected = true;
                    }
                }
                //#endregion existing PEAK
            } else {
                //#region new PEAK
                var timeParts = getTimeZoneStamp();
                $scope.aPeak = { PEAK_DATE: {date: timeParts[0], time: timeParts[0]}, TIME_ZONE: timeParts[1], MEMBER_ID: $cookies.get('mID') };
                $scope.PeakCreator = allMembers.filter(function (m) { return m.MEMBER_ID == $cookies.get('mID'); })[0];
               
                //#endregion new PEAK
            }

            //show a modal with the larger file image as a preview
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

            //#region hwm list stuff
            var formatSelectedHWM = function (h) {
                var fhwm = {};
                fhwm.APPROVAL_ID = h.APPROVAL_ID;
                fhwm.BANK = h.BANK;
                fhwm.ELEV_FT = h.ELEV_FT;
                fhwm.EVENT_ID = h.EVENT_ID;
                fhwm.FLAG_DATE = h.FLAG_DATE;
                fhwm.FLAG_MEMBER_ID = h.FLAG_MEMBER_ID;
                fhwm.HCOLLECT_METHOD_ID = h.HCOLLECT_METHOD_ID;
                fhwm.HDATUM_ID = h.HDATUM_ID;
                fhwm.HEIGHT_ABOVE_GND = h.HEIGHT_ABOVE_GND;
                fhwm.HWM_ENVIRONMENT = h.HWM_ENVIRONMENT;
                fhwm.HWM_ID = h.HWM_ID;
                fhwm.HWM_LOCATIONDESCRIPTION = h.HWM_LOCATIONDESCRIPTION;
                fhwm.HWM_NOTES = h.HWM_NOTES;
                fhwm.HWM_QUALITY_ID = h.HWM_QUALITY_ID;
                fhwm.HWM_TYPE_ID = h.HWM_TYPE_ID;
                fhwm.LATITUDE_DD = h.LATITUDE;
                fhwm.LONGITUDE_DD = h.LONGITUDE;
                fhwm.MARKER_ID = h.MARKER_ID;
                fhwm.PEAK_SUMMARY_ID = h.PEAK_SUMMARY_ID;
                fhwm.SITE_ID = h.SITE_ID;
                fhwm.STILLWATER = h.STILLWATER == "No" ? 0 : 1;
                fhwm.SURVEY_DATE = h.SURVEY_DATE;
                fhwm.SURVEY_MEMBER_ID = h.SURVEY_MEMBER_ID;
                fhwm.VCOLLECT_METHOD_ID = h.VCOLLECT_METHOD_ID;
                fhwm.VDATUM_ID = h.VDATUM_ID;
                fhwm.WATERBODY = h.WATERBODY;
                return fhwm;
            };
            //add or remove a hwm from the list of chosen hwms for determining this peak
            $scope.addHWM = function (h) {
                var aHWM = formatSelectedHWM(h);
                if (h.selected === true) {                    
                    $scope.chosenHWMList.push(aHWM);
                } else {
                    if ($scope.aPeak.PEAK_SUMMARY_ID !== undefined) {
                        //edit.. need to store removed ones for PUT
                        $scope.removedChosenHWMList.push(dataFile);
                    }
                    if ($scope.chosenHWMList.length > 0) {
                        var ind = $scope.chosenHWMList.map(function (hwm) { return hwm.HWM_ID; }).indexOf(aHWM.HWM_ID); //not working:: $scope.chosenHWMList.indexOf(aHWM);
                        $scope.chosenHWMList.splice(ind, 1);
                    }
                }
            };
            
            //they want to see the details of the hwm, or not see it anymore
            $scope.showHWMDetails = function (h) {
                $scope.hwmDetail = true; $scope.sensorDetail = false; $scope.dataFileDetail = false;
                $scope.HWMBox = h;
            };

            //use this hwm to populate peak parts (primary hwm for determining peak)
            $scope.primaryHWM = function (h) {
                var setPrimHWM = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Set as Primary</h3></div>' +
                        '<div class="modal-body"><p>Are you sure you want to set this as the Primary HWM? Doing so will populate the Peak Date (not including time), Stage, Vertical Datum and Height Above Ground.</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="SetIt()">Set as Primary</button><button class="btn btn-primary" ng-click="cancel()">Cancel</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        $scope.SetIt = function () {
                            $uibModalInstance.close('Yes');
                        };
                    }],
                    size: 'sm'
                });
                setPrimHWM.result.then(function (setIt) {
                    if (setIt == 'Yes') {
                        $scope.aPeak.PEAK_DATE.date = new Date(h.FLAG_DATE);
                        $scope.aPeak.PEAK_STAGE = h.ELEV_FT;
                        $scope.aPeak.VDATUM_ID = h.VDATUM_ID;
                        $scope.aPeak.HEIGHT_ABOVE_GND = h.HEIGHT_ABV_GND;
                    }
                });
            };
            //#endregion

            $scope.closeDetail = function () {
                $scope.sensorDetail = false; $scope.hwmDetail = false; $scope.dataFileDetail = false;
            };

            //#region sensor list stuff
            //add or remove a sensor from the list of chosen sensor for determining this peak
            $scope.addDataFile = function (datafile) {
                var dataFile = {};                
                DATA_FILE.query({ id: datafile.DATA_FILE_ID }).$promise.then(function (response) {
                    dataFile = response;
                    if (datafile.selected === true) {
                        $scope.chosenDFList.push(dataFile);
                    } else {
                        if ($scope.aPeak.PEAK_SUMMARY_ID !== undefined) {
                            //edit.. need to store removed ones for PUT
                            $scope.removedChosenDFList.push(dataFile);
                        }
                        if ($scope.chosenDFList.length > 0) {
                            var ind = $scope.chosenDFList.map(function (df) { return df.DATA_FILE_ID; }).indexOf(datafile.DATA_FILE_ID); //not working:: $scope.chosenDFList.indexOf(s);
                            $scope.chosenDFList.splice(ind, 1);
                        }
                    }
                });
            };

            //they want to see the details of the sensor, or not see it anymore
            $scope.showSensorDetails = function (s) {
                $scope.sensorDetail = true; $scope.hwmDetail = false; $scope.dataFileDetail = false;
                $scope.SensorBox = s;
            };
            //they want to see the details of the datafile, or not see it anymore
            $scope.showDataFileDetails = function (f) {
                DATA_FILE.query({ id: f.DATA_FILE_ID }, function success(response) {
                    $scope.DFBox = response;
                    $scope.DFBox.filePath = f.PATH;
                    $scope.DFBox.fileID = f.FILE_ID;
                    $scope.DFBox.fileDesc = f.DESCRIPTION;
                    $scope.DFBox.processedBy = allMembers.filter(function (m) { return m.MEMBER_ID == response.PROCESSOR_ID; })[0];
                    $scope.DFBox.nwisFile = f.IS_NWIS == 1 ? true : false;
                    $scope.DFBox.fileURL = f.FILE_URL;
                    $scope.dataFileDetail = true; $scope.hwmDetail = false; $scope.sensorDetail = false;
                });
                
                
            };
            //use this hwm to populate peak parts (primary sensor for determining peak)
            /*'<div class="modal-body"><p>Are you sure you want to set this as the Primary Data file? Doing so will populate the Peak Date, Time and time zone, Stage, Vertical Datum and Height Above Ground.</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="SetIt()">Set as Primary</button><button class="btn btn-primary" ng-click="cancel()">Cancel</button></div>',*/
            $scope.primaryDataFile = function (f) {
                var setPrimHWM = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Set as Primary</h3></div>' +
                        '<div class="modal-body"><p>Are you sure you want to set this as the Primary Data file?</p><p>(Coming soon: Script processing to populate the Peak date, time and time zone, Stage, Vertical Datum and Height above ground)</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="SetIt()">Set as Primary</button><button class="btn btn-primary" ng-click="cancel()">Cancel</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };
                        $scope.SetIt = function () {
                            $uibModalInstance.close('Yes');
                        };
                    }],
                    size: 'sm'
                });
                setPrimHWM.result.then(function (setIt) {
                    if (setIt == 'Yes') {
                        //$scope.aPeak.PEAK_DATE.date = h.FLAG_DATE;
                        //$scope.aPeak.PEAK_STAGE = h.ELEV_FT;
                        //$scope.aPeak.VDATUM_ID = h.VDATUM_ID
                        //$scope.aPeak.HEIGHT_ABOVE_GND = h.HEIGHT_ABV_GND;
                    }
                });
            };
            //#endregion

            //save Peak
            $scope.savePeak = function (valid) {
                if (valid) {
                    var updatedPeak = {};                       
                    var datetime = new Date($scope.aPeak.PEAK_DATE.date.getFullYear(), $scope.aPeak.PEAK_DATE.date.getMonth(), $scope.aPeak.PEAK_DATE.date.getDate(),
                        $scope.aPeak.PEAK_DATE.time.getHours(), $scope.aPeak.PEAK_DATE.time.getMinutes(), $scope.aPeak.PEAK_DATE.time.getSeconds());
                    $scope.aPeak.PEAK_DATE = datetime;
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PEAK.update({ id: $scope.aPeak.PEAK_SUMMARY_ID }, $scope.aPeak).$promise.then(function (response) {
                        //update hwms/datafiles used
                        //remove those unchosen
                        if ($scope.removedChosenDFList.length > 0) {
                            for (var remd = 0; remd < $scope.removedChosenDFList.length; remd++) {
                                $scope.removedChosenDFList[remd].PEAK_SUMMARY_ID = null;
                                DATA_FILE.update({ id: $scope.removedChosenDFList[remd].DATA_FILE_ID }, $scope.removedChosenDFList[remd]).$promise;
                            }
                        }
                        if ($scope.removedChosenHWMList.length > 0) {
                            for (var remh = 0; remh < $scope.removedChosenHWMList.length; remh++) {
                                $scope.removedChosenHWMList[remh].PEAK_SUMMARY_ID = null;
                                HWM.update({ id: $scope.removedChosenHWMList[remh].DATA_FILE_ID }, $scope.removedChosenHWMList[remh]).$promise;
                            }
                        }
                        //add those chosen
                        for (var addh = 0; addh < $scope.chosenHWMList.length; addh++) {
                            $scope.chosenHWMList[addh].PEAK_SUMMARY_ID = response.PEAK_SUMMARY_ID;
                            HWM.update({ id: $scope.chosenHWMList[addh].HWM_ID }, $scope.chosenHWMList[addh]).$promise;
                        } //end foreach hwm save
                        for (var addd = 0; addd < $scope.chosenDFList.length; addd++) {
                            $scope.chosenDFList[addd].PEAK_SUMMARY_ID = response.PEAK_SUMMARY_ID;
                            DATA_FILE.update({ id: $scope.chosenDFList[addd].DATA_FILE_ID }, $scope.chosenDFList[addd]).$promise;
                        } //end foreach hwm save
                        toastr.success("Peak updated");
                        updatedPeak = response;
                        var sendBack = [updatedPeak, 'updated'];
                        $uibModalInstance.close(sendBack);
                    });
                }
            };//end save()

            //data file ID to get df and remove peakid for peakDelete
            var updateDFwoPeakID = function (df_id) {
                //get it, change peak id, put it back
                DATA_FILE.query({ id: df_id }).$promise.then(function (res) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    res.PEAK_SUMMARY_ID = null;
                    DATA_FILE.update({ id: res.DATA_FILE_ID }, res).$promise;
                });
            };
            //delete Peak
            $scope.deletePeak = function () {
                var deletePeakMdl = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Remove Peak</h3></div>' +
                        '<div class="modal-body"><p>Are you sure you want to delete this Peak?</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="Ok()">OK</button><button class="btn btn-warning" ng-click="cancel()">Cancel</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.Ok = function () {
                            $uibModalInstance.close();
                        };
                        $scope.cancel = function () {
                            $uibModalInstance.dismiss();
                        };                       
                    }],
                    size: 'sm'
                });               

                deletePeakMdl.result.then(function () {
                    var peakID = $scope.aPeak.PEAK_SUMMARY_ID;
                    var datetime = new Date($scope.aPeak.PEAK_DATE.date.getFullYear(), $scope.aPeak.PEAK_DATE.date.getMonth(), $scope.aPeak.PEAK_DATE.date.getDate(),
                        $scope.aPeak.PEAK_DATE.time.getHours(), $scope.aPeak.PEAK_DATE.time.getMinutes(), $scope.aPeak.PEAK_DATE.time.getSeconds());
                    $scope.aPeak.PEAK_DATE = datetime;
                    //delete the peak and then PUT all hwm and df that have peakID
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PEAK.delete({ id: $scope.aPeak.PEAK_SUMMARY_ID }).$promise.then(function () {
                        //for each $scope.eventSiteSensors for each files if file.selected == true.. PUT and remove PEAKID
                        for (var i = 0; i < $scope.eventSiteSensors.length; i++) {
                            var thisS = $scope.eventSiteSensors[i];
                            for (var f = 0; f < thisS.files.length; f++) {
                                var thisF = thisS.files[f];
                                if (thisF.selected)
                                    updateDFwoPeakID(thisF.DATA_FILE_ID);
                            }
                        }
                        //for each $scope.eventSiteHWMs if h.selected == true.. PUT and remove PEAKID 
                        
                        for (var h = 0; h < $scope.eventSiteHWMs.length; h++) {
                            var thisH = $scope.eventSiteHWMs[h];
                            if (thisH.selected) {
                                //remove peakID and PUT
                                thisH.PEAK_SUMMARY_ID = null;
                                var updateThisHWM = formatSelectedHWM(thisH); //need to format it to remove all the site stuff
                                HWM.update({ id: thisH.HWM_ID }, updateThisHWM).$promise;
                            }
                        }

                        toastr.success("Peak Removed");
                        var sendBack = ["de", 'deleted'];
                        $uibModalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };

            //create Peak
            $scope.createPeak = function (valid) {
                if (valid) {
                    var createdPeak = {};
                    //format to combine the date and time back together into 1 date object
                    var datetime = new Date($scope.aPeak.PEAK_DATE.date.getFullYear(), $scope.aPeak.PEAK_DATE.date.getMonth(), $scope.aPeak.PEAK_DATE.date.getDate(),
                       $scope.aPeak.PEAK_DATE.time.getHours(), $scope.aPeak.PEAK_DATE.time.getMinutes(), $scope.aPeak.PEAK_DATE.time.getSeconds());
                    $scope.aPeak.PEAK_DATE = datetime;
                    dealWithTimeStampb4Send(); //UTC or local?

                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    PEAK.save($scope.aPeak).$promise.then(function (response) {
                        createdPeak = response;
                        //update the chosen hwms/data files with peak id
                        for (var h = 0; h < $scope.chosenHWMList.length; h++) {
                            $scope.chosenHWMList[h].PEAK_SUMMARY_ID = response.PEAK_SUMMARY_ID;
                            HWM.update({ id: $scope.chosenHWMList[h].HWM_ID }, $scope.chosenHWMList[h]).$promise;
                        } //end foreach hwm save
                        for (var d = 0; d < $scope.chosenDFList.length; d++) {
                            $scope.chosenDFList[d].PEAK_SUMMARY_ID = response.PEAK_SUMMARY_ID;
                            DATA_FILE.update({ id: $scope.chosenDFList[d].DATA_FILE_ID }, $scope.chosenDFList[d]).$promise;
                        } //end foreach hwm save

                        toastr.success("Peak created");
                        var sendBack = [createdPeak, 'created'];
                        $uibModalInstance.close(sendBack);
                    });
                }
            };//end create()
      
            $scope.showIncompleteDFInfo = function () {
                var incompleteModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Incomplete Data File</h3></div>' +
                        '<div class="modal-body"><p>All RDGs, Met Station, and Rain Gage sensors require data file information in order to use as primary in the Peak summary.</p>' + 
                        '<p>Please revisit the Retrieved Sensor and click on NWIS Data Connection to add a link to the NWIS data if you want to use as primary.</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="Ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.Ok = function () {
                            $uibModalInstance.dismiss();
                        };
                    }],
                    size: 'sm'
                });
            };
            $scope.showIncompleteHWMInfo = function () {
                var incompleteModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Incomplete HWM</h3></div>' +
                        '<div class="modal-body"><p>Survey date and elevation are required in order to use as primary in the Peak summary.</p>' +
                        '<p>Please revisit the HWM and add Survey date and elevation if you want to use as primary.</p><p>The HWM can be used for interpreation withouth a final elevation.</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="Ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.Ok = function () {
                            $uibModalInstance.dismiss();
                        };
                    }],
                    size: 'sm'
                });
            };
            $scope.showRetrieveInfo = function () {
                var goRetrieveModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Deployed Sensor</h3></div>' +
                        '<div class="modal-body"><p>This senosr needs to be retrieved before a Peak can be created.</p></div>' +
                        '<div class="modal-footer"><button class="btn btn-primary" ng-click="Ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.Ok = function () {
                            $uibModalInstance.dismiss();
                        };
                    }],
                    size: 'sm'
                });
            };
        }]); //end HWM
})();