(function () {
    "use strict";

    //look up common service module, and register the new factory with that module 
    var STNResource = angular.module('STNResource', ['ngResource']);
    var rootURL = "https://stntest.wim.usgs.gov/STNServices2";
   

    //#region AGENCY
    STNResource.factory('AGENCY', ['$resource', function ($resource) {
        return $resource(rootURL + '/Agencies/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of AGENCY    

    //#region CONTACT_TYPE
    STNResource.factory('CONTACT_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/ContactTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of CONTACT_TYPE

    //#region CONTACT
    STNResource.factory('CONTACT', ['$resource', function ($resource) {
        return $resource(rootURL + '/Contacts/:id.json',
            {}, {
                query: {},
                getContactModel: {method: 'GET', isArray: true },
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                addReportContact: {method: 'POST', cache: false, isArray: false, url: rootURL + '/Contacts/AddReportContact'},
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of CONTACT

    //#region COUNTIES
    STNResource.factory('COUNTIES', ['$resource', function ($resource) {
        return $resource(rootURL + '/Counties/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of COUNTIES

    //#region DATA_FILE
    STNResource.factory('DATA_FILE', ['$resource', function ($resource) {
        return $resource(rootURL + '/DataFiles/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getDFApproval: { method: 'GET', cache: false, isArray: false, url: rootURL + '/DataFiles/:id/Approval.json' },
                getUnapprovedDFs: { method: 'GET', isArray: true, cache: false }, //?IsApproved={approved}&Event={eventId}&Processor={memberId}&State={state}
                approveDF: { method: 'POST', cache: false, isArray: false, params: { id: '@id' }, url: rootURL + '/datafiles/:id/Approve.json' }, //posts an APPROVAL, updates the data file with approval_id and returns APPROVAL
                approveNWISDF: { method: 'POST', cache: false, isArray: false, params: { id: '@id' }, url: rootURL + '/datafiles/:id/NWISApprove.json' }, //posts an APPROVAL (using EventCoord), updates the data file with approval_id and returns APPROVAL
                unApproveDF: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/datafiles/:id/Unapprove.json' }, //posts an APPROVAL, updates the datafile with approval_id and returns APPROVAL
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of DATA_FILE

    //#region DEPLOYMENT_PRIORITY
    STNResource.factory('DEPLOYMENT_PRIORITY', ['$resource', function ($resource) {
        return $resource(rootURL + '/DeploymentPriorities/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of DEPLOYMENT_PRIORITY

    //#region DEPLOYMENT_TYPE
    STNResource.factory('DEPLOYMENT_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/DeploymentTypes/:id.json',
            {}, {
                query: {},
                getDepSensType: {method: 'GET', isArray: false, url: rootURL + '/DeploymentTypes/:id/SensorType.json'},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of DEPLOYMENT_TYPE

    //#region EVENT_STATUS
    STNResource.factory('EVENT_STATUS', ['$resource', function ($resource) {
        return $resource(rootURL + '/EventStatus/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of EVENT_STATUS

    //#region EVENT_TYPE
    STNResource.factory('EVENT_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/EventTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of EVENT_TYPE

    //#region FILE_TYPE
    STNResource.factory('FILE_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/FileTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of FILE_TYPE
   
    //#region EVENT
    STNResource.factory('EVENT', ['$resource', function ($resource) {
        return $resource(rootURL + '/Events/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getEventSites: {method: 'GET', isArray:true, url: rootURL + '/Events/:id/Sites.json'},
                getFilteredEvents: {method: 'GET', isArray: true, url: rootURL + '/Events/FilteredEvents.json'}, //?Date: null, Type: 0, State: null
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of EVENT

    //#region FILE
    STNResource.factory('FILE', ['$resource', function ($resource) {
        return $resource(rootURL + '/Files/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getFileItem: { method: 'GET', isArray: false, url: rootURL + '/Files/:id/Item' },
                update: { method: 'PUT', cache: false, isArray: false },
                uploadFile: { method: 'POST', url: rootURL + '/Files/bytes', headers: { 'Content-Type': undefined }, transformRequest: angular.identity, cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of FILE

    //#region HORIZONTAL_COLL_METHODS
    STNResource.factory('HORIZONTAL_COLL_METHODS', ['$resource', function ($resource) {
        return $resource(rootURL + '/HorizontalMethods/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of HORIZONTAL_COLL_METHODS

    //#region HORIZONTAL_DATUM
    STNResource.factory('HORIZONTAL_DATUM', ['$resource', function ($resource) {
        return $resource(rootURL + '/HorizontalDatums/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of HORIZONTAL_DATUM

    //#region HOUSING_TYPE
    STNResource.factory('HOUSING_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/HousingTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of HOUSING_TYPE

    //#region HWM
    STNResource.factory('HWM', ['$resource', function ($resource) {
        return $resource(rootURL + '/hwms/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getFilteredHWMs: { method: 'GET', isArray: true, url: rootURL + '/HWMs/FilteredHWMs.json' }, //Event={eventIds}&EventType={eventTypeIDs}&EventStatus={eventStatusID}&States={states}&County={counties}&HWMType={hwmTypeIDs}&HWMQuality={hwmQualIDs}&HWMEnvironment={hwmEnvironment}&SurveyComplete={surveyComplete}&StillWater={stillWater}
                getUnapprovedHWMs: { method: 'GET', cache: false }, //IsApproved={'true'/'false'}&Event={eventId}&Member={memberId}&State={state}
                getHWMApproval: {method: 'GET', cache: false, isArray: false, url: rootURL + '/hwms/:id/Approval.json'},
                approveHWM: { method: 'POST', cache: false, isArray: false, params: { id: '@id' }, url: rootURL + '/hwms/:id/Approve.json' }, //posts an APPROVAL, updates the HWM with approval_id and returns APPROVAL
                unApproveHWM: { method: 'DELETE', cache: false, isArray: false, url: rootURL + '/hwms/:id/Unapprove.json' }, //posts an APPROVAL, updates the HWM with approval_id and returns APPROVAL
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of HWM

    //#region HWM_Service
    STNResource.factory('HWM_Service', [function () {
        //when hwm is created or deleted, this gets updated so that filesCtrl will update it's list of siteHWMs
        var allSiteHWMs = [];
        return {
            getAllSiteHWMs: function () {
                return allSiteHWMs;
            },
            setAllSiteHWMs: function (sh) {
                allSiteHWMs = sh;               
            }
        };
    }]);
    //#endregion of HWM_Service

    //#region HWM_QUALITY
    STNResource.factory('HWM_QUALITY', ['$resource', function ($resource) {
        return $resource(rootURL + '/HWMQualities/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of HWM_QUALITY

    //#region HWM_TYPE
    STNResource.factory('HWM_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/HWMTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of HWM_TYPE

    //#region INSTRUMENT
    STNResource.factory('INSTRUMENT', ['$resource', function ($resource) {
        return $resource(rootURL + '/instruments/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true, url: rootURL + '/Instruments/GetAll.json' },
                getstatusInstruments: { method: 'GET', isArray: true, url: rootURL + '/Instruments.json/' }, //CurrentStatus: 1, Event: $scope.evID 
                getFullInstrument: { method: 'GET', url: rootURL + '/Instruments/:id/FullInstrument.json' }, //gets instrument and it's stats together
                getInstrumentStatus: { method: 'GET', url: rootURL + '/Instruments/:id/InstrumentStatus.json' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of INSTRUMENT

    //#region Instrument_Service
    STNResource.factory('Instrument_Service', [function () {
        //when hwm is created or deleted, this gets updated so that filesCtrl will update it's list of siteHWMs
        var allSiteSensors = [];
        return {
            getAllSiteSensors: function () {
                return allSiteSensors;
            },
            setAllSiteSensors: function (ss) {
                allSiteSensors = ss;
            }
        };
    }]);
    //#endregion of Instrument_Service

    //#region INSTRUMENT_STATUS
    STNResource.factory('INSTRUMENT_STATUS', ['$resource', function ($resource) {
        return $resource(rootURL + '/InstrumentStatus/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },               
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of INSTRUMENT

    //#region INST_COLL_CONDITION
    STNResource.factory('INST_COLL_CONDITION', ['$resource', function ($resource) {
        return $resource(rootURL + '/InstrCollectConditions/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of INST_COLL_CONDITION

    //#region LANDOWNER_CONTACT
    STNResource.factory('LANDOWNER_CONTACT', ['$resource', function ($resource) {
        return $resource(rootURL + '/LandOwners/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of LANDOWNER_CONTACT

    //#region Map_Site
    STNResource.factory('Map_Site', ['SITE', '$rootScope', '$cookies', function (SITE, $rootScope,$cookies) {
        var MapSiteParts = [];

        return {
            getMapSiteParts: function () {
                return MapSiteParts;
            },
            setMapSiteParts: function (siteId) {
                MapSiteParts = [];
                SITE.query({ id: siteId }).$promise.then(function (response) {
                    MapSiteParts.push(response);
                    SITE.getSitePeaks({ id: siteId }).$promise.then(function (pResponse) {
                        MapSiteParts.push(pResponse);
                        $rootScope.$broadcast('mapSiteClickResults', MapSiteParts);
                        //$rootScope.stateIsLoading.showLoading = false;
                    });
                });                
            }
        };
    }]);
    //#endregion of Map_Site

    //#region Map_filter
    STNResource.factory('Map_Filter', [ '$rootScope', function ($rootScope) {
        var filteredSites = [];

        return {
            // getFilteredSites: function () {
            //     return filteredSites;
            // },
            setFilteredSites: function (sitesArray) {
                filteredSites = sitesArray;
                $rootScope.$broadcast('filterSitesClick', filteredSites);
            }
        };
    }]);
    //#endregion of Map_Filter

    //#region MARKER
    STNResource.factory('MARKER', ['$resource', function ($resource) {
        return $resource(rootURL + '/Markers/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of MARKER

    //#region MEMBER
    STNResource.factory('MEMBER', ['$resource', function ($resource) {
        return $resource(rootURL + '/Members/:id.json',
            {}, {
                query: { },   
                getAll: { method: 'GET', isArray: true },
                getRoleMembers: { method: 'GET', isArray: true, url: rootURL + '/Roles/:roleId/Members.json' },
                getEventPeople: { method: 'GET', isArray: true, url: rootURL + '/Events/:Eventid/Members.json' },
                
                changePW: { method: 'GET', isArray: false, url: rootURL + '/Members.json' },
                addMember: {method: 'POST', cache: false, isArray: false, url: rootURL + '/Members/:pass/addMember'},
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                deleteMember: { method: 'DELETE', cache: false, isArray: false,url: rootURL + '/Members/:id' }
            });
    }]);
    //#endregion of MEMBER

    //#region NETWORK_NAME
    STNResource.factory('NETWORK_NAME', ['$resource', function ($resource) {
        return $resource(rootURL + '/NetworkNames/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of NETWORK_NAME

    //#region NETWORK_TYPE
    STNResource.factory('NETWORK_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/NetworkTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of NETWORK_TYPE
    
    //#region OBJECTIVE_POINT
    STNResource.factory('OBJECTIVE_POINT', ['$resource', function ($resource) {
        return $resource(rootURL + '/ObjectivePoints/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                getOPFiles: {method: 'GET', isArray:true, url: rootURL + "/ObjectivePoints/:id/Files"},
                createOPControlID: { method: 'POST', cache: false, isArray: false, url: rootURL + "/ObjectivePoints/:id/AddOPControls" },
                getOPControls: { method: 'GET', cache: false, isArray: true, url: rootURL + "/ObjectivePoints/:id/OPControls.json" },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of OBJECTIVE_POINT

    //#region OP_CONTROL_IDENTIFIER
    STNResource.factory('OP_CONTROL_IDENTIFIER', ['$resource', function ($resource) {
        return $resource(rootURL + '/OPControlIdentifiers/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of OP_CONTROL_IDENTIFIER

    //#region OP_MEASURE
    STNResource.factory('OP_MEASURE', ['$resource', function ($resource) {
        return $resource(rootURL + '/OPMeasurements/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getInstStatOPMeasures: { method: 'GET', isArray: true, url: rootURL + '/InstrumentStatus/:instrumentStatusId/InstrMeasurements' },
                getDatumLocationOPMeasures: { method: 'GET', isArray: true, url: rootURL + '/ObjectivePoints/:objectivePointId/OPMeasurements' },
                update: { method: 'PUT', cache: false, isArray: false },
                addInstStatMeasure: { method: 'POST', cache: false, isArray: false, url: rootURL + '/InstrumentStatus/:instrumentStatusId/AddInstrMeasurement' },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of OP_MEASURE

    //#region OP_QUALITY
    STNResource.factory('OP_QUALITY', ['$resource', function ($resource) {
        return $resource(rootURL + '/ObjectivePointQualities/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of OP_QUALITY

    //#region OP_TYPE
    STNResource.factory('OP_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/OPTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of OP_TYPE

    //#region PEAK
    STNResource.factory('PEAK', ['$resource', function ($resource) {
        return $resource(rootURL + '/PeakSummaries/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getPeakSummaryDFs: { method: 'GET', isArray: true, cache: false, url: rootURL + '/PeakSummaries/:id/DataFiles.json' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of PEAK

    //#region REPORT
    STNResource.factory('REPORT', ['$resource', function ($resource) {
        return $resource(rootURL + '/ReportingMetrics/:id.json',
            {}, {
                query: {},
                getReportByEvSt: { method: 'GET', isArray: true },
                getDailyReportTots: {method: 'GET', url: rootURL + '/ReportingMetrics/DailyReportTotals'},
                getMemberReports: { method: 'GET', isArray: true, url: rootURL + '/Members/:memberId/Reports.json' },
                getFilteredReports: { method: 'GET', isArray: true, url: rootURL + '/ReportingMetrics/FilteredReports.json' },
                getReportwithContacts: {method: 'GET', isArray: true, url: rootURL + '/ReportResource/FilteredReportModel.json'},
                getReportsCSV: {method: 'GET', url: rootURL + '/ReportingMetrics/FilteredReports.csv'},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of REPORT

    //#region ROLE
    STNResource.factory('ROLE', ['$resource', function ($resource) {
        return $resource(rootURL + '/Roles/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true }                
            });
    }]);
    //#endregion of ROLE

    //#region SENSOR_BRAND
    STNResource.factory('SENSOR_BRAND', ['$resource', function ($resource) {
        return $resource(rootURL + '/SensorBrands/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of SENSOR_BRAND

    //#region SENSOR_DEPLOYMENT
    STNResource.factory('SENSOR_DEPLOYMENT', ['$resource', function ($resource) {
        return $resource(rootURL + '/SensorDeployments/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },               
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of SENSOR_DEPLOYMENT

    //#region SENSOR_TYPE
    STNResource.factory('SENSOR_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/SensorTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                getSensorDeploymentTypes: { method: 'GET', isArray: true, url: rootURL + '/SensorTypes/:id/DeploymentTypes.json' },
                addSensorDeploymentType: {method: 'POST', cache: false, isArray: true, url: rootURL + '/SensorTypes/:id/addDeploymentType'},
                removeSensorDeploymentType: { method: 'POST', isArray: false, url: rootURL + '/SensorTypes/:id/removeDeploymentType' },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of SENSOR_TYPE

    //#region SITE
    STNResource.factory('SITE', ['$resource', function ($resource) {
        return $resource(rootURL + '/Sites/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                //landowner
                getSiteLandOwner: { method: 'GET', url: rootURL + '/Sites/:id/LandOwner.json' },
                //Site NetworkTypes
                getSiteNetworkTypes: { method: 'GET', isArray: true, url: rootURL + '/sites/:id/networkTypes.json' },
                postSiteNetworkType: {method: 'POST', cache: false, isArray:true, url: rootURL + '/sites/:id/AddNetworkType'},
                deleteSiteNetworkType: { method: 'POST', cache: false, isArray: false, url: rootURL + '/sites/:id/removeNetworkType' },
                //Site Network Names
                getSiteNetworkNames: { method: 'GET', isArray: true, url: rootURL + '/sites/:id/networkNames.json' },
                postSiteNetworkName: { method: 'POST', cache: false, isArray: true, url: rootURL + '/sites/:id/AddNetworkName' },
                deleteSiteNetworkName: { method: 'POST', cache: false, isArray: false, url: rootURL + '/sites/:id/removeNetworkName' },
                //Site Housings
                getSiteHousings: { method: 'GET', isArray: true, url: rootURL + '/sites/:id/SiteHousings.json' },
                postSiteHousing: {method: 'POST', cache: false, isArray:true, url: rootURL + '/site/:id/AddSiteSiteHousing.json'},
                //Site Parts
                getSiteOPs: { method: 'GET', isArray: true, url: rootURL + '/Sites/:id/ObjectivePoints.json' },
                getSiteSensors: { method: 'GET', isArray: true, url: rootURL + '/Sites/:id/FullInstrumentList.json' }, //all instruments and their stats together
                getSiteHWMs: { method: 'GET', isArray: true, url: rootURL + '/Sites/:id/HWMs.json' },
                getSiteFiles: { method: 'GET', isArray: true, url: rootURL + '/Sites/:id/Files.json' },
                getSitePeaks: { method: 'GET', isArray: true, url: rootURL + '/Sites/:id/PeakSummaryView.json' },
                //just the Site
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of SITE

    //#region Site_Files
    STNResource.factory('Site_Files', ['$cookies', '$rootScope', function ($cookies, $rootScope) {
        var allSiteFiles = [];
        return {
            getAllSiteFiles: function () {
                return allSiteFiles;
            },
            setAllSiteFiles: function (sf){
                allSiteFiles = sf;
                $rootScope.$broadcast('siteFilesUpdated', allSiteFiles);                
            }
        };
    }]);
    //#endregion of Site_Files

    //#region STATE
    STNResource.factory('STATE', ['$resource', function ($resource) {
        return $resource(rootURL + '/States/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of STATE

    //#region SITE_HOUSING
    STNResource.factory('SITE_HOUSING', ['$resource', function ($resource) {
        return $resource(rootURL + '/SiteHousings/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of SITE_HOUSING

    //#region STATUS_TYPE
    STNResource.factory('STATUS_TYPE', ['$resource', function ($resource) {
        return $resource(rootURL + '/StatusTypes/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of STATUS_TYPE
  
    //#region SOURCE
    STNResource.factory('SOURCE', ['$resource', function ($resource) {
        return $resource(rootURL + '/Sources/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of SOURCE

    //#region VERTICAL_COLL_METHOD
    STNResource.factory('VERTICAL_COLL_METHOD', ['$resource', function ($resource) {
        return $resource(rootURL + '/VerticalMethods/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of VERTICAL_COLL_METHOD

    //#region VERTICAL_DATUM
    STNResource.factory('VERTICAL_DATUM', ['$resource', function ($resource) {
        return $resource(rootURL + '/VerticalDatums/:id.json',
            {}, {
                query: {},
                getAll: { method: 'GET', isArray: true },
                update: { method: 'PUT', cache: false, isArray: false },
                save: { method: 'POST', cache: false, isArray: false },
                delete: { method: 'DELETE', cache: false, isArray: false }
            });
    }]);
    //#endregion of VERTICAL_DATUM

    //#region Login
    STNResource.factory('Login', ['$resource', function ($resource) {
        return $resource(rootURL + '/login',
            {}, {
                login: { method: 'GET', cache: false, isArray: false }
            });
    }]);
    //#endregion of Login

})();