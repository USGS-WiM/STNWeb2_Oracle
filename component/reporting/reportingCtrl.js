(function () {
    'use strict';

    var STNControllers = angular.module('STNControllers');
//#region Reporting Controller
    STNControllers.controller('reportingCtrl', ['$scope', '$rootScope', '$cookies', '$location', '$http', '$uibModal', 'memberReports', 'allEvents', 'allStates', 'allReports', 'allEventTypes', 'allEventStatus', 'allAgencies', 'SERVER_URL', 'REPORT', 'MEMBER',
        function ($scope, $rootScope, $cookies, $location, $http, $uibModal, memberReports, allEvents, allStates, allReports, allEventTypes, allEventStatus, allAgencies, SERVER_URL, REPORT, MEMBER) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                $rootScope.thisPage = "Reporting";
                $rootScope.activeMenu = "report"; 
                //#region changing tabs handler /////////////////////
                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    var formIsPopulated = false;
                    switch (fromState.url) {
                        case '/SubmitReport':
                            if ($scope.fullReportForm.submit !== undefined) {
                                formIsPopulated = $scope.fullReportForm.submit.$dirty;
                                formIsPopulated = $scope.fullReportForm.submit.EVENT_ID.$viewValue !== undefined ? true : formIsPopulated;
                            }
                            break;
                    }
                    if (formIsPopulated) { //is dirty
                        console.log('toState.name: ' + toState.name);
                        console.log('fromState.name: ' + fromState.name);

                        if (confirm("Are you sure you want to leave the Submit Report Tab? Any unsaved information will be lost.")) {
                            console.log('go to: ' + toState.name);
                        } else {
                            console.log('stay at state: ' + fromState.name);
                            $rootScope.stateIsLoading.showLoading = false;
                            //$scope.$apply();// loading..//$(".page-loading").addClass("hidden");
                            event.preventDefault();
                            //event.stopPropagation;
                        }
                    }
                });
                //#endregion changing tabs handler //////////////////////

                //#region Datepicker
                $scope.datepickrs = {};
               
                $scope.open = function ($event, which) {
                    $event.preventDefault();
                    $event.stopPropagation();

                    $scope.datepickrs[which] = true;
                };
                //#endregion

                //format the date mm/dd/yyyy
                $scope.formatDate = function (d) {
                    var currentDt = new Date(d);
                    var mm = currentDt.getMonth() + 1;
                    mm = (mm < 10) ? '0' + mm : mm;
                    var dd = currentDt.getDate();
                    var yyyy = currentDt.getFullYear();
                    var date = mm + '/' + dd + '/' + yyyy;
                    return date;
                };

                //#region global vars
                $scope.serverURL = SERVER_URL;
                $scope.fullReportForm = {};
                $scope.newReport = {};
                $scope.DeployStaff = {}; $scope.GenStaff = {};
                $scope.InlandStaff = {}; $scope.CoastStaff = {};
                $scope.WaterStaff = {};
                $scope.disabled = true;
                $scope.needToComplete = false;
                $scope.memberIncompletes = memberReports.filter(function (ir) { return ir.COMPLETE === 0; });
                $scope.events = allEvents;
                $scope.states = allStates;
                $scope.reports = allReports;
            
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                MEMBER.query({ id: $cookies.get('mID') }, function success(response) {
                    $scope.MemberLoggedIn = response;
                    var memberAgency = allAgencies.filter(function (a) { return a.AGENCY_ID == $scope.MemberLoggedIn.AGENCY_ID; })[0];
                    $scope.MemberLoggedIn.AGENCY_NAME = memberAgency.AGENCY_NAME;
                    $scope.MemberLoggedIn.AGENCY_ADDRESS = memberAgency.ADDRESS + ", " + memberAgency.CITY + " " + memberAgency.STATE + " " + memberAgency.ZIP;
                }).$promise;
                MEMBER.getAll().$promise.then(function (response) {
                    $scope.members = response;
                });

                $scope.agencies = allAgencies;
                $scope.eventTypes = allEventTypes;
                $scope.eventStats = allEventStatus;

                //#endregion global vars

                //#region Generate Report tab
                $scope.Statemodel = {};//binding to the state multi-select
                $scope.genSummary = {};//binding for the event chosen, and date chosen
                $scope.filteredReports = []; //result of filter options

                //each option the populate, need to show selection in 'Confirm Selections' section (date works)
                $scope.genRepChange = function () {
                    $scope.EventName = $scope.events.filter(function (e) { return e.EVENT_ID == $scope.genSummary.EVENT_ID; })[0];
                    var names = [];
                    var abbrevs = [];
                    angular.forEach($scope.Statemodel.value, function (state) {
                        names.push(state.STATE_NAME); abbrevs.push(state.STATE_ABBREV);
                    });

                    $scope.StateNames = names.join(','); $scope.StateAbbrevs = abbrevs.join(',');
                };

                $scope.MetricDisplayModel = []; //hold all reportModels for 'Display Metrics Summary'
                //clicked Display Metrics Summary, show content in new tab
                $scope.displayMetricSum = function (valid) {
                    if (valid) {
                        //#region scopes needed for this action
                        $scope.MetricDisplayModel = [];
                        $scope.GenRepEventModel = {};
                        $scope.totalRow = {}; //model to hold totals for tables last row
                        $scope.totalRow.notAcctForEmps = 0; $scope.totalRow.cumPField = 0; $scope.totalRow.yesPField = 0; $scope.totalRow.todPField = 0;
                        $scope.totalRow.tomPField = 0; $scope.totalRow.cumPOffice = 0; $scope.totalRow.yesPOffice = 0; $scope.totalRow.todPOffice = 0;
                        $scope.totalRow.tomPOffice = 0; $scope.totalRow.truck = 0; $scope.totalRow.boat = 0; $scope.totalRow.other = 0;

                        $scope.totalRow.gageVisits = 0; $scope.totalRow.gagesDown = 0; $scope.totalRow.disCtoDate = 0; $scope.totalRow.disCPlanned = 0;
                        $scope.totalRow.CheckMeasToDate = 0; $scope.totalRow.CheckMeasPlanned = 0; $scope.totalRow.indMeas = 0; $scope.totalRow.ratExt = 0;
                        $scope.totalRow.peaksOfRec = 0; $scope.totalRow.QWGageVis = 0; $scope.totalRow.contQWGageVis = 0; $scope.totalRow.contQWGageDown = 0;
                        $scope.totalRow.disQWSamples = 0; $scope.totalRow.sedSamples = 0;

                        $scope.totalRow.rdgPlan = 0; $scope.totalRow.rdgDep = 0; $scope.totalRow.rdgRec = 0; $scope.totalRow.rdgLost = 0;
                        $scope.totalRow.waterPlan = 0; $scope.totalRow.waterDep = 0; $scope.totalRow.waterRec = 0; $scope.totalRow.waterLost = 0;
                        $scope.totalRow.wavePlan = 0; $scope.totalRow.waveDep = 0; $scope.totalRow.waveRec = 0; $scope.totalRow.waveLost = 0;
                        $scope.totalRow.baroPlan = 0; $scope.totalRow.baroDep = 0; $scope.totalRow.baroRec = 0; $scope.totalRow.baroLost = 0;
                        $scope.totalRow.metPlan = 0; $scope.totalRow.metDep = 0; $scope.totalRow.metRec = 0; $scope.totalRow.metLost = 0;
                        $scope.totalRow.hwmFlag = 0; $scope.totalRow.hwmCol = 0;
                        //#endregion scopes needed for this action

                        //get metrics summary to show in new tab                    
                        var abbrevs = [];
                        angular.forEach($scope.Statemodel.value, function (state) {
                            abbrevs.push(state.STATE_ABBREV);
                        });
                        var abbrevString = abbrevs.join(',');
                        var thisDate = $scope.formatDate($scope.genSummary.SUM_DATE);
                        //need: 
                        //1. all reports
                        REPORT.getFilteredReports({
                            Event: $scope.EventName.EVENT_ID, States: abbrevString, Date: thisDate
                        }).$promise.then(function (result) {
                            //for each report, get all reports with that event and state
                            for (var x = 0; x < result.length; x++) {
                                //var evStReports = $scope.reports.filter(function (f) { return f.EVENT_ID == result[x].EVENT_ID && f.STATE == result[x].STATE; });
                                var thisRPModel = {};
                                thisRPModel.report = result[x]; var YesSWFsum = 0; var YesWQFsum = 0; var YesSWOsum = 0; var YesWQOsum = 0;
                                //cumulative person days totals
                                for (var a = 0; a < result.length; a++) { YesSWFsum += result[a].SW_YEST_FIELDPERS; }
                                for (var b = 0; b < result.length; b++) { YesWQFsum += result[b].WQ_YEST_FIELDPERS; }
                                for (var c = 0; c < result.length; c++) { YesSWOsum += result[c].SW_YEST_OFFICEPERS; }
                                for (var d = 0; d < result.length; d++) { YesWQOsum += result[d].WQ_YEST_OFFICEPERS; }

                                thisRPModel.FieldPYesSWTot = YesSWFsum;
                                thisRPModel.FieldPYesWQTot = YesWQFsum;
                                thisRPModel.OfficePYesSWTot = YesSWOsum;
                                thisRPModel.OfficePYesWQTot = YesWQOsum;

                                //add to totals for total row
                                $scope.totalRow.notAcctForEmps += (thisRPModel.report.SW_FIELDPERS_NOTACCT + thisRPModel.report.WQ_FIELDPERS_NOTACCT);
                                $scope.totalRow.cumPField += (thisRPModel.FieldPYesSWTot + thisRPModel.FieldPYesWQTot);
                                $scope.totalRow.yesPField += (thisRPModel.report.SW_YEST_FIELDPERS + thisRPModel.report.WQ_YEST_FIELDPERS);
                                $scope.totalRow.todPField += (thisRPModel.report.SW_TOD_FIELDPERS + thisRPModel.report.WQ_TOD_FIELDPERS);
                                $scope.totalRow.tomPField += (thisRPModel.report.SW_TMW_FIELDPERS + thisRPModel.report.WQ_TMW_FIELDPERS);
                                $scope.totalRow.cumPOffice += (thisRPModel.OfficePYesSWTot + thisRPModel.OfficePYesWQTot);
                                $scope.totalRow.yesPOffice += (thisRPModel.report.SW_YEST_OFFICEPERS + thisRPModel.report.WQ_YEST_OFFICEPERS);
                                $scope.totalRow.todPOffice += (thisRPModel.report.SW_TOD_OFFICEPERS + thisRPModel.report.WQ_TOD_OFFICEPERS);
                                $scope.totalRow.tomPOffice += (thisRPModel.report.SW_TMW_OFFICEPERS + thisRPModel.report.WQ_TMW_OFFICEPERS);
                                $scope.totalRow.truck += (thisRPModel.report.SW_AUTOS_DEPL + thisRPModel.report.WQ_AUTOS_DEPL);
                                $scope.totalRow.boat += (thisRPModel.report.SW_BOATS_DEPL + thisRPModel.report.WQ_BOATS_DEPL);
                                $scope.totalRow.other += (thisRPModel.report.SW_OTHER_DEPL + thisRPModel.report.WQ_OTHER_DEPL);

                                $scope.totalRow.gageVisits += thisRPModel.report.GAGE_VISIT; $scope.totalRow.gagesDown += thisRPModel.report.GAGE_DOWN;
                                $scope.totalRow.disCtoDate += thisRPModel.report.TOT_DISCHARGE_MEAS; $scope.totalRow.disCPlanned += thisRPModel.report.PLAN_DISCHARGE_MEAS;
                                $scope.totalRow.CheckMeasToDate += thisRPModel.report.TOT_CHECK_MEAS; $scope.totalRow.CheckMeasPlanned += thisRPModel.report.PLAN_CHECK_MEAS;
                                $scope.totalRow.indMeas = thisRPModel.report.PLAN_INDIRECT_MEAS; $scope.totalRow.ratExt = thisRPModel.report.RATING_EXTENS;
                                $scope.totalRow.peaksOfRec += thisRPModel.report.GAGE_PEAK_RECORD; $scope.totalRow.QWGageVis += thisRPModel.report.QW_GAGE_VISIT;
                                $scope.totalRow.contQWGageVis = thisRPModel.report.QW_CONT_GAGEVISIT; $scope.totalRow.contQWGageDown = thisRPModel.report.QW_GAGE_DOWN;
                                $scope.totalRow.disQWSamples += thisRPModel.report.QW_DISCR_SAMPLES; $scope.totalRow.sedSamples += thisRPModel.report.COLL_SEDSAMPLES;

                                $scope.totalRow.rdgPlan += thisRPModel.report.PLAN_RAPDEPL_GAGE; $scope.totalRow.rdgDep += thisRPModel.report.DEP_RAPDEPL_GAGE;
                                $scope.totalRow.rdgRec += thisRPModel.report.REC_RAPDEPL_GAGE; $scope.totalRow.rdgLost += thisRPModel.report.LOST_RAPDEPL_GAGE;
                                $scope.totalRow.waterPlan += thisRPModel.report.PLAN_WTRLEV_SENSOR; $scope.totalRow.waterDep += thisRPModel.report.DEP_WTRLEV_SENSOR;
                                $scope.totalRow.waterRec += thisRPModel.report.REC_WTRLEV_SENSOR; $scope.totalRow.waterLost += thisRPModel.report.LOST_WTRLEV_SENSOR;
                                $scope.totalRow.wavePlan += thisRPModel.report.PLAN_WV_SENS; $scope.totalRow.waveDep += thisRPModel.report.DEP_WV_SENS;
                                $scope.totalRow.waveRec += thisRPModel.report.REC_WV_SENS; $scope.totalRow.waveLost += thisRPModel.report.LOST_WV_SENS;
                                $scope.totalRow.baroPlan += thisRPModel.report.PLAN_BAROMETRIC; $scope.totalRow.baroDep += thisRPModel.report.DEP_BAROMETRIC;
                                $scope.totalRow.baroRec += thisRPModel.report.REC_BAROMETRIC; $scope.totalRow.baroLost += thisRPModel.report.LOST_BAROMETRIC;
                                $scope.totalRow.metPlan += thisRPModel.report.PLAN_METEOROLOGICAL; $scope.totalRow.metDep += thisRPModel.report.DEP_METEOROLOGICAL;
                                $scope.totalRow.metRec += thisRPModel.report.REC_METEOROLOGICAL; $scope.totalRow.metLost += thisRPModel.report.LOST_METEOROLOGICAL;
                                $scope.totalRow.hwmFlag += thisRPModel.report.HWM_FLAGGED; $scope.totalRow.hwmCol = thisRPModel.report.HWM_COLLECTED;

                                $scope.MetricDisplayModel.push(thisRPModel);
                            }//end forloop for ReportModelList
                            //2. this Event
                            $scope.GenRepEventModel = {};
                            $scope.GenRepEventModel.Event = $scope.EventName;
                            $scope.GenRepEventModel.EventType = $scope.eventTypes.filter(function (et) { return et.EVENT_TYPE_ID == $scope.EventName.EVENT_TYPE_ID; })[0];
                            $scope.GenRepEventModel.EventStat = $scope.eventStats.filter(function (es) { return es.EVENT_STATUS_ID == $scope.EventName.EVENT_STATUS_ID; })[0];
                            //3. event Coordinator info
                            $scope.GenRepEventModel.Coordinator = $scope.members.filter(function (m) { return m.MEMBER_ID == $scope.GenRepEventModel.Event.EVENT_COORDINATOR; })[0];
                            $scope.GenRepEventModel.CoordAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.GenRepEventModel.Coordinator.AGENCY_ID; })[0];

                            //modal
                            var modalInstance = $uibModal.open({
                                templateUrl: 'MetricsSummary.html',
                                size: 'lg',
                                windowClass: 'rep-dialog',
                                resolve: {
                                    thisReport: function () {
                                        return $scope.MetricDisplayModel;
                                    },
                                    thisEvent: function () {
                                        return $scope.GenRepEventModel;
                                    },
                                    theTotalRow: function () {
                                        return $scope.totalRow;
                                    }
                                },
                                controller: ['$scope', '$uibModalInstance', 'thisReport', 'thisEvent', 'theTotalRow',  function ($scope, $uibModalInstance, thisReport, thisEvent, theTotalRow) {
                                    $scope.Report = thisReport;
                                    $scope.Event = thisEvent;
                                    $scope.totals = theTotalRow;
                                    $scope.ok = function () {
                                        $uibModalInstance.dismiss('cancel');
                                    };
                                    $scope.print = function () {
                                        window.print();
                                    };
                                }]
                            });
                            modalInstance.result.then(function () {
                                //nothing                            
                            });//end modal
                        });
                    }//end if valid = true
                };

                //clicked Display Contacts Summary, show content in new tab
                $scope.displayContactsSum = function (valid) {
                    if (valid) {
                        //get metrics summary to show in new tab
                        //contains the states chosen     $scope.Statemodel.value; 
                        //event chosen    $scope.EventName[0];
                        var abbrevs = [];
                        angular.forEach($scope.Statemodel.value, function (state) {
                            abbrevs.push(state.STATE_ABBREV);
                        });
                        var abbrevString = abbrevs.join(',');
                        var thisDate = $scope.formatDate($scope.genSummary.SUM_DATE);
                        $scope.reportModel = [];
                        //all filtered reports 
                        $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                        $http.defaults.headers.common.Accept = 'application/json';
                        REPORT.getReportwithContacts({
                            Event: $scope.EventName.EVENT_ID, States: abbrevString, Date: thisDate
                        }).$promise.then(function (result) {
                            //loop through reports and get each's contacts
                            for (var x = 0; x < result.length; x++) {
                                var rep = {};
                                rep.repID = result[x].Report.REPORTING_METRICS_ID; rep.State = result[x].Report.STATE; rep.REPORT_DATE = result[x].Report.REPORT_DATE;
                                var submitter = $scope.members.filter(function (m) { return m.MEMBER_ID == result[x].Report.MEMBER_ID; })[0];
                                var submitterAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == submitter.AGENCY_ID; });
                                var sub = {};
                                sub.FNAME = submitter.FNAME; sub.FNAME = submitter.FNAME;
                                sub.EMAIL = submitter.EMAIL; sub.PHONE = submitter.PHONE;
                                sub.AGENCYNAME = submitterAgency.AGENCY_NAME;
                                sub.AGENCYADD = submitterAgency.CITY + " " + submitterAgency.STATE + " " + submitterAgency.ZIP;
                                rep.submitter = sub;
                                rep.depC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Deployed Staff"; })[0];
                                rep.genC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "General"; })[0];
                                rep.inlC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Inland Flood"; })[0];
                                rep.coastC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Coastal Flood"; })[0];
                                rep.waterC = result[x].ReportContacts.filter(function (x) { return x.TYPE == "Water Quality"; })[0];
                                $scope.reportModel.push(rep);
                            } //end for loop 

                            setTimeout(function () { showModal(); }, 3000);

                            //now send it all to the modal
                            var showModal = function () {
                                var modalInstance = $uibModal.open({
                                    templateUrl: 'ContactMetricsSummary.html',
                                    size: 'lg',
                                    windowClass: 'rep-dialog',
                                    resolve: {
                                        theseReports: function () {
                                            return $scope.reportModel;
                                        },
                                        thisEvent: function () {
                                            $scope.GenRepEventModel = {};
                                            $scope.GenRepEventModel.Event = $scope.EventName;
                                            $scope.GenRepEventModel.EventType = $scope.eventTypes.filter(function (et) { return et.EVENT_TYPE_ID == $scope.EventName.EVENT_TYPE_ID; })[0];
                                            $scope.GenRepEventModel.EventStat = $scope.eventStats.filter(function (es) { return es.EVENT_STATUS_ID == $scope.EventName.EVENT_STATUS_ID; })[0];
                                            //3. event Coordinator info
                                            $scope.GenRepEventModel.Coordinator = $scope.members.filter(function (m) { return m.MEMBER_ID == $scope.EventName.EVENT_COORDINATOR; })[0];
                                            $scope.GenRepEventModel.CoordAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == $scope.GenRepEventModel.Coordinator.AGENCY_ID; })[0];
                                            return $scope.GenRepEventModel;
                                        }
                                    },
                                    controller: ['$scope', '$http', '$uibModalInstance', 'theseReports', 'thisEvent', function ($scope, $http, $uibModalInstance, theseReports, thisEvent) {
                                        $scope.Reports = theseReports;
                                        $scope.Event = thisEvent;
                                        $scope.ok = function () {
                                            $uibModalInstance.dismiss('cancel');
                                        };
                                        $scope.print = function () {
                                            window.print();
                                        };
                                    }]
                                });
                                modalInstance.result.then(function () {
                                    //nothing
                                });
                            }; //end modal
                        });
                    } //end if valid
                };

                //clicked generate csv
                $scope.getCSVfile = function (valid) {
                    if (valid) {
                        //get reports and give a csv file back
                        $http.defaults.headers.common.Accept = 'text/csv';
                  
                        REPORT.getReportsCSV({ Event: $scope.genSummary.EVENT_ID, States: $scope.StateAbbrevs, Date: $scope.genSummary.SUM_DATE }).$promise.then(function (result) {
                            var anchor = angular.element('<a/>');
                            var joinedResponse = result.join("");
                            var file = new Blob([joinedResponse], { type: 'application/csv' });
                            var fileURL = URL.createObjectURL(file);
                            anchor.href = fileURL;
                            anchor.download = 'report.csv';
                            anchor.click();
                            var test;
                            //File.saveAs(blob, "report.csv");
                        }), function () {
                            console.log('error');
                        };
                    }
                };//#endregion Generate Report tab
            }
    }]);
})();