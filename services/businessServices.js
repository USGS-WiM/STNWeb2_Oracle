(function () {
    'use strict';

    var STNBusinessServices = angular.module('STNBusinessServices', ['ngCookies']);

    //#region SETTERS
    //set the credentials (encodedToken, username, usersName, usersRole)  when user logs in
    STNBusinessServices.factory('setCreds', ['$cookies', function ($cookies) {
        return function (un, pw, userName, userRole, userID) {
            var token = un.concat(":", pw);
            $cookies.STNCreds = token;

            $cookies.STNUsername = un;
            $cookies.usersName = userName;
            $cookies.mID = userID;
            var roleName;
            switch(userRole) {
                case 1:
                    roleName = "Admin";
                    break;
                case 2:
                    roleName = "Manager";
                    break;
                case 3:
                    roleName = "Field";
                    break;
                case 4:
                    roleName = "Public";
                    break;
                default:
                    roleName = "CitizenManager";
                    break;
            }
            $cookies.usersRole = roleName;
        };
    }]);

    //set the event they choose from home page, looked for through out app
    STNBusinessServices.factory('setSessionEvent', ['$cookies', function ($cookies) {
        return function (evId, evName) {
            $cookies.SessionEventID = evId;
            $cookies.SessionEventName = evName;
        };
    }]);

    //set the team they choose from home page, looked for through out app
    STNBusinessServices.factory('setSessionTeam', ['$cookies', function ($cookies) {
        return function (tId, tName) {
            $cookies.SessionTeaID = tId;
            $cookies.SessionTeamName = tName;
        };
    }]);

    STNBusinessServices.factory('setLoggedIn', ['$cookies', function ($cookies) {
        var loggedIn = false;
        return {
            isLoggedIn: function () {
                return loggedIn;
            },
            changeLoggedIn: function (YesOrNo) {
                loggedIn = YesOrNo;

            }
        };
    }]);

    //#endregion SETTERS

    //#region GETTERS
    //check the status of user's credentials. if return false = redirect to login 
    STNBusinessServices.factory('checkCreds', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = false;
            var STNCreds = $cookies.STNCreds;

            if (STNCreds !== undefined && STNCreds !== "") {
                returnVal = true;
            }
            return returnVal;
        };
    }]);

    //retrieve user's 'token' from cookie
    STNBusinessServices.factory('getCreds', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var STNCreds = $cookies.STNCreds;

            if (STNCreds !== undefined && STNCreds !== "") {
                returnVal = btoa(STNCreds);
            }
            return returnVal;
        };
    }]);

    //retrieve user from cookie
    STNBusinessServices.factory('getUsersNAME', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var usesName = $cookies.usersName;

            if (usesName !== undefined && usesName !== "") {
                returnVal = usesName;
            }
            return returnVal;
        };
    }]);

    //retrieve users ID from cookie
    STNBusinessServices.factory('getUserID', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var userID = $cookies.mID;

            if (userID !== undefined && userID !== "") {
                returnVal = userID;
            }
            return returnVal;
        };
    }]);

    //get the username to use throughout the application
    STNBusinessServices.factory('getUsername', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var STNUsername = $cookies.STNUsername;

            if (STNUsername !== undefined && STNUsername !== "") {
                returnVal = STNUsername;
            }
            return returnVal;
        };
    }]);

    //get the Role to use throughout the application
    STNBusinessServices.factory('getUserRole', ['$cookies', function ($cookies) {
        return function () {
            var returnVal = "";
            var userRole = $cookies.usersRole;

            if (userRole !== undefined && userRole !== "") {
                returnVal = userRole;
            }
            return returnVal;
        };
    }]);
    //#endregion GETTERS

    //DELETE////////////////////////
    //delete the credentials
    STNBusinessServices.factory('deleteCreds', ['$cookies', function ($cookies) {
        return function () {
            $cookies.STNCreds = "";
            $cookies.STNUsername = "";
            $cookies.usersName = "";
            $cookies.usersRole = "";
        };
    }]);
})();