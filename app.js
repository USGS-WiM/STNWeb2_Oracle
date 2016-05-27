(function () {
    "use strict"; 
    var app = angular.module('app',
        ['ngResource', 'ui.router', 'ngCookies', 'ui.mask', 'ui.bootstrap', 'isteven-multi-select', 'ngInputModified', 'ui.validate', 'cgBusy',
            'angular.filter', 'xeditable', 'checklist-model', 'ngFileUpload', 'STNResource', 'ui.bootstrap.datetimepicker','leaflet-directive',
            'STNControllers', 'LogInOutController', 'ModalControllers', 'SettingsControllers', 'WiM.Services', 'WiM.Event', 'wim_angular', 'angularSpinners']);
    app.constant('SERVER_URL', 'https://stntest.wim.usgs.gov/STNServices2');

    app.run(['$rootScope', '$uibModalStack', '$cookies', '$state', function ($rootScope, $uibModalStack, $cookies, $state) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") && toState.authenticate) {
                $rootScope.returnToState = toState.name;
                $rootScope.returnToStateParams = toParams.id;
                event.preventDefault();
                $state.go('entry');
            } else {
                $rootScope.stateIsLoading = { showLoading: true };
                //close all modals when changing states (site create open, want to use a nearby site or just change the url up top, close the modal too)
                $uibModalStack.dismissAll();

                if (toState.url == "/") {
                    //make username focus
                    $("#userNameFocus").focus();
                }
            }
        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, error) {
            $rootScope.stateIsLoading.showLoading = false;
        });

        $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {            
            $rootScope.stateIsLoading.showLoading = false;
            alert("Error occurred: Status" + error.status + ", " + error.statusText + ". The following request was unsuccessful: " + error.config.url + " Please refresh and try again.");
        });
        
    }]);
    //app.config(function that defines the config code. 'ui.select', 'ngSanitize','$locationProvider', $locationProvider
    app.config(['$stateProvider', '$urlRouterProvider', 
        function ($stateProvider, $urlRouterProvider){
            //if no active state, display state associated with this fragment identifier
            $urlRouterProvider.otherwise("/");

            //http://stackoverflow.com/questions/19721125/resolve-http-request-before-running-app-and-switching-to-a-route-or-state
            //http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
            $stateProvider
                //#region entryPoint
                .state("entry", {
                    url: "/",
                    templateUrl: "component/main/mainView.html",
                    controller: "mainCtrl"
                })

                //#endregion entryPoint
                .state("map", {
                    url: "/Map",
                    //templateUrl: "component/map/map.html",
                    //controller: "MapController",
                    //authenticate: true,
                    views: {
                        '': {
                            controller: 'MapController',
                            templateUrl: "component/map/map.html"
                        },
                        'mapFilters@map': {
                            templateUrl: 'component/map/mapFilters.html',
                            controller: 'MapFiltersController',
                            resolve: {
                                s: 'STATE',
                                stateList: function (s) {
                                    return s.getAll().$promise;
                                },
                                sensT: 'SENSOR_TYPE',
                                sensorTypes: function (sensT) {
                                    return sensT.getAll().$promise;
                                },
                                netwN: 'NETWORK_NAME',
                                networkNames: function (netwN) {
                                    return netwN.getAll().$promise;
                                }
                            }
                        },
                        // 'wimLegend@map': {
                        //     templateUrl: 'component/Views/Legend/legend.html',
                        //     controller: 'wimLegend'
                        // },
                        'mapSiteInfo@map': {
                            templateUrl: 'component/site/mapSiteInfoView.html', 
                            controller: 'MapSiteInfoController'
                        },
                        'mapPeaksView@map': {templateUrl: 'component/peak/mapPeaksView.html', controller: 'MapPeaksController'},
                        'mapSensorPropose@map': {
                            templateUrl: 'component/sensor/mapSensorPropose.html',
                            resolve: {
                                dt: 'DEPLOYMENT_TYPE',
                                allDeployTypes: function (dt) {
                                    return dt.getAll().$promise;
                                },
                                sd: 'SENSOR_DEPLOYMENT',
                                allSensDeps: function (sd) {
                                    return sd.getAll().$promise;
                                }
                            },
                            controller: 'MapSensorProposeController'
                        }
                    }
                })
                //#endregion

                //#region approval page
                .state("approval", {
                    url: "/Approval",
                    templateUrl: "component/approval/approval.html",
                    controller: "approvalCtrl",
                    authenticate: true,
                    resolve: {
                        s: 'STATE',
                        stateList: function (s) {
                            return s.getAll().$promise;
                        },
                        i: 'INSTRUMENT',
                        instrumentList: function (i) {
                            return i.getAll().$promise;
                        },
                        st: 'SENSOR_TYPE',
                        allSensorTypes: function (st) {
                            return st.getAll().$promise;
                        },
                        dt: 'DEPLOYMENT_TYPE',
                        allDepTypes: function (dt) {
                            return dt.getAll().$promise;
                        }
                    }
                })
                //#endregion

                //#region sitesSearch page
                .state("siteSearch", {
                    url: "/SiteSearch",
                    templateUrl: "component/siteSearch/siteSearch.html",
                    controller: "siteSearchCtrl",
                    authenticate: true,
                    resolve: {
                        s: 'STATE',
                        stateList: function (s) {
                            return s.getAll().$promise;
                        },
                        sensT: 'SENSOR_TYPE',
                        sensorTypes: function (sensT) {
                            return sensT.getAll().$promise;
                        },
                        netwN: 'NETWORK_NAME',
                        networkNames: function (netwN) {
                            return netwN.getAll().$promise;
                        }
                    }
                })
                //#endregion

                //#region reporting
                //#region reporting (abstract)
                .state("reporting", {
                    url: "/Reporting",
                    abstract: true,
                    templateUrl: "component/reporting/reporting.html",
                    controller: "reportingCtrl",
                    authenticate: true,
                    resolve: {
                        e: 'EVENT',
                        allEvents: function (e) {
                            return e.getAll().$promise;
                        },
                        state: 'STATE',
                        allStates: function (state) {
                            return state.getAll().$promise;
                        },
                        r: 'REPORT',
                        allReports: function (r) {
                            return r.getAll().$promise;
                        },
                        et: 'EVENT_TYPE',
                        allEventTypes: function (et) {
                            return et.getAll().$promise;
                        },
                        es: 'EVENT_STATUS',
                        allEventStatus: function (es) {
                            return es.getAll().$promise;
                        },
                        ag: 'AGENCY',
                        allAgencies: function (ag) {
                            return ag.getAll().$promise;
                        },
                        memberReports: function (r, $cookies) {
                            var mID = $cookies.get('mID');
                            return r.getMemberReports({ memberId: mID }).$promise;
                        }
                    }
                })
                //#endregion reporting (abstract)

                //#region reporting.reportDash
                .state("reporting.reportDash", {
                    url: "/Dashboard",
                    templateUrl: "component/reporting/reportingDashboard.html",
                    controller: "reportingDashCtrl",
                    authenticate: true,
                    resolve: {
                        r: 'REPORT',
                        allReportsAgain: function (r) {
                            return r.getAll().$promise;
                        }
                    }
                })//#endregion reporting.reportDash

                //#region reporting.SubmitReport
                .state("reporting.submitReport", {
                    url: "/SubmitReport",
                    templateUrl: "component/reporting/submitReport.html",
                    controller: "submitReportCtrl",
                    authenticate: true,
                })
                //#endregion reporting.SubmitReport

                //#region reporting.GenerateReport
                .state("reporting.generateReport", {
                    url: "/GenerateReport",
                    templateUrl: "component/reporting/generateReport.html",
                    authenticate: true,
                })//#endregion reporting.GenerateReport
                //#endregion reporting

                //#region settings 
                .state("settings", {
                    url: "/Settings",
                    templateUrl: "component/settings/settings.html",
                    controller: "settingsCtrl",
                    authenticate: true
                })
                //#endregion settings

                //#region members
                //#region members (abstract)
                .state("members", {
                    url: "/Members",
                    abstract: true,
                    template: "<div ui-view></div>",
                    controller: "memberCtrl",
                    authenticate: true,
                    resolve: {
                        r: 'ROLE',
                        allRoles: function (r) {
                            return r.getAll().$promise;
                        },
                        a: 'AGENCY',
                        allAgencies: function (a) {
                            return a.getAll().$promise;
                        }
                    }
                })//#endregion members

                //#region members.MembersList
                .state("members.MembersList", {
                    url: "/MembersList",
                    templateUrl: "component/member/membersList.html",
                    authenticate: true,
                })
                //#endregion members.MembersList

                //#region members.MemberInfo
                .state("members.MemberInfo", {
                    url: "/memberInfo/:id",
                    templateUrl: "component/member/memberInfo.html",
                    controller: "memberInfoCtrl",
                    authenticate: true,
                    resolve: {
                        m: 'MEMBER',
                        thisMember: function (m, $stateParams, $http, $cookies) {
                            var memberId = $stateParams.id;
                            if (memberId > 0) {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return m.query(
                                    { id: memberId }).$promise;
                            }
                        }
                    }
                })//#endregion members.MemberInfo
                //#endregion members

                //#region events
                //#region events
                .state("events", {
                    url: "/Events",
                    abstract: true,
                    template: "<div ui-view></div>",
                    controller: "eventCtrl",
                    authenticate: true,
                    resolve: {
                        e: 'EVENT',
                        allEvents: function (e) {
                            return e.getAll().$promise;
                        },
                        et: 'EVENT_TYPE',
                        allEventTypes: function (et) {
                            return et.getAll().$promise;
                        },
                        es: 'EVENT_STATUS',
                        allEventStats: function (es) {
                            return es.getAll().$promise;
                        },
                        m: 'MEMBER',
                        allCoordMembers: function (m, $http, $cookies) {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            return m.getRoleMembers({ roleId: 1 }).$promise;
                        }
                    }
                })//#endregion events

                //#region events.EventsList
                .state("events.EventsList", {
                    url: "/EventsList",
                    templateUrl: "component/event/eventsList.html",
                    authenticate: true
                })
                //#endregion events.EventsList

                //#region events.EventInfof
                .state("events.EventInfo", {
                    url: "/eventInfo/:id",
                    templateUrl: "component/event/eventInfo.html",
                    controller: "eventInfoCtrl",
                    authenticate: true,
                    resolve: {
                        e: 'EVENT',
                        thisEvent: function (e, $stateParams) {
                            var eventId = $stateParams.id;
                            if (eventId > 0) {
                                return e.query(
                                    { id: eventId }).$promise;
                            }
                        }
                    }
                })//#endregion events.EventInfo
                //#endregion events

                //#region resources
                //#region resources
                .state("resources", {
                    url: "/Resources",
                    abstract: true,
                    template: "<div ui-view></div>",
                    controller: "resourcesCtrl",
                    authenticate: true,
                    resolve: {
                        state: 'STATE',
                        allStates: function (state) {
                            return state.getAll().$promise;
                        },
                        ag: 'AGENCY',
                        allAgencies: function (ag) {
                            return ag.getAll().$promise;
                        },
                        c: 'CONTACT_TYPE',
                        allContactTypes: function (c) {
                            return c.getAll().$promise;
                        },
                        d: 'DEPLOYMENT_PRIORITY',
                        allDeployPriorities: function (d) {
                            return d.getAll().$promise;
                        },
                        es: 'EVENT_STATUS',
                        allEventStats: function (es) {
                            return es.getAll().$promise;
                        },
                        et: 'EVENT_TYPE',
                        allEventTypes: function (et) {
                            return et.getAll().$promise;
                        },
                        ft: 'FILE_TYPE',
                        allFileTypes: function (ft) {
                            return ft.getAll().$promise;
                        },
                        hcm: 'HORIZONTAL_COLL_METHODS',
                        allHorCollMethods: function (hcm) {
                            return hcm.getAll().$promise;
                        },
                        hd: 'HORIZONTAL_DATUM',
                        allHorDatums: function (hd) {
                            return hd.getAll().$promise;
                        },
                        ht: 'HOUSING_TYPE',
                        allHouseTypes: function (ht) {
                            return ht.getAll().$promise;
                        },
                        hq: 'HWM_QUALITY',
                        allHWMqualities: function (hq) {
                            return hq.getAll().$promise;
                        },
                        hwmT: 'HWM_TYPE',
                        allHWMtypes: function (hwmT) {
                            return hwmT.getAll().$promise;
                        },
                        icc: 'INST_COLL_CONDITION',
                        allInstCollectConditions: function (icc) {
                            return icc.getAll().$promise;
                        },
                        m: 'MARKER',
                        allMarkers: function (m) {
                            return m.getAll().$promise;
                        },
                        nn: 'NETWORK_NAME',
                        allNetworkNames: function (nn) {
                            return nn.getAll().$promise;
                        },
                        opq: 'OP_QUALITY',
                        allObjPtQualities: function (opq) {
                            return opq.getAll().$promise;
                        },
                        opt: 'OP_TYPE',
                        allObjPtTypes: function (opt) {
                            return opt.getAll().$promise;
                        },
                        sb: 'SENSOR_BRAND',
                        allSensorBrands: function (sb) {
                            return sb.getAll().$promise;
                        },
                        dt: 'DEPLOYMENT_TYPE',
                        allDeploymentTypes: function (dt) {
                            return dt.getAll().$promise;
                        },
                        sstat: 'STATUS_TYPE',
                        allStatusTypes: function (sstat) {
                            return sstat.getAll().$promise;
                        },
                        st: 'SENSOR_TYPE',
                        allSensorTypes: function (st) {
                            return st.getAll().$promise;
                        },
                        nt: 'NETWORK_TYPE',
                        allNetworkTypes: function (nt) {
                            return nt.getAll().$promise;
                        },
                        vcm: 'VERTICAL_COLL_METHOD',
                        allVerticalCollMethods: function (vcm) {
                            return vcm.getAll().$promise;
                        },
                        vd: 'VERTICAL_DATUM',
                        allVerticalDatums: function (vd) {
                            return vd.getAll().$promise;
                        }
                    }
                })//#endregion resources

                //#region resources.ResourcesList
                .state("resources.ResourcesList", {
                    url: "/ResourcesList",
                    templateUrl: "component/resources/resourcesList.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList

                //#region all lookup htmls
                //#region resources.ResourcesList.agency
                .state("resources.ResourcesList.agency", {
                    url: "/Agencies",
                    templateUrl: "component/resources/agency.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.agency

                //#region resources.ResourcesList.ContactType
                .state("resources.ResourcesList.ContactType", {
                    url: "/ContactTypes",
                    templateUrl: "component/resources/contactType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.ContactType

                //#region resources.ResourcesList.DepPriority
                .state("resources.ResourcesList.DepPriority", {
                    url: "/DeploymentPriorities",
                    templateUrl: "component/resources/deploymentPriority.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.DepPriority

                //#region resources.ResourcesList.EventStatus
                .state("resources.ResourcesList.EventStatus", {
                    url: "/EventStatus",
                    templateUrl: "component/resources/eventStatus.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.EventStatus

                //#region resources.ResourcesList.EventType
                .state("resources.ResourcesList.EventType", {
                    url: "/EventTypes",
                    templateUrl: "component/resources/eventType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.EventType

                //#region resources.ResourcesList.FileType
                .state("resources.ResourcesList.FileType", {
                    url: "/FileTypes",
                    templateUrl: "component/resources/fileType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.FileType

                //#region resources.ResourcesList.HorCollMethd
                .state("resources.ResourcesList.HorCollMethd", {
                    url: "/HorizontalCollMethods",
                    templateUrl: "component/resources/horizontalCollectionMethod.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.HorCollMethd

                //#region resources.ResourcesList.HorDatum
                .state("resources.ResourcesList.HorDatum", {
                    url: "/HorizontalDatums",
                    templateUrl: "component/resources/horizontalDatum.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.HorDatum

                //#region resources.ResourcesList.HousingType
                .state("resources.ResourcesList.HousingType", {
                    url: "/HousingTypes",
                    templateUrl: "component/resources/housingType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.HousingType

                //#region resources.ResourcesList.HWMQual
                .state("resources.ResourcesList.HWMQual", {
                    url: "/HWMQualities",
                    templateUrl: "component/resources/hwmQuality.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.HWMQual

                //#region resources.ResourcesList.HWMType
                .state("resources.ResourcesList.HWMType", {
                    url: "/HWMTypes",
                    templateUrl: "component/resources/hwmType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.HWMType

                //#region resources.ResourcesList.InstrCollCondition
                .state("resources.ResourcesList.InstrCollCondition", {
                    url: "/InstrCollConditions",
                    templateUrl: "component/resources/instrumentCollectionCondition.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.InstrCollCondition

                //#region resources.ResourcesList.Marker
                .state("resources.ResourcesList.Marker", {
                    url: "/Markers",
                    templateUrl: "component/resources/marker.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.Marker

                //#region resources.ResourcesList.NetworkNames
                .state("resources.ResourcesList.NetworkNames", {
                    url: "/NetworkNames",
                    templateUrl: "component/resources/networkNames.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.NetworkNames

                //#region resources.ResourcesList.OPquality
                .state("resources.ResourcesList.OPquality", {
                    url: "/ObjPointQualities",
                    templateUrl: "component/resources/objectivePointQuality.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.OPquality

                //#region resources.ResourcesList.OPType
                .state("resources.ResourcesList.OPType", {
                    url: "/ObjPointType",
                    templateUrl: "component/resources/objectivePointType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.OPType

                //#region resources.ResourcesList.SensorBrand
                .state("resources.ResourcesList.SensorBrand", {
                    url: "/SensorBrands",
                    templateUrl: "component/resources/sensorBrand.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.SensorBrand

                //#region resources.ResourcesList.DepType
                .state("resources.ResourcesList.SenDepType", {
                    url: "/SensorDeploymentTypes",
                    templateUrl: "component/resources/deploymentType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.DepType

                //#region resources.ResourcesList.StatusType
                .state("resources.ResourcesList.StatusType", {
                    url: "/StatusTypes",
                    templateUrl: "component/resources/statusType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.StatusType

                //#region resources.ResourcesList.SensorType
                .state("resources.ResourcesList.SensorType", {
                    url: "/SensorTypes",
                    templateUrl: "component/resources/sensorType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.SensorType

                //#region resources.ResourcesList.NetworkType
                .state("resources.ResourcesList.NetworkType", {
                    url: "/NetworkTypes",
                    templateUrl: "component/resources/networkType.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.NetworkType

                //#region resources.ResourcesList.VertCollMethod
                .state("resources.ResourcesList.VertCollMethod", {
                    url: "/VerticalCollMethods",
                    templateUrl: "component/resources/verticalCollectionMethod.html",
                    authenticate: true
                })
                //#endregion resources.ResourcesList.VertCollMethod

                //#region resources.ResourcesList.VertDatum
                .state("resources.ResourcesList.VertDatum", {
                    url: "/VerticalDatums",
                    templateUrl: "component/resources/verticalDatum.html",
                    authenticate: true
                })
            //#endregion resources.ResourcesList.VertDatum

                //#endregion all lookup htmls
                //#endregion resources

                //#region site (abstract)
                .state("site", {
                    url: "/Site/:id",
                    abstract: true,
                    params: {
                        id: null,
                        latitude: {value: null, squash: true},
                        longitude: {value: null, squash: true}
                    },
                    templateUrl: "component/site/site.html",
                    authenticate: true,
                    controller: ['$scope', '$stateParams', function ($scope, $stateParams) {
                        $scope.siteID = $stateParams.id;
                    }],
                    resolve: {
                        //#region site stuff
                        s: 'SITE',
                        thisSite: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.query({ id: $stateParams.id }).$promise;
                            }
                        },
                        latlong: function ($stateParams) {
                            if ($stateParams.latitude) {
                                var latlongarray = [$stateParams.latitude, $stateParams.longitude];
                                return latlongarray;
                            }
                        },
                        thisSiteNetworkNames: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSiteNetworkNames({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSiteNetworkTypes: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSiteNetworkTypes({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSiteHousings: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSiteHousings({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSiteOPs: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSiteOPs({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSiteSensors: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSiteSensors({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSiteHWMs: function (s, $stateParams, $http, $cookies) {
                            if ($stateParams.id > 0) {
                                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                                $http.defaults.headers.common.Accept = 'application/json';
                                return s.getSiteHWMs({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSiteFiles: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSiteFiles({ id: $stateParams.id }).$promise;
                            }
                        },
                        thisSitePeaks: function (s, $stateParams) {
                            if ($stateParams.id > 0) {
                                return s.getSitePeaks({ id: $stateParams.id }).$promise;
                            }
                        },
                        hd: 'HORIZONTAL_DATUM',
                        allHorDatums: function (hd) {
                            return hd.getAll().$promise;
                        },
                        hcm: 'HORIZONTAL_COLL_METHODS',
                        allHorCollMethods: function (hcm) {
                            return hcm.getAll().$promise;
                        },
                        st: 'STATE',
                        allStates: function (st) {
                            return st.getAll().$promise;
                        },
                        c: 'COUNTIES',
                        allCounties: function (c) {
                            return c.getAll().$promise;
                        },
                        ht: 'HOUSING_TYPE',
                        allHousingTypes: function (ht) {
                            return ht.getAll().$promise;
                        },
                        nn: 'NETWORK_NAME',
                        allNetworkNames: function (nn) {
                            return nn.getAll().$promise;
                        },
                        nt: 'NETWORK_TYPE',
                        allNetworkTypes: function (nt) {
                            return nt.getAll().$promise;
                        },
                        dt: 'DEPLOYMENT_TYPE',
                        allDeployTypes: function (dt) {
                            return dt.getAll().$promise;
                        },
                        sd: 'SENSOR_DEPLOYMENT',
                        allSensDeps: function (sd) {
                            return sd.getAll().$promise;
                        },
                        dp: 'DEPLOYMENT_PRIORITY',
                        allDeployPriorities: function (dp) {
                            return dp.getAll().$promise;
                        },
                        //#endregion site stuff
                        //#region op stuff                        
                        opt: 'OP_TYPE',
                        allOPTypes: function (opt) {
                            return opt.getAll().$promise;
                        },
                        vertDats: 'VERTICAL_DATUM',
                        allVertDatums: function (vertDats) {
                            return vertDats.getAll().$promise;
                        },
                        vertColMet: 'VERTICAL_COLL_METHOD',
                        allVertColMethods: function (vertColMet) {
                            return vertColMet.getAll().$promise;
                        },
                        opQual: 'OP_QUALITY',
                        allOPQualities: function (opQual) {
                            return opQual.getAll().$promise;
                        },
                        //#endregion op stuff
                        //#region sensor stuff
                        e: 'EVENT',
                        allEvents: function (e) {
                            return e.getAll().$promise;
                        },
                        sent: 'SENSOR_TYPE',
                        allSensorTypes: function (sent) {
                            return sent.getAll().$promise;
                        },
                        sb: 'SENSOR_BRAND',
                        allSensorBrands: function (sb){
                            return sb.getAll().$promise;
                        },                       
                        //#endregion sensor stuff
                        //#region hwm stuff
                        hwmt: 'HWM_TYPE',
                        allHWMTypes: function (hwmt) {
                            return hwmt.getAll().$promise;
                        },
                        hq: 'HWM_QUALITY',
                        allHWMQualities: function (hq){
                            return hq.getAll().$promise;
                        },
                        m: 'MARKER',
                        allMarkers: function (m){
                            return m.getAll().$promise;
                        }, 
                        //#endregion hwm stuff
                        //#region file
                        ft: 'FILE_TYPE',
                        allFileTypes: function(ft){
                            return ft.getAll().$promise;
                        },
                        a: 'AGENCY',
                        allAgencies: function(a){
                            return a.getAll().$promise;
                        }
                        //#endregion file
                    }
                })
                //#endregion site (abstract)

                //#region site.info
                .state("site.dashboard", {
                    url: "/SiteDashboard",
                    authenticate: true,
                    views: {
                        'siteNo': {
                            controller: ['$scope', '$cookies', 'thisSite', function ($scope, $cookies, thisSite) {
                                if (thisSite !== undefined)
                                    $scope.SiteNo = thisSite.SITE_NO;
                                // watch for the session event to change and update
                                $scope.$watch(function () { return $cookies.get('SessionEventName'); }, function (newValue) {
                                    $scope.sessionEvent = $cookies.get('SessionEventName') !== null && $cookies.get('SessionEventName') !== undefined ? $cookies.get('SessionEventName') : "All Events";
                                });
                            }],
                            template: '<div><h2 style="margin-top:0">Site {{SiteNo}} - For {{sessionEvent}}</h2></div><hr />' 
                        },
                        'aMap': {
                            controller: 'siteMapCtrl',
                            templateUrl: 'component/site/siteMapView.html',
                            resolve: {
                                siteId: function (thisSite) {
                                    if (thisSite !== undefined) {
                                        return thisSite.SITE_ID;
                                    }
                                }
                            }
                        },
                        'aSite': {
                            controller: 'siteCtrl',
                            templateUrl: 'component/site/siteInfoView.html'
                        },
                        'op': {
                            controller: 'objectivePointCtrl',
                            templateUrl: 'component/objectivePoint/objectivePointList.html'
                        },
                        'sensor': {
                            controller: 'sensorCtrl',
                            templateUrl: 'component/sensor/sensorList.html'
                        },
                        'hwm': {
                            controller: 'hwmCtrl',
                            templateUrl: 'component/hwm/hwmList.html'
                        },
                        'file': {
                            controller: 'fileCtrl',
                            templateUrl: 'component/file/fileList.html'
                        },
                        'peak': {
                            controller: 'peakCtrl',
                            templateUrl: 'component/peak/peakList.html'

                        }
                    }
                })//#endregion site.info

                //#region QuickHWM page
                .state("quickCreate", {
                    url: "/QuickCreate/:id",                    
                    templateUrl: "component/site/quickCreate.html",
                    controller: "quickCreateCtrl",
                    authenticate: true,
                    resolve: {
                        whichQuick: function ($stateParams){
                            return $stateParams.id;
                        },
                        //#region site stuff                        
                        hd: 'HORIZONTAL_DATUM',
                        allHorDatums: function (hd) {
                            return hd.getAll().$promise;
                        },
                        hcm: 'HORIZONTAL_COLL_METHODS',
                        allHorCollMethods: function (hcm) {
                            return hcm.getAll().$promise;
                        },
                        st: 'STATE',
                        allStates: function (st) {
                            return st.getAll().$promise;
                        },
                        c: 'COUNTIES',
                        allCounties: function (c) {
                            return c.getAll().$promise;
                        },                        
                        //#endregion site stuff
                        //#region op stuff                        
                        opt: 'OP_TYPE',
                        allOPTypes: function (opt) {
                            return opt.getAll().$promise;
                        },
                        vertDats: 'VERTICAL_DATUM',
                        allVertDatums: function (vertDats) {
                            return vertDats.getAll().$promise;
                        },
                        vertColMet: 'VERTICAL_COLL_METHOD',
                        allVertColMethods: function (vertColMet) {
                            return vertColMet.getAll().$promise;
                        },
                        opQual: 'OP_QUALITY',
                        allOPQualities: function (opQual) {
                            return opQual.getAll().$promise;
                        },
                        //#endregion op stuff                        
                        //#region hwm stuff (if id='hwm'
                        hwmt: 'HWM_TYPE',
                        allHWMTypes: function (hwmt, $stateParams) {
                            if ($stateParams.id == 'HWM') return hwmt.getAll().$promise;
                        },
                        hq: 'HWM_QUALITY',
                        allHWMQualities: function (hq, $stateParams) {
                            if ($stateParams.id == 'HWM') return hq.getAll().$promise;
                        },
                        m: 'MARKER',
                        allMarkers: function (m, $stateParams) {
                            if ($stateParams.id == 'HWM') return m.getAll().$promise;
                        },
                        //#endregion hwm stuff  
                        //#region sensor stuff
                        dt: 'DEPLOYMENT_TYPE',
                        allDeployTypes: function (dt) {
                            return dt.getAll().$promise;
                        },
                        e: 'EVENT',
                        allEvents: function (e, $stateParams) {
                            if ($stateParams.id == 'Sensor') return e.getAll().$promise;
                        },
                        sent: 'SENSOR_TYPE',
                        allSensorTypes: function (sent, $stateParams) {
                            if ($stateParams.id == 'Sensor') return sent.getAll().$promise;
                        },
                        sb: 'SENSOR_BRAND',
                        allSensorBrands: function (sb, $stateParams) {
                            if ($stateParams.id == 'Sensor') return sb.getAll().$promise;
                        },
                        sd: 'SENSOR_DEPLOYMENT',
                        allSensDeps: function (sd) {
                            return sd.getAll().$promise;
                        },
                        ht: 'HOUSING_TYPE',
                        allHousingTypes: function (ht) {
                            return ht.getAll().$promise;
                        }
                        //#endregion
                    }
                });
                //#endregion QuickHWM page
               
            //this causes issues with Status404 Not found on component/main/mainView.html
            //$locationProvider.html5Mode({
            //    enabled: true,
            //    requireBase: false
            //});
        }
    ]);
}());
