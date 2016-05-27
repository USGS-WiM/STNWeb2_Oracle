(function () {
    /* controllers.js, 'leaflet-directive''ui.unique','ngTagsInput',*/
    'use strict';

    var SettingsControllers = angular.module('SettingsControllers',
      ['ngInputModified', 'ui.validate', 'angular.filter', 'xeditable', 'checklist-model', 'ngFileUpload']);

    var STNControllers = angular.module('STNControllers', []);
    var ModalControllers = angular.module('ModalControllers', []);

    //#region $ccokies variables
    /*
    * STNCreds, STNUsername, usersName, mID, usersRole, SessionEventID, SessionEventName
    */
    //#endregion $cookies variables

    //#region CONSTANTS    
    //regular expression for a password requirement of at least 8 characters long and at least 3 of 4 character categories used (upper, lower, digit, special
    STNControllers.constant('RegExp', {
        PASSWORD: /^(((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[A-Z])(?=.*[!@@?#$%^&_:;-]))|((?=.*[a-z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))|((?=.*[A-Z])(?=.*[0-9])(?=.*[!@@?#$%^&_:;-]))).{8,}$/
    });
    //#endregion CONSTANTS

    
})();