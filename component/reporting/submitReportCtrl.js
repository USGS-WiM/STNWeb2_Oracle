(function () {
    'use strict';

    var STNControllers = angular.module('STNControllers');
    STNControllers.controller('submitReportCtrl', ['$scope', '$http', '$cookies', '$uibModal', '$state', 'CONTACT', 'REPORT', 
        function ($scope, $http, $cookies, $uibModal, $state, CONTACT, REPORT) {
            //#make sure this clears except for if they are needing to complete a report
            if ($scope.$parent.needToComplete !== true) {
                $scope.$parent.newReport = {REPORT_DATE: new Date()};
            }
            else {
                //keeps it valid and tells it it's utc so it will convert proper local
                var yr = $scope.newReport.REPORT_DATE.substr(0, 4);
                var mo = $scope.newReport.REPORT_DATE.substr(5, 2);
                var day = $scope.newReport.REPORT_DATE.substr(8, 2);
                $scope.newReport.REPORT_DATE = new Date(mo + "/" + day + "/" + yr);
//                $scope.newReport.REPORT_DATE = new Date($scope.newReport.REPORT_DATE);
            }
            $scope.status = { openContacts: false }; //if submit form invalid, open contacts to show required field

            //reset it here so form will clear when they leave and come back.
            $scope.$parent.needToComplete = false;

            if ($scope.newReport.REPORTING_METRICS_ID === undefined)
                $scope.disabled = true;

            //get this event name from the eventid
            $scope.getEventName = function (evID) {
                var name;
                var thisEvent = $scope.events.filter(function (e) { return e.EVENT_ID == evID; })[0];
                name = thisEvent.EVENT_NAME;
                return name;
            };

            //#region GET Report Contacts
            var getReportContacts = function (reportID) {
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                CONTACT.getContactModel({ ContactModelByReport: reportID }, function success(response) {
                    $scope.DeployStaff = response.filter(function (d) { return d.TYPE == "Deployed Staff"; })[0];
                    $scope.GenStaff = response.filter(function (d) { return d.TYPE == "General"; })[0];
                    $scope.InlandStaff = response.filter(function (d) { return d.TYPE == "Inland Flood"; })[0];
                    $scope.CoastStaff = response.filter(function (d) { return d.TYPE == "Coastal Flood"; })[0];
                    $scope.WaterStaff = response.filter(function (d) { return d.TYPE == "Water Quality"; })[0];
                }).$promise;
                $scope.disabled = false;
            };
            //#endregion GET Report Contacts

            //#region POST Report Contacts
            var postReportContacts = function (reportID) {
                if (!angular.equals({}, $scope.DeployStaff) && $scope.DeployStaff !== undefined) {
                    CONTACT.addReportContact({ contactTypeId: 1, reportId: reportID }, $scope.DeployStaff, function success(response1) {
                        toastr.success("Deploy Staff Updated");
                    }, function error(errorResponse1) {
                        alert("Error: " + errorResponse1.statusText);
                    }).$promise;
                }
                if (!angular.equals({}, $scope.GenStaff) && $scope.GenStaff !== undefined) {
                    CONTACT.addReportContact({ contactTypeId: 2, reportId: reportID }, $scope.GenStaff, function success(response2) {
                        toastr.success("General Staff Updated");
                    }, function error(errorResponse2) {
                        alert("Error: " + errorResponse2.statusText);
                    }).$promise;
                }
                if (!angular.equals({}, $scope.InlandStaff) && $scope.InlandStaff !== undefined) {
                    CONTACT.addReportContact({ contactTypeId: 3, reportId: reportID }, $scope.InlandStaff, function success(response3) {
                        toastr.success("Inland Staff Updated");
                    }, function error(errorResponse3) {
                        alert("Error: " + errorResponse3.statusText);
                    }).$promise;
                }
                if (!angular.equals({}, $scope.CoastStaff) && $scope.CoastStaff !== undefined) {
                    CONTACT.addReportContact({ contactTypeId: 4, reportId: reportID }, $scope.CoastStaff, function success(response4) {
                        toastr.success("Coastal Staff Updated");
                    }, function error(errorResponse4) {
                        alert("Error: " + errorResponse4.statusText);
                    }).$promise;
                }
                if (!angular.equals({}, $scope.WaterStaff) && $scope.WaterStaff !== undefined) {
                    CONTACT.addReportContact({ contactTypeId: 5, reportId: reportID }, $scope.WaterStaff, function success(response5) {
                        toastr.success("Water Staff Updated");
                    }, function error(errorResponse5) {
                        alert("Error: " + errorResponse5.statusText);
                    }).$promise;
                }
            };
            //#endregion POST Report Contacts

            var removeIncomplete = function () {
                //remove it from the list of incompletes
                var index = 0;
                for (var i = 0; i < $scope.memberIncompletes.length; i++) {
                    if ($scope.memberIncompletes[i].REPORTING_METRICS_ID == $scope.newReport.REPORTING_METRICS_ID) {
                        index = i;
                        i = $scope.memberIncompletes.length;
                    }
                }
                $scope.memberIncompletes.splice(index, 1);
            };

            //Post/Put the Report and Report Contacts. Called twice (from within Modal (incomplete) and outside (complete))
            var PostPutReportAndReportContacts = function () {
                //POST or PUT
                $scope.newReport.REPORT_DATE = $scope.newReport.REPORT_DATE.toDateString();
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                if ($scope.newReport.REPORTING_METRICS_ID !== undefined) {                    
                    //PUT
                    REPORT.update({ id: $scope.newReport.REPORTING_METRICS_ID }, $scope.newReport, function success(response) {
                        toastr.success("Report Updated");
                        $scope.newReport.EVENT_NAME = $scope.getEventName($scope.newReport.EVENT_ID);
                        if ($scope.newReport.COMPLETE == 1) {
                            removeIncomplete();
                            $scope.isCompleted = true;
                        }
                        //then POST the ReportContacts
                        postReportContacts($scope.newReport.REPORTING_METRICS_ID);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $scope.fullReportForm.submit.$setPristine();
                        $scope.fullReportForm.submit.EVENT_ID.$viewValue = undefined;//needed for the changeState to not throw up leaving tab message
                        $state.go('reporting.reportDash');
                    });
                } else {
                    //POST
                    REPORT.save($scope.newReport, function success(response) {
                        toastr.success("Report Created");
                        $scope.reports.push(response); //add to the list of all reports for filtering on the generate tab
                        if ($scope.newReport.COMPLETE == 1) {
                            removeIncomplete(); $scope.isCompleted = true;
                            $scope.newReport.EVENT_NAME = $scope.getEventName($scope.newReport.EVENT_ID);
                        } else {
                            $scope.memberIncompletes.push(response);
                        }
                        //then POST the ReportContacts
                        $scope.newReport.REPORTING_METRICS_ID = response.REPORTING_METRICS_ID;
                        postReportContacts($scope.newReport.REPORTING_METRICS_ID);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    }).$promise.then(function () {
                        $scope.fullReportForm.submit.$setPristine();
                        $scope.fullReportForm.submit.EVENT_ID.$viewValue = undefined; //needed for the changeState to not throw up leaving tab message
                        $state.go('reporting.reportDash');
                    });
                }//end post
            };

            //get values for Personnel Yesterdays, and Contacts (if report was done yesterday), and all counts for instruments & hwms
            $scope.populateYestTots = function () {
                if ($scope.newReport.REPORT_DATE !== undefined && $scope.newReport.STATE !== undefined && $scope.newReport.EVENT_ID !== undefined) {
                    var formatDate = new Date($scope.newReport.REPORT_DATE);
                    formatDate.setHours(0, 0, 0, 0);
                    formatDate = formatDate.toISOString().substr(0, 10);
                    var myDate = formatDate;
                    var theState = $scope.newReport.STATE;
                    var eID = $scope.newReport.EVENT_ID;

                    $scope.disabled = false;
                    $scope.newReport = { REPORT_DATE: $scope.newReport.REPORT_DATE, STATE: theState, EVENT_ID: eID };
                    $scope.DeployStaff = {}; $scope.GenStaff = {}; $scope.InlandStaff = {};
                    $scope.CoastStaff = {}; $scope.WaterStaff = {};
                    var previousDay = new Date(myDate);
                    previousDay.setHours(0, 0, 0, 0);
                    previousDay = previousDay.toISOString().substr(0, 10);
                    
                    var yesterdayRpt = $scope.reports.filter(function (r) {
                        var repDate = r.REPORT_DATE.toString().substring(0, 10);
                        return (r.EVENT_ID == $scope.newReport.EVENT_ID && r.STATE == $scope.newReport.STATE) && (repDate == previousDay);
                    })[0];
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    if (yesterdayRpt !== undefined) {
                        // PERSONNEL populating
                        $scope.newReport.SW_YEST_FIELDPERS = yesterdayRpt.SW_TOD_FIELDPERS;
                        $scope.newReport.WQ_YEST_FIELDPERS = yesterdayRpt.WQ_TOD_FIELDPERS;
                        $scope.newReport.SW_YEST_OFFICEPERS = yesterdayRpt.SW_TOD_OFFICEPERS;
                        $scope.newReport.WQ_YEST_OFFICEPERS = yesterdayRpt.WQ_TOD_OFFICEPERS;

                        // CONTACTS populating 
                        getReportContacts(yesterdayRpt.REPORTING_METRICS_ID);
                    }//end if yesterdayRpt != undefined
                    else {
                        $scope.newReport.SW_YEST_FIELDPERS = 0;
                        $scope.newReport.WQ_YEST_FIELDPERS = 0;
                        $scope.newReport.SW_YEST_OFFICEPERS = 0;
                        $scope.newReport.WQ_YEST_OFFICEPERS = 0;
                    }
                    //now get totals for all sensors and hwms to populate in this newReport
                    REPORT.getDailyReportTots({ Date: myDate, Event: $scope.newReport.EVENT_ID, State: $scope.newReport.STATE }, function success(response6) {
                        //only care about the counts
                        $scope.newReport.DEP_RAPDEPL_GAGE = response6.DEP_RAPDEPL_GAGE;
                        $scope.newReport.REC_RAPDEPL_GAGE = response6.REC_RAPDEPL_GAGE;
                        $scope.newReport.LOST_RAPDEPL_GAGE = response6.LOST_RAPDEPL_GAGE;
                        $scope.newReport.DEP_WTRLEV_SENSOR = response6.DEP_WTRLEV_SENSOR;
                        $scope.newReport.REC_WTRLEV_SENSOR = response6.REC_WTRLEV_SENSOR;
                        $scope.newReport.LOST_WTRLEV_SENSOR = response6.LOST_WTRLEV_SENSOR;
                        $scope.newReport.DEP_WV_SENS = response6.DEP_WV_SENS;
                        $scope.newReport.REC_WV_SENS = response6.REC_WV_SENS;
                        $scope.newReport.LOST_WV_SENS = response6.LOST_WV_SENS;
                        $scope.newReport.DEP_BAROMETRIC = response6.DEP_BAROMETRIC;
                        $scope.newReport.REC_BAROMETRIC = response6.REC_BAROMETRIC;
                        $scope.newReport.LOST_BAROMETRIC = response6.LOST_BAROMETRIC;
                        $scope.newReport.DEP_METEOROLOGICAL = response6.DEP_METEOROLOGICAL;
                        $scope.newReport.REC_METEOROLOGICAL = response6.REC_METEOROLOGICAL;
                        $scope.newReport.LOST_METEOROLOGICAL = response6.LOST_METEOROLOGICAL;
                        $scope.newReport.HWM_FLAGGED = response6.HWM_FLAGGED;
                        $scope.newReport.HWM_COLLECTED = response6.HWM_COLLECTED;
                    }, function error(errorResponse6) {
                        alert("Error: " + errorResponse6.statusText);
                    });
                }
                else {
                    alert("Please choose a date, event and state first.");
                }
            }; // end populateYestTots

            //save this report and it's contacts
            $scope.saveReport = function (valid) {
                if ($scope.newReport.COMPLETE === undefined || $scope.newReport.COMPLETE === 0) {
                    //don't worry if valid, just postput modal confirming they want to save this without marking it complete
                    var modalInstance = $uibModal.open({
                        templateUrl: 'saveReportModal.html',
                        controller: 'confirmReportModalCtrl',
                        size: 'sm'
                    });
                    modalInstance.result.then(function () {
                        //yes, post this as incomplete
                        $scope.newReport.COMPLETE = 0;
                        $scope.newReport.MEMBER_ID = $scope.MemberLoggedIn.MEMBER_ID;
                        PostPutReportAndReportContacts();
                    });//end modalInstance.result.then
                } else {
                    //..COMPLETE is 1 .. check if valid
                    if (valid) {
                        //the report is complete and valid, just post/put it                        
                        $scope.newReport.MEMBER_ID = $scope.MemberLoggedIn.MEMBER_ID;
                        PostPutReportAndReportContacts();
                    } else {
                        //alert("All fields are required");
                        $scope.status.openContacts = true;
                        angular.element("[name='" + $scope.fullReportForm.submit.$name + "']").find('.ng-invalid:visible:first').focus();
                    }
                }
            };

            $scope.populateDeployer = function () {
                $scope.DeployStaff = $scope.MemberLoggedIn;
            };
            //incomplete report was clicked, go get it and the contacts for it
            $scope.getIncompleteReport = function () {
                var reportId = this.ir.REPORTING_METRICS_ID;
                REPORT.query({ id: reportId }, function success(response) {
                    $scope.newReport = response;
                    //if Chrome, format date:
                    var yr = response.REPORT_DATE.substr(0, 4);
                    var mo = response.REPORT_DATE.substr(5, 2);
                    var day = response.REPORT_DATE.substr(8, 2);
                    $scope.newReport.REPORT_DATE = new Date(mo + "/" + day + "/" + yr);
                    //$scope.newReport.REPORT_DATE = new Date($scope.newReport.REPORT_DATE);
                    $scope.fullReportForm.submit.$setDirty();
                    //get contacts 
                    getReportContacts(reportId);
                }).$promise;
            };
        }]);
})();