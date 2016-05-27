(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('fileCtrl', ['$scope', '$cookies', '$location', '$state', '$http', 'SERVER_URL', 'Site_Files', 'HWM_Service', 'Instrument_Service', '$uibModal', '$filter', '$timeout', 'thisSite', 'thisSiteFiles', 'allFileTypes', 'allAgencies', 'thisSiteSensors', 'thisSiteOPs', 'thisSiteHWMs', 'FILE', 'DATA_FILE', 'MEMBER', 'SOURCE',
        function ($scope, $cookies, $location, $state, $http, SERVER_URL, Site_Files, HWM_Service, Instrument_Service, $uibModal, $filter, $timeout, thisSite, thisSiteFiles, allFileTypes, allAgencies, thisSiteSensors, thisSiteOPs, thisSiteHWMs, FILE, DATA_FILE, MEMBER, SOURCE) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                $scope.serverURL = SERVER_URL;
                $scope.siteHWMs = thisSiteHWMs; //HWM_Service.getAllSiteHWMs(); //if create a new one, then add a file to it.. doesn't show in fileList because this doesn't have that new hwm yet..
                $scope.siteSensors = thisSiteSensors;
                //include if HWM, Instrument, Data File or OP File for each               
                for (var sf = 0; sf < thisSiteFiles.length; sf++) {
                    var whatKindaFile = '';
                    if (thisSiteFiles[sf].HWM_ID > 0 && thisSiteFiles[sf].HWM_ID !== null) {
                        whatKindaFile = "HWM File";
                    }
                    if (thisSiteFiles[sf].DATA_FILE_ID > 0 && thisSiteFiles[sf].DATA_FILE_ID !== null) {
                        whatKindaFile = "DataFile File";
                    }
                    if (thisSiteFiles[sf].INSTRUMENT_ID > 0 && thisSiteFiles[sf].INSTRUMENT_ID !== null) {
                        whatKindaFile = "Sensor File";
                        var thisIns = thisSiteSensors.filter(function (s) { return s.Instrument.INSTRUMENT_ID == thisSiteFiles[sf].INSTRUMENT_ID; })[0];
                        thisSiteFiles[sf].typeName = thisIns.Instrument.SERIAL_NUMBER;
                    }
                    if (thisSiteFiles[sf].OBJECTIVE_POINT_ID > 0 && thisSiteFiles[sf].OBJECTIVE_POINT_ID !== null) {
                        whatKindaFile = "Objective Point File";
                        thisSiteFiles[sf].typeName = thisSiteOPs.filter(function (op) { return op.OBJECTIVE_POINT_ID == thisSiteFiles[sf].OBJECTIVE_POINT_ID; })[0].NAME;
                    }
                    if (whatKindaFile === '') whatKindaFile = "Site File";
                    thisSiteFiles[sf].fileBelongsTo = whatKindaFile;
                }
                Site_Files.setAllSiteFiles(thisSiteFiles);//, $scope.siteHWMs, $scope.siteSensors);
                $scope.SiteFiles = Site_Files.getAllSiteFiles();
                
                //if files are added/edited, deleted from other parts (objective Points, sensors, hwms), make sure if event is chosen to update siteFiles accordingly
                $scope.$on('siteFilesUpdated', function (event, sitefiles) {                    
                    if ($cookies.get('SessionEventID') !== undefined) {
                        $scope.siteHWMs = HWM_Service.getAllSiteHWMs(); $scope.siteSensors = Instrument_Service.getAllSiteSensors();
                        //now go about updating the FileList
                        $scope.SiteFiles = sitefiles.filter(function (h) { return h.fileBelongsTo == 'Site File' || h.fileBelongsTo == 'Objective Point File'; });  //keep all site and op files
                        angular.forEach($scope.SiteFiles, function (sf){
                            if (sf.fileBelongsTo == 'Objective Point File')
                                sf.typeName =  thisSiteOPs.filter(function (op) { return op.OBJECTIVE_POINT_ID == sf.OBJECTIVE_POINT_ID; })[0].NAME;                            
                        });
                        var hwmFiles = sitefiles.filter(function (sfiles) { return sfiles.fileBelongsTo == 'HWM File'; });
                        var sensFiles = sitefiles.filter(function (sfi) { return sfi.INSTRUMENT_ID > 0 && sfi.INSTRUMENT_ID !== null; });
                        //only show files for this event (go through hwm files and match eventid
                        for (var hf = 0; hf < hwmFiles.length; hf++) {
                            for (var hwm = 0; hwm < $scope.siteHWMs.length; hwm++) {
                                if (hwmFiles[hf].HWM_ID == $scope.siteHWMs[hwm].HWM_ID && $scope.siteHWMs[hwm].EVENT_ID == $cookies.get('SessionEventID'))
                                    $scope.SiteFiles.push(hwmFiles[hf]);
                            }
                        }
                        //only show files for this event (go through sensor files and match eventid
                        for (var sf = 0; sf < sensFiles.length; sf++) {
                            for (var inst = 0; inst < $scope.siteSensors.length; inst++) {
                                if (sensFiles[sf].INSTRUMENT_ID == $scope.siteSensors[inst].Instrument.INSTRUMENT_ID && $scope.siteSensors[inst].Instrument.EVENT_ID == $cookies.get('SessionEventID')) {
                                    sensFiles[sf].typeName = $scope.siteSensors[inst].Instrument.SERIAL_NUMBER;
                                    $scope.SiteFiles.push(sensFiles[sf]);
                                }
                            }
                        }                        
                    }//end if SessionEventID !== undefined
                }, true);
                
                // watch for the session event to change and update SITE FILES DO NOT HAVE AN EVENT                
                $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                    $scope.sessionEventName = newValue !== undefined ? newValue : "All Events";
                    $scope.sessionEventExists = $scope.sessionEventName != "All Events" ? true : false;
                    if (newValue !== undefined) {
                        $scope.siteHWMs = HWM_Service.getAllSiteHWMs(); $scope.siteSensors = Instrument_Service.getAllSiteSensors();
                        //keep all site & OP Files, filter HWM, Instrument (DF files use Instrument event)
                        $scope.SiteFiles = Site_Files.getAllSiteFiles().filter(function (h) { return h.fileBelongsTo == 'Site File' || h.fileBelongsTo == 'Objective Point File'; });  //keep all site and op files
                        angular.forEach($scope.SiteFiles, function (sf) {
                            if (sf.fileBelongsTo == 'Objective Point File')
                                sf.typeName = thisSiteOPs.filter(function (op) { return op.OBJECTIVE_POINT_ID == sf.OBJECTIVE_POINT_ID; })[0].NAME;
                        });
                        var hwmFiles = Site_Files.getAllSiteFiles().filter(function (sfiles) { return sfiles.fileBelongsTo == 'HWM File'; }); 
                        var sensFiles = Site_Files.getAllSiteFiles().filter(function (sfi) { return sfi.INSTRUMENT_ID > 0 && sfi.INSTRUMENT_ID !== null; });
                        //only show files for this event (go through hwm files and match eventid
                        for (var hf = 0; hf < hwmFiles.length; hf++) {
                            for (var hwm = 0; hwm < $scope.siteHWMs.length; hwm++) {
                                if (hwmFiles[hf].HWM_ID == $scope.siteHWMs[hwm].HWM_ID && $scope.siteHWMs[hwm].EVENT_ID == $cookies.get('SessionEventID')) 
                                    $scope.SiteFiles.push(hwmFiles[hf]);
                            }
                        }
                        //only show files for this event (go through sensor files and match eventid
                        for (var sf = 0; sf < sensFiles.length; sf++) {
                            for (var inst = 0; inst < $scope.siteSensors.length; inst++) {
                                if (sensFiles[sf].INSTRUMENT_ID == $scope.siteSensors[inst].Instrument.INSTRUMENT_ID && $scope.siteSensors[inst].Instrument.EVENT_ID == $cookies.get('SessionEventID')) {
                                    sensFiles[sf].typeName = $scope.siteSensors[inst].Instrument.SERIAL_NUMBER;
                                    $scope.SiteFiles.push(sensFiles[sf]);
                                }
                            }
                        }                                       
                    } else {
                        $scope.SiteFiles = Site_Files.getAllSiteFiles();
                    }
                }, true);

                //show a modal with the larger image as a preview
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

                //create/edit a file
                $scope.showFileModal = function (FileClicked) {                    
                    var SindexClicked = $scope.SiteFiles.indexOf(FileClicked);
                    //populate all filetypes that create/edit file needs depending on what the file is attached to
                    $scope.siteFileTypes = allFileTypes.filter(function (ft) {
                        return ft.FILETYPE === 'Photo' || ft.FILETYPE === 'Historic Citation' || ft.FILETYPE === 'Field Sheets' ||
                            ft.FILETYPE === 'Level Notes' || ft.FILETYPE === 'Site Sketch' || ft.FILETYPE === 'Other' || ft.FILETYPE === 'Link' || ft.FILETYPE === 'Sketch' ||
                            ft.FILETYPE === 'Landowner Permission Form';
                    });
                    $scope.hwmFileTypes = allFileTypes.filter(function (hft){ 
                        return hft.FILETYPE === 'Photo' || hft.FILETYPE === 'Historic Citation' || hft.FILETYPE === 'Field Sheets' ||
                            hft.FILETYPE === 'Level Notes' || hft.FILETYPE === 'Other' || hft.FILETYPE === 'Link' || hft.FILETYPE === 'Sketch';
                    });
                    $scope.sensorFileTypes = allFileTypes.filter(function (sft){
                        return sft.FILETYPE === 'Photo' || sft.FILETYPE === 'Data' || sft.FILETYPE === 'Historic Citation' || sft.FILETYPE === 'Field Sheets' ||
                           sft.FILETYPE === 'Level Notes' || sft.FILETYPE === 'Other' || sft.FILETYPE === 'Link' || sft.FILETYPE === 'Sketch';
                    });
                    $scope.opFileTypes = allFileTypes.filter(function (oft) {
                        return oft.FILETYPE === 'Photo' || oft.FILETYPE === 'Field Sheets' || oft.FILETYPE === 'Level Notes' ||
                            oft.FILETYPE === 'Other' || oft.FILETYPE === 'NGS Datasheet' || oft.FILETYPE === 'Sketch';
                    });

                    //modal allFileTypes, thisFile, allMembers, agencyList, fileSite,
                    var modalInstance = $uibModal.open({
                        templateUrl: FileClicked !== 0 ? 'FILEmodal.html' : 'FileCreateModal.html',
                        controller: 'siteFileModalCtrl',
                        size: 'lg',
                        backdrop: 'static',
                        keyboard: false,
                        windowClass: 'rep-dialog',
                        resolve: {
                            fileTypeList: function () {
                                if (FileClicked !== 0) {
                                    switch (FileClicked.fileBelongsTo) {
                                        case 'HWM File':
                                            return $scope.hwmFileTypes;
                                        case 'DataFile File':
                                            return $scope.sensorFileTypes;
                                        case 'Sensor File':
                                            return $scope.sensorFileTypes;
                                        case 'Objective Point File':
                                            return $scope.opFileTypes;
                                        case 'Site File':
                                            return $scope.siteFileTypes;
                                    }
                                } else {
                                    return $scope.siteFileTypes;
                                }
                            },
                            agencyList: function (){
                                return allAgencies;
                            },
                            thisFile: function () {
                                if (FileClicked !== 0)
                                    return FileClicked;
                            },
                            fileSite: function () {
                                return thisSite;
                            },
                            allMembers: function () {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return MEMBER.getAll().$promise;
                            },
                            fileSource: function () {
                                if (FileClicked !== 0) {
                                    if (FileClicked.SOURCE_ID !== null)
                                        return SOURCE.query({id:FileClicked.SOURCE_ID}).$promise;
                                }
                            },
                            dataFile: function () {
                                if (FileClicked !== 0) {
                                    if (FileClicked.DATA_FILE_ID !== null)
                                        return DATA_FILE.query({ id: FileClicked.DATA_FILE_ID }).$promise;
                                }
                            }
                        }
                    });
                    modalInstance.result.then(function (createdFile) {
                        //is there a new file or just closed modal
                        if (createdFile[1] == 'created') {
                            $scope.SiteFiles.push(createdFile[0]);
                            Site_Files.setAllSiteFiles($scope.SiteFiles);//, $scope.siteHWMs, $scope.siteSensors);
                        }
                        if (createdFile[1] === undefined) {
                            //this is from edit -- refresh page?
                            $scope.SiteFiles[SindexClicked] = createdFile;
                            Site_Files.setAllSiteFiles($scope.SiteFiles);//, $scope.siteHWMs, $scope.siteSensors);
                        }
                        if (createdFile[1] == 'deleted') {
                            $scope.SiteFiles.splice(SindexClicked, 1); //remove from file List
                            Site_Files.setAllSiteFiles($scope.SiteFiles);//, $scope.siteHWMs, $scope.siteSensors);
                        }
                    });
                };
            }
        }]);
})();