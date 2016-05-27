(function () {
    'use strict';

    var STNControllers = angular.module('STNControllers');
    STNControllers.controller('reportingDashCtrl', ['$scope', '$cookies', '$filter', '$uibModal', '$state', '$http', 'CONTACT', 'MEMBER', 'allReportsAgain', 
        function ($scope, $cookies, $filter, $uibModal, $state, $http, CONTACT, MEMBER, allReportsAgain) {
            $scope.reportsToDate = allReportsAgain;
            $scope.todayRpts = []; $scope.yesterdayRpts = []; $scope.pickDateRpts = []; $scope.pickAdateReports = false;
            $scope.today = new Date();
            $scope.today.setHours(0, 0, 0, 0);
            $scope.yesterday = new Date($scope.today);
            $scope.yesterday.setDate($scope.today.getDate() - 1);
            $scope.today = $scope.today.toISOString().substr(0, 10);
            $scope.yesterday = $scope.yesterday.toISOString().substr(0,10);

            $scope.THIS_DATE = {};
            //View Report button clicked, get stuff and make a pdf 
            $scope.ViewReport = function (r) {
                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: 'ViewReport.html',
                    controller: 'reportModalCtrl',
                    size: 'lg',
                    windowClass: 'rep-dialog',
                    resolve: {  //TODO :: Change this to get ReportModel --includes contacts
                        report: function () {
                            return r;
                        },
                        submitPerson: function () {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            var member = {};
                            MEMBER.query({ id: r.MEMBER_ID }, function success(response) {
                                member.mem = response;
                                var memberAgency = $scope.agencies.filter(function (a) { return a.AGENCY_ID == member.mem.AGENCY_ID; })[0];
                                member.AGENCY_NAME = memberAgency.AGENCY_NAME;
                                member.AGENCY_ADDRESS = memberAgency.ADDRESS + ", " + memberAgency.CITY + " " + memberAgency.STATE + " " + memberAgency.ZIP;
                            }).$promise;
                            return member;
                        },
                        contacts: function () {
                            $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                            $http.defaults.headers.common.Accept = 'application/json';
                            return CONTACT.getContactModel({ ContactModelByReport: r.REPORTING_METRICS_ID }).$promise;
                        }
                    }
                });
                modalInstance.result.then(function (r) {
                    //nothing to do here
                });
                //end modal
            };//end ViewReport click

            //function call to add EVENT_NAME to list of reports
            var formatReport = function (repList) {
                var returnList = [];
                for (var i = 0; i < repList.length; i++) {
                    var rep = repList[i];
                    var event = $scope.events.filter(function (e) { return e.EVENT_ID == rep.EVENT_ID; })[0];
                    rep.EVENT_NAME = event.EVENT_NAME;
                    returnList.push(rep);
                }
                return returnList;
            };

            var todayReports = $scope.reportsToDate.filter(function (todayrep) {
                var reportDate = todayrep.REPORT_DATE.toString().substring(0, 10);
                return reportDate == $scope.today;
            });
            $scope.todayRpts = formatReport(todayReports);

            var yesterdayReports = $scope.reportsToDate.filter(function (yestrep) {
                var reportDate = yestrep.REPORT_DATE.toString().substring(0, 10);
                return reportDate == $scope.yesterday;
            });
            $scope.yesterdayRpts = formatReport(yesterdayReports);

            //give me the reports done on this date
            $scope.getReportsByDate = function () {
                if ($scope.THIS_DATE.date !== undefined) {
                    var formatDate = new Date($scope.THIS_DATE.date);
                    formatDate.setHours(0, 0, 0, 0);
                    formatDate = formatDate.toISOString().substr(0, 10);
                    var thisDateReports = $scope.reportsToDate.filter(function (tdate) {
                        var reportDate = tdate.REPORT_DATE.toString().substring(0, 10);
                        return reportDate == formatDate;
                    });
                    $scope.pickDateRpts = formatReport(thisDateReports);
                    $scope.pickAdateReports = true;
                } else {
                    alert("Pick a date first.");
                }

            };

            //complete the report button clicked -- send back to submit with report populated
            $scope.CompleteThisReport = function (rep) {
                $scope.$parent.newReport = rep;
               // $scope.$parent.newReport.REPORT_DATE = new Date(rep.REPORT_DATE); //keeps it valid
                $scope.$parent.disabled = false;
                $scope.$parent.needToComplete = true;
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                CONTACT.getContactModel({ ContactModelByReport: rep.REPORTING_METRICS_ID }, function success(response) {
                    if (response.length >= 1) {
                        $scope.$parent.DeployStaff = response.filter(function (d) { return d.TYPE == "Deployed Staff"; })[0];
                        $scope.$parent.GenStaff = response.filter(function (d) { return d.TYPE == "General"; })[0];
                        $scope.$parent.InlandStaff = response.filter(function (d) { return d.TYPE == "Inland Flood"; })[0];
                        $scope.$parent.CoastStaff = response.filter(function (d) { return d.TYPE == "Coastal Flood"; })[0];
                        $scope.$parent.WaterStaff = response.filter(function (d) { return d.TYPE == "Water Quality"; })[0];
                    } else {
                        $scope.$parent.DeployStaff = {}; $scope.$parent.GenStaff = {}; $scope.$parent.InlandStaff = {}; $scope.$parent.CoastStaff = {}; $scope.$parent.WaterStaff = {};
                    }
                }).$promise.then(function () {
                    $state.go('reporting.submitReport');
                });
            };

            //project alert text in modal
            $scope.getProjectAlertText = function (rep) {

                //need: 
                //1. thisReport
                $scope.ProjectAlertParts = {};
                $scope.ProjectAlertParts.Report = rep;
                //2. total of YEST FIELDPERS
                $scope.ProjectAlertParts.totYestFieldPers = rep.SW_YEST_FIELDPERS + rep.WQ_YEST_FIELDPERS;
                //3. total of OFFICEPERS
                $scope.ProjectAlertParts.totYestOfficPers = rep.SW_YEST_OFFICEPERS + rep.WQ_YEST_OFFICEPERS;
                //4. total TOT_CHECK_MEAS+TOT_DISCHARGE_MEAS
                $scope.ProjectAlertParts.measureCts = rep.TOT_CHECK_MEAS + rep.TOT_DISCHARGE_MEAS;
                //5. total states responding (all reports with this event_id, count of each state)
                var eventReports = $scope.reportsToDate.filter(function (r) { return r.EVENT_ID == rep.EVENT_ID; });
                var test = $filter('countBy')(eventReports, 'STATE');
                $scope.ProjectAlertParts.stateCount = 0;
                angular.forEach(test, function (er) {
                    $scope.ProjectAlertParts.stateCount++;
                });
                //6. this event
                $scope.ProjectAlertParts.Event = $scope.events.filter(function (e) { return e.EVENT_ID == rep.EVENT_ID; })[0];

                //modal
                var modalInstance = $uibModal.open({
                    templateUrl: $scope.ProjectAlertParts.Event.EVENT_TYPE_ID == 1 ? 'FloodPA.html' : 'HurricanePA.html',
                    controller: 'ProjAlertModalCtrl',
                    size: 'md',
                    windowClass: 'rep-dialog',
                    resolve: {
                        ProjAlert: function () {
                            return $scope.ProjectAlertParts;
                        }
                    }
                });
                modalInstance.result.then(function (r) {
                    //nothing to do here
                });
                //end modal
            };
        }]);
})();