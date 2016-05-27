(function () {
    'use strict';

    var ModalControllers = angular.module('ModalControllers');

    ModalControllers.controller('siteModalCtrl', ['$scope', '$rootScope', '$cookies', '$q', '$location', '$state', '$http', '$sce', '$timeout', '$uibModal', '$uibModalInstance', '$filter', 'leafletMarkerEvents', 'allDropDownParts', 'latlong', 'thisSiteStuff', 
        'SITE', 'SITE_HOUSING', 'MEMBER', 'INSTRUMENT', 'INSTRUMENT_STATUS', 'LANDOWNER_CONTACT', 
        function ($scope, $rootScope, $cookies, $q, $location, $state, $http, $sce, $timeout, $uibModal, $uibModalInstance, $filter, leafletMarkerEvents, allDropDownParts, latlong, thisSiteStuff, SITE, SITE_HOUSING, 
            MEMBER, INSTRUMENT, INSTRUMENT_STATUS, LANDOWNER_CONTACT) {
            //dropdowns
            $scope.HorizontalDatumList = allDropDownParts[0];
            $scope.HorCollMethodList = allDropDownParts[1];
            $scope.StateList = allDropDownParts[2];
            $scope.AllCountyList = allDropDownParts[3];
            $scope.stateCountyList = [];
            $scope.DMS = {}; //holder of deg min sec values
            $scope.allHousingTypeList = allDropDownParts[4];
            $scope.DepPriorityList = allDropDownParts[5];
            $scope.NetNameList = allDropDownParts[6];
            $scope.NetTypeList = allDropDownParts[7];
            $scope.ProposedSens = allDropDownParts[8];
            $scope.SensorDeployment = allDropDownParts[9];
            $scope.userRole = $cookies.get('usersRole');
            $scope.closeSites = 0;
            $scope.showMap = false;
            $scope.siteLat = 0;
            $scope.siteLong = 0;
            $scope.htmlDescriptionTip = $sce.trustAsHtml('Required by NWIS. Can be listed as <em>\'unknown\'</em> or <em>\'Atlantic Ocean\'</em>');
            $scope.mapCenter = {
                lat: $scope.siteLat,
                lng: $scope.siteLong,
                zoom: 17
            };

            //#region regex/redialect on puerto rico county names with tildes
            /*  Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
                http://www.apache.org/licenses/LICENSE-2.0   Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS,
                WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.
            */
            var defaultDiacriticsRemovalMap = [
                { 'base': 'A', 'letters': '\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F' },
                { 'base': 'AA', 'letters': '\uA732' },
                { 'base': 'AE', 'letters': '\u00C6\u01FC\u01E2' },
                { 'base': 'AO', 'letters': '\uA734' },
                { 'base': 'AU', 'letters': '\uA736' },
                { 'base': 'AV', 'letters': '\uA738\uA73A' },
                { 'base': 'AY', 'letters': '\uA73C' },
                { 'base': 'B', 'letters': '\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181' },
                { 'base': 'C', 'letters': '\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E' },
                { 'base': 'D', 'letters': '\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779' },
                { 'base': 'DZ', 'letters': '\u01F1\u01C4' },
                { 'base': 'Dz', 'letters': '\u01F2\u01C5' },
                { 'base': 'E', 'letters': '\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E' },
                { 'base': 'F', 'letters': '\u0046\u24BB\uFF26\u1E1E\u0191\uA77B' },
                { 'base': 'G', 'letters': '\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E' },
                { 'base': 'H', 'letters': '\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D' },
                { 'base': 'I', 'letters': '\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197' },
                { 'base': 'J', 'letters': '\u004A\u24BF\uFF2A\u0134\u0248' },
                { 'base': 'K', 'letters': '\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2' },
                { 'base': 'L', 'letters': '\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780' },
                { 'base': 'LJ', 'letters': '\u01C7' },
                { 'base': 'Lj', 'letters': '\u01C8' },
                { 'base': 'M', 'letters': '\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C' },
                { 'base': 'N', 'letters': '\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4' },
                { 'base': 'NJ', 'letters': '\u01CA' },
                { 'base': 'Nj', 'letters': '\u01CB' },
                { 'base': 'O', 'letters': '\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C' },
                { 'base': 'OI', 'letters': '\u01A2' },
                { 'base': 'OO', 'letters': '\uA74E' },
                { 'base': 'OU', 'letters': '\u0222' },
                { 'base': 'OE', 'letters': '\u008C\u0152' },
                { 'base': 'oe', 'letters': '\u009C\u0153' },
                { 'base': 'P', 'letters': '\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754' },
                { 'base': 'Q', 'letters': '\u0051\u24C6\uFF31\uA756\uA758\u024A' },
                { 'base': 'R', 'letters': '\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782' },
                { 'base': 'S', 'letters': '\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784' },
                { 'base': 'T', 'letters': '\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786' },
                { 'base': 'TZ', 'letters': '\uA728' },
                { 'base': 'U', 'letters': '\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244' },
                { 'base': 'V', 'letters': '\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245' },
                { 'base': 'VY', 'letters': '\uA760' },
                { 'base': 'W', 'letters': '\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72' },
                { 'base': 'X', 'letters': '\u0058\u24CD\uFF38\u1E8A\u1E8C' },
                { 'base': 'Y', 'letters': '\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE' },
                { 'base': 'Z', 'letters': '\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762' },
                { 'base': 'a', 'letters': '\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250' },
                { 'base': 'aa', 'letters': '\uA733' },
                { 'base': 'ae', 'letters': '\u00E6\u01FD\u01E3' },
                { 'base': 'ao', 'letters': '\uA735' },
                { 'base': 'au', 'letters': '\uA737' },
                { 'base': 'av', 'letters': '\uA739\uA73B' },
                { 'base': 'ay', 'letters': '\uA73D' },
                { 'base': 'b', 'letters': '\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253' },
                { 'base': 'c', 'letters': '\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184' },
                { 'base': 'd', 'letters': '\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A' },
                { 'base': 'dz', 'letters': '\u01F3\u01C6' },
                { 'base': 'e', 'letters': '\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD' },
                { 'base': 'f', 'letters': '\u0066\u24D5\uFF46\u1E1F\u0192\uA77C' },
                { 'base': 'g', 'letters': '\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F' },
                { 'base': 'h', 'letters': '\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265' },
                { 'base': 'hv', 'letters': '\u0195' },
                { 'base': 'i', 'letters': '\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131' },
                { 'base': 'j', 'letters': '\u006A\u24D9\uFF4A\u0135\u01F0\u0249' },
                { 'base': 'k', 'letters': '\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3' },
                { 'base': 'l', 'letters': '\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747' },
                { 'base': 'lj', 'letters': '\u01C9' },
                { 'base': 'm', 'letters': '\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F' },
                { 'base': 'n', 'letters': '\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5' },
                { 'base': 'nj', 'letters': '\u01CC' },
                { 'base': 'o', 'letters': '\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275' },
                { 'base': 'oi', 'letters': '\u01A3' },
                { 'base': 'ou', 'letters': '\u0223' },
                { 'base': 'oo', 'letters': '\uA74F' },
                { 'base': 'p', 'letters': '\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755' },
                { 'base': 'q', 'letters': '\u0071\u24E0\uFF51\u024B\uA757\uA759' },
                { 'base': 'r', 'letters': '\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783' },
                { 'base': 's', 'letters': '\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B' },
                { 'base': 't', 'letters': '\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787' },
                { 'base': 'tz', 'letters': '\uA729' },
                { 'base': 'u', 'letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289' },
                { 'base': 'v', 'letters': '\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C' },
                { 'base': 'vy', 'letters': '\uA761' },
                { 'base': 'w', 'letters': '\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73' },
                { 'base': 'x', 'letters': '\u0078\u24E7\uFF58\u1E8B\u1E8D' },
                { 'base': 'y', 'letters': '\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF' },
                { 'base': 'z', 'letters': '\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763' }
            ];
            var diacriticsMap = {};
            for (var i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
                var letters = defaultDiacriticsRemovalMap[i].letters;
                for (var j = 0; j < letters.length ; j++) {
                    diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
                }
            }
            // "what?" version ... http://jsperf.com/diacritics/12
            function removeDiacritics(str) {
                return str.replace(/[^\u0000-\u007E]/g, function (a) {
                    return diacriticsMap[a] || a;
                });
            }
            //#endregion

            $scope.events = {
                mapMarkers: {
                    enable: leafletMarkerEvents.getAvailableEvents()
                }
            };
            $scope.mapMarkers = [];
            
            var icons = {
                stn: {
                    type: 'div',
                    iconSize: [10, 10],
                    className: 'stnSiteIcon'
                },
                newSTN: {
                    type: 'div',
                    iconSize: [10, 10],
                    className: 'newSiteIcon',
                    iconAnchor: [5, 5]
                }
            };
            //convert deg min sec to dec degrees
            var azimuth = function (deg, min, sec) {
                var azi = 0;
                if (deg < 0) {
                    azi = -1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
                    return (-1.0 * azi).toFixed(5);
                }
                else {
                    azi = 1.0 * deg + 1.0 * min / 60.0 + 1.0 * sec / 3600.0;
                    return (azi).toFixed(5);
                }
            };

            $scope.updateAddressOnly = function () {
                var geocoder = new google.maps.Geocoder(); //reverse address lookup
                if ($scope.DMS.LADeg !== undefined) $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                if ($scope.DMS.LODeg !== undefined) $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                var latlng = new google.maps.LatLng($scope.aSite.LATITUDE_DD, $scope.aSite.LONGITUDE_DD);
                geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        //parse the results out into components ('street_number', 'route', 'locality', 'administrative_area_level_2', 'administrative_area_level_1', 'postal_code'
                        var address_components = results[0].address_components;
                        var components = {};
                        $.each(address_components, function (k, v1) {
                            $.each(v1.types, function (k2, v2) {
                                components[v2] = v1.long_name;
                            });
                        });
                        var thisState = undefined;
                        if (components.country !== "United States") {
                            $scope.aSite.ADDRESS = components.route;
                            $scope.aSite.CITY = components.administrative_area_level_1;
                            thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.political; })[0];
                        } else {
                            $scope.aSite.ADDRESS = components.street_number !== undefined ? components.street_number + " " + components.route : components.route;
                            $scope.aSite.CITY = components.locality;
                            thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.administrative_area_level_1; })[0];
                        }//end this is in the US
                        if (thisState !== undefined) {
                            $scope.aSite.STATE = thisState.STATE_ABBREV;
                            $scope.stateCountyList = $scope.AllCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                            $scope.aSite.COUNTY = components.country !== "United States" ? removeDiacritics(components.administrative_area_level_1) + " Municipio" : components.administrative_area_level_2;
                            $scope.aSite.ZIP = components.postal_code;
                        }
                    }
                });
            };
            ///update newSite lat/lng after dragend
            $scope.$on("leafletDirectiveMarker.dragend", function (event, args) {
                var dragendLocation = args.model;
                //update lat/long
                $scope.aSite.LATITUDE_DD = parseFloat(dragendLocation.lat.toFixed(6));
                $scope.aSite.LONGITUDE_DD = parseFloat(dragendLocation.lng.toFixed(6));
                //update dms also in case they have that showing
                var latDMS = (deg_to_dms($scope.aSite.LATITUDE_DD)).toString();
                var ladDMSarray = latDMS.split(':');
                $scope.DMS.LADeg = ladDMSarray[0];
                $scope.DMS.LAMin = ladDMSarray[1];
                $scope.DMS.LASec = ladDMSarray[2];

                var longDMS = deg_to_dms($scope.aSite.LONGITUDE_DD);
                var longDMSarray = longDMS.split(':');
                $scope.DMS.LODeg = longDMSarray[0] * -1;
                $scope.DMS.LOMin = longDMSarray[1];
                $scope.DMS.LOSec = longDMSarray[2];
            
                $scope.updateAddressOnly();
            });

            //get address parts and existing sites 
            $scope.getAddress = function () {
                if ($scope.DMS.LADeg !== undefined) $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                if ($scope.DMS.LODeg !== undefined) $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                if ($scope.aSite.LATITUDE_DD !== undefined && $scope.aSite.LONGITUDE_DD !== undefined) {
                    $scope.mapCenter = { lat: parseFloat($scope.aSite.LATITUDE_DD), lng: parseFloat($scope.aSite.LONGITUDE_DD), zoom: 18 };
                    $scope.mapMarkers = [];
                    var geocoder = new google.maps.Geocoder(); //reverse address lookup
                    var latlng = new google.maps.LatLng($scope.aSite.LATITUDE_DD, $scope.aSite.LONGITUDE_DD);
                    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            //parse the results out into components ('street_number', 'route', 'locality', 'administrative_area_level_2', 'administrative_area_level_1', 'postal_code'
                            var address_components = results[0].address_components;
                            var components = {};
                            $.each(address_components, function (k, v1) {
                                $.each(v1.types, function (k2, v2) {
                                    components[v2] = v1.long_name;
                                });
                            });
                            var thisState = undefined;
                            if (components.country !== "United States") {
                                $scope.aSite.ADDRESS = components.route;
                                $scope.aSite.CITY = components.administrative_area_level_1;
                                thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.political; })[0];
                            } else {
                                $scope.aSite.ADDRESS = components.street_number !== undefined ? components.street_number + " " + components.route : components.route;
                                $scope.aSite.CITY = components.locality;
                                thisState = $scope.StateList.filter(function (s) { return s.STATE_NAME == components.administrative_area_level_1; })[0];
                            }//end this is in the US
                            if (thisState !== undefined) {
                                $scope.aSite.STATE = thisState.STATE_ABBREV;
                                $scope.stateCountyList = $scope.AllCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
                                $scope.aSite.COUNTY = components.country !== "United States" ? removeDiacritics(components.administrative_area_level_1) + " Municipio" : components.administrative_area_level_2;
                                $scope.aSite.ZIP = components.postal_code;

                                //see if there are any sites within a 0.0005 buffer of here for them to use instead
                                SITE.query({ Latitude: $scope.aSite.LATITUDE_DD, Longitude: $scope.aSite.LONGITUDE_DD, Buffer: 0.0005 }, function success(response) {
                                    $scope.closeSites = response.Sites;
                                    if ($scope.closeSites.length > 0) {
                                        for (var i = 0; i < $scope.closeSites.length; i++) {
                                            var a = $scope.closeSites[i];
                                            $scope.mapMarkers.push({
                                                lat: a.latitude,
                                                lng: a.longitude,
                                                SITE_ID: a.SITE_ID,
                                                SITE_NO: a.SITE_NO,
                                                icon: icons.stn,
                                                message: a.SITE_NO,
                                                focus: false
                                            });
                                        }
                                    }
                                    $scope.mapMarkers.push({
                                        lat: parseFloat($scope.aSite.LATITUDE_DD),
                                        lng: parseFloat($scope.aSite.LONGITUDE_DD),
                                        icon: icons.newSTN,
                                        message: 'New draggable STN site',
                                        focus: false,
                                        draggable: true
                                    });

                                    $scope.showMap = true;

                                }, function error(errorResponse) {
                                    toastr.error("Error: " + errorResponse.statusText);
                                }).$promise;
                            } else {
                                toastr.error("The Latitude/Longitude did not return a location within the U.S.");
                            }
                            
                        } else {
                            toastr.error("There was an error getting address. Please try again.");
                        }
                    });
                } else {
                    //they did not type a lat/long first...
                    var emptyLatLongModal = $uibModal.open({
                        template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                            '<div class="modal-body"><p>Please provide a Latitude and Longitude before clicking Verify Location</p></div>' +
                            '<div class="modal-footer"><button type="button" class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                        controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                            $scope.ok = function () {
                                $uibModalInstance.close();
                            };
                        }],
                        size: 'sm'
                    });
                }
            };

            //globals 
            $scope.houseDirty = false; $scope.netNameDirty = false; $scope.netTypeDirty = false;
            $scope.siteHouseTypesTable = [];
            $scope.aSite = {};

            //if latlong, then it's coming from the map tab. populate lat,long,hdatum and do geosearch
            if (latlong !== undefined) {
                $scope.aSite.LATITUDE_DD = parseFloat(latlong[0].toFixed(6));
                $scope.aSite.LONGITUDE_DD = parseFloat(latlong[1].toFixed(6));
                $scope.aSite.HDATUM_ID = 4;
                $scope.aSite.HCOLLECT_METHOD_ID = 4;
                $scope.getAddress(); //get the address using passed in lat/long and check for nearby sites
            }

            $scope.aSite.decDegORdms = 'dd';
            
            $scope.originalSiteHousings = [];
            $scope.checked = ""; $scope.checkedName = "Not Defined"; //comparers for disabling network names if 'Not Defined' checked
            $scope.landowner = {};
            $scope.addLandowner = false; //hide landowner fields
            $scope.disableSensorParts = false; //toggle to disable/enable sensor housing installed and add proposed sensor
            $scope.showSiteHouseTable = false;
            $scope.siteHouseTypesTable = []; //holder for when adding housing type to page from multiselect
            $scope.siteHousesModel = {};
            $scope.siteHousesToRemove = []; //holder for editing site to add removing house types to for PUT
            $scope.siteNetworkNames = []; //holds the NetworkName (list of strings) to pass back;
            $scope.siteNetworkTypes = []; //holds the NetworkType (list of strings) to pass back;
           
            //lat modal 
            var openLatModal = function (w) {
                var latModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Latitude must be between 0 and 73.0</p></div>' +
                        '<div class="modal-footer"><button type="button" class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                    }],
                    size: 'sm'
                });
                latModal.result.then(function (fieldFocus) {
                    if (w == 'latlong') $("#LATITUDE_DD").focus();
                    else $("#LaDeg").focus();
                });
            };

            //long modal
            var openLongModal = function (w) {
                var longModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Error</h3></div>' +
                        '<div class="modal-body"><p>The Longitude must be between -175.0 and -60.0</p></div>' +
                        '<div class="modal-footer"><button type="button" class="btn btn-primary" ng-enter="ok()" ng-click="ok()">OK</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.ok = function () {
                            $uibModalInstance.close();
                        };
                    }],
                    size: 'sm'
                });
                longModal.result.then(function (fieldFocus) {
                    if (w == 'latlong') $("#LONGITUDE_DD").focus();
                    else $("#LoDeg").focus();
                });
            };

            //make sure lat/long are right number range
            $scope.checkValue = function (d) {
                if (d == 'dms') {
                    //check the degree value
                    if ($scope.DMS.LADeg < 0 || $scope.DMS.LADeg > 73) {
                        openLatModal('dms');
                    }
                    if ($scope.DMS.LODeg < -175 || $scope.DMS.LODeg > -60) {
                        openLongModal('dms');
                    }
                } else {
                    //check the latitude/longitude
                    if ($scope.aSite.LATITUDE_DD < 0 || $scope.aSite.LATITUDE_DD > 73) {
                        openLatModal('latlong');
                    }
                    if ($scope.aSite.LONGITUDE_DD < -175 || $scope.aSite.LONGITUDE_DD > -60) {
                        openLongModal('latlong');
                    }
                }
            };

            //convert dec degrees to dms
            var deg_to_dms = function (deg) {
                if (deg < 0) {
                    deg = deg.toString();

                    //longitude, remove the - sign
                    deg = deg.substring(1);
                }
                var d = Math.floor(deg);
                var minfloat = (deg - d) * 60;
                var m = Math.floor(minfloat);
                var s = ((minfloat - m) * 60).toFixed(3);

                return ("" + d + ":" + m + ":" + s);
            };

            //they changed radio button for dms dec deg
            $scope.latLongChange = function () {
                if ($scope.aSite.decDegORdms == "dd") {
                    //they clicked Dec Deg..
                    if ($scope.DMS.LADeg !== undefined) {
                        //convert what's here for each lat and long
                        $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                        $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                        var test;
                    }
                } else {
                    //they clicked dms (convert lat/long to dms)
                    if ($scope.aSite.LATITUDE_DD !== undefined) {
                        var latDMS = (deg_to_dms($scope.aSite.LATITUDE_DD)).toString();
                        var ladDMSarray = latDMS.split(':');
                        $scope.DMS.LADeg = ladDMSarray[0];
                        $scope.DMS.LAMin = ladDMSarray[1];
                        $scope.DMS.LASec = ladDMSarray[2];

                        var longDMS = deg_to_dms($scope.aSite.LONGITUDE_DD);
                        var longDMSarray = longDMS.split(':');
                        $scope.DMS.LODeg = longDMSarray[0] * -1;
                        $scope.DMS.LOMin = longDMSarray[1];
                        $scope.DMS.LOSec = longDMSarray[2];
                    }
                }
            };

            //networkType check event --trigger dirty
            $scope.netTypeChg = function () {
                $scope.netTypeDirty = true;
            };

            //networkName check event.. if "Not Defined" chosen, disable the other 2 checkboxes
            $scope.whichOne = function (n) {
                $scope.netNameDirty = true;
                if (n.NAME == "Not Defined" && n.selected === true) {
                    //they checked "not defined"
                    for (var nn = 0; nn < $scope.NetNameList.length; nn++) {
                        //unselect all but not defined
                        if ($scope.NetNameList[nn].NAME != "Not Defined")
                            $scope.NetNameList[nn].selected = false;
                    }
                    //make these match so rest get disabled
                    $scope.checked = "Not Defined";
                }
                //they they unchecked not define, unmatch vars so the other become enabled
                if (n.NAME == "Not Defined" && n.selected === false)
                    $scope.checked = "";
            };

            //toggle dim on div for sensor not appropriate click
            $scope.dimAction = function () {
                if ($scope.aSite.SENSOR_NOT_APPROPRIATE == 1) {
                    $scope.disableSensorParts = true;
                    //clear radio and checkboxes if disabling
                    for (var x = 0; x < $scope.ProposedSens.length; x++) {
                        $scope.ProposedSens[x].selected = false;
                    }
                    $scope.aSite.IS_PERMANENT_HOUSING_INSTALLED = "No";
                } else {
                    $scope.disableSensorParts = false;
                }
            };

            $scope.useSiteAddress;
            $scope.useAddressforLO = function () {
                if ($scope.useSiteAddress) {
                    $scope.landowner.ADDRESS = $scope.aSite.ADDRESS;
                    $scope.landowner.CITY = $scope.aSite.CITY;
                    $scope.landowner.STATE = $scope.aSite.STATE;
                    $scope.landowner.ZIP = $scope.aSite.ZIP;
                } else {
                    $scope.landowner.ADDRESS = "";
                    $scope.landowner.CITY = "";
                    $scope.landowner.STATE = "";
                    $scope.landowner.ZIP = "";
                }
            };
            //site PUT
            $scope.save = function (valid) {
                if (valid) {
                    $rootScope.stateIsLoading.showLoading = true; // loading..
                    //update the site
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    //did they add or edit the landowner
                    //TODO :: check if the landowner fields are $dirty first..
                
                    if ($scope.addLandowner === true) {
                        //there's a landowner.. edit or add?
                        if ($scope.aSite.LANDOWNERCONTACT_ID !== null && $scope.aSite.LANDOWNERCONTACT_ID !== undefined) {
                            //did they change anything to warrent a put
                            LANDOWNER_CONTACT.update({ id: $scope.aSite.LANDOWNERCONTACT_ID }, $scope.landowner).$promise.then(function () {
                                putSiteAndParts();
                            });
                        } else if ($scope.landowner.FNAME !== undefined || $scope.landowner.LNAME !== undefined || $scope.landowner.TITLE !== undefined ||
                                $scope.landowner.ADDRESS !== undefined || $scope.landowner.CITY !== undefined || $scope.landowner.PRIMARYPHONE !== undefined) {
                            //they added something.. POST (rather than just clicking button and not)
                            LANDOWNER_CONTACT.save($scope.landowner, function success(response) {
                                $scope.aSite.LANDOWNERCONTACT_ID = response.LANDOWNERCONTACTID;
                                putSiteAndParts();
                            }, function error(errorResponse) { toastr.error("Error adding Landowner: " + errorResponse.statusText); });
                        } else putSiteAndParts();
                    } else putSiteAndParts();
                }
            };//end save
            var putSiteAndParts = function () {
                if ($scope.DMS.LADeg !== undefined) $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                if ($scope.DMS.LODeg !== undefined) $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                SITE.update({ id: $scope.aSite.SITE_ID }, $scope.aSite, function success(response) {      
                    //update site housings
                    var defer = $q.defer();
                    var RemovePromises = [];
                    var AddPromises = [];
                    //Remove siteHousings (these are just SITE_HOUSING_ID 's
                    angular.forEach($scope.siteHousesToRemove, function (shID) {
                        var delSHProm = SITE_HOUSING.delete({ id: shID }).$promise;
                        RemovePromises.push(delSHProm);
                    });

                    //Remove NetNames
                    if ($scope.netNameDirty === true) {
                        angular.forEach($scope.NetNameList, function (nnL) {
                            if (nnL.selected === false) {
                                //delete it
                                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                                var NNtoDelete = { NETWORK_NAME_ID: nnL.NETWORK_NAME_ID, NAME: nnL.NAME };
                                var delNNProm = SITE.deleteSiteNetworkName({ id: $scope.aSite.SITE_ID }, NNtoDelete).$promise;
                                RemovePromises.push(delNNProm);
                                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                            }
                        });
                    }//end netName dirty

                    //Remove NetTypes
                    if ($scope.netTypeDirty === true) {
                        angular.forEach($scope.NetTypeList, function (ntL) {
                            if (ntL.selected === false) {
                                //delete it if they are removing it
                                $http.defaults.headers.common['X-HTTP-Method-Override'] = 'DELETE';
                                var NTtoDelete = { NETWORK_TYPE_ID: ntL.NETWORK_TYPE_ID, NETWORK_TYPE_NAME: ntL.NETWORK_TYPE_NAME };
                                var delNTProm = SITE.deleteSiteNetworkType({ id: $scope.aSite.SITE_ID }, NTtoDelete).$promise;
                                RemovePromises.push(delNTProm);
                                delete $http.defaults.headers.common['X-HTTP-Method-Override'];
                            }                        
                        });
                    }//end netType dirty

                    //Add siteHousings
                    if ($scope.houseDirty === true) {
                        angular.forEach($scope.siteHouseTypesTable, function (ht) {
                            var addHtProm;
                            if (ht.SITE_HOUSING_ID !== undefined) {
                                //PUT it
                                addHtProm = SITE_HOUSING.update({ id: ht.SITE_HOUSING_ID }, ht).$promise;
                            } else {
                                //POST it
                                addHtProm = SITE.postSiteHousing({ id: $scope.aSite.SITE_ID }, ht).$promise;
                            }
                            AddPromises.push(addHtProm);
                        });
                    }//end they touched it

                    //Add NetNames
                    angular.forEach($scope.NetNameList, function (AnnL) {
                        if (AnnL.selected === true) {
                            $scope.siteNetworkNames.push(AnnL.NAME);
                            //post it (if it's there already, it won't do anything)
                            var NNtoAdd = { NETWORK_NAME_ID: AnnL.NETWORK_NAME_ID, NAME: AnnL.NAME };
                            var addNNProm = SITE.postSiteNetworkName({ id: $scope.aSite.SITE_ID }, NNtoAdd).$promise;
                            AddPromises.push(addNNProm);
                        }
                    });
                    //Add NetTypes
                    angular.forEach($scope.NetTypeList, function (AnTL) {
                        if (AnTL.selected === true) {
                            $scope.siteNetworkTypes.push(AnTL.NETWORK_TYPE_NAME);
                          //  post it (if it's there already, it won't do anything)
                            var NTtoAdd = { NETWORK_TYPE_ID: AnTL.NETWORK_TYPE_ID, NETWORK_TYPE_NAME: AnTL.NETWORK_TYPE_NAME };
                            var addNTProm = SITE.postSiteNetworkType({ id: $scope.aSite.SITE_ID }, NTtoAdd).$promise;
                            AddPromises.push(addNTProm);
                        }
                    });

                    //ok now run the removes, then the adds and then pass the stuff back out of here.
                    $q.all(RemovePromises).then(function () {
                        $q.all(AddPromises).then(function () {
                            var sendBack = [$scope.aSite, $scope.siteNetworkNames, $scope.siteNetworkTypes];
                            $uibModalInstance.close(sendBack);
                            $rootScope.stateIsLoading.showLoading = false; // loading..
                            toastr.success("Site updated");
                            $location.path('/Site/' + $scope.aSite.SITE_ID + '/SiteDashboard').replace();//.notify(false);
                            $scope.apply;
                        }).catch(function error(msg) {
                            console.error(msg);
                        });
                    }).catch(function error(msg) {
                        console.error(msg);
                    }); //all added
                }, function error(errorResponse) {
                    $rootScope.stateIsLoading.showLoading = false; // loading..
                    toastr.error("Error updating Site: " + errorResponse.statusText);
                });//end SITE.save(...
            }; // end PUTsite()

            //create this site clicked (3 separate functions.. 1: landowner, 2: the site and proposed instruments, 3: network names & types, housing types
            var finishPOST = function (sID) {
                //do all the rest....
                var defer = $q.defer();
                var postPromises = [];
                //site_housingTypes (if any)
                angular.forEach($scope.siteHouseTypesTable, function (htype) {
                    htype.SITE_ID = sID;
                    delete htype.TYPE_NAME;
                    var hTPromise = SITE.postSiteHousing({ id: sID }, htype).$promise;
                    postPromises.push(hTPromise);
                });
                //site_NetworkNames
                angular.forEach($scope.NetNameList, function (nName) {
                    if (nName.selected === true) {
                        var siteNetName = { NETWORK_NAME_ID: nName.NETWORK_NAME_ID, NAME: nName.NAME };
                        var nNPromise = SITE.postSiteNetworkName({ id: sID }, siteNetName).$promise;
                        postPromises.push(nNPromise);
                    }
                });
                //site_NetworkTypes
                angular.forEach($scope.NetTypeList, function (nType) {
                    if (nType.selected === true) {
                        var siteNetType = { NETWORK_TYPE_ID: nType.NETWORK_TYPE_ID, NETWORK_TYPE_NAME: nType.NETWORK_TYPE_NAME };
                        var nTPromise = SITE.postSiteNetworkType({ id: sID }, siteNetType).$promise;
                        postPromises.push(nTPromise);
                    }
                });
                //when all the promises are done
                $q.all(postPromises).then(function (response) {
                    $uibModalInstance.dismiss('cancel');
                    $rootScope.stateIsLoading.showLoading = false; // loading..
                    $timeout(function () {
                        // anything you want can go here and will safely be run on the next digest.                   
                        $state.go('site.dashboard', { id: sID });
                    });
                });//end $q
            };
            $scope.create = function (valid) {
                if (valid === true) {
                    $rootScope.stateIsLoading.showLoading = true; // loading..
                    //POST landowner, if they added one
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    $http.defaults.headers.common.Accept = 'application/json';
                    delete $scope.aSite.Creator; delete $scope.aSite.decDegORdms;
                    if ($scope.addLandowner === true) {
                        if ($scope.landowner.FNAME !== undefined || $scope.landowner.LNAME !== undefined || $scope.landowner.TITLE !== undefined ||
                                       $scope.landowner.ADDRESS !== undefined || $scope.landowner.CITY !== undefined || $scope.landowner.PRIMARYPHONE !== undefined) {
                            LANDOWNER_CONTACT.save($scope.landowner, function success(response) {
                                $scope.aSite.LANDOWNERCONTACT_ID = response.LANDOWNERCONTACTID;
                                //now post the site
                                postSiteAndParts();
                            }, function error(errorResponse) {
                                $rootScope.stateIsLoading.showLoading = false; // loading.. 
                                toastr.error("Error posting landowner: " + errorResponse.statusText);
                            });
                        } else {
                            postSiteAndParts();
                        }
                    } else {
                        postSiteAndParts();
                    }
                }
            };
            var postSiteAndParts = function () {
                //make sure longitude is < 0, otherwise * (-1),
                var createdSiteID = 0;
                if ($scope.DMS.LADeg !== undefined) $scope.aSite.LATITUDE_DD = azimuth($scope.DMS.LADeg, $scope.DMS.LAMin, $scope.DMS.LASec);
                if ($scope.DMS.LODeg !== undefined) $scope.aSite.LONGITUDE_DD = azimuth($scope.DMS.LODeg, $scope.DMS.LOMin, $scope.DMS.LOSec);
                //POST site
                SITE.save($scope.aSite, function success(response) {
                    createdSiteID = response.SITE_ID;
                    //do proposed sensors first since it's 2 parts to it.
                    if ($scope.disableSensorParts === false) {
                        //not disabled..could be selected proposed sensors
                        var selectedProposedSensors = $scope.ProposedSens.filter(function (p) { return p.selected === true; });
                        if (selectedProposedSensors.length > 0) {
                            angular.forEach(selectedProposedSensors, function (propSens, index) {
                                //POST each sensor and status type
                                var sensorTypeID = $scope.SensorDeployment.filter(function (sd) { return sd.DEPLOYMENT_TYPE_ID == propSens.DEPLOYMENT_TYPE_ID; })[0].SENSOR_TYPE_ID;
                                var inst = { DEPLOYMENT_TYPE_ID: propSens.DEPLOYMENT_TYPE_ID, SITE_ID: createdSiteID, SENSOR_TYPE_ID: sensorTypeID };
                                INSTRUMENT.save(inst).$promise.then(function (insResponse) {
                                    var instStat = { INSTRUMENT_ID: insResponse.INSTRUMENT_ID, STATUS_TYPE_ID: 4, MEMBER_ID: $scope.aSite.MEMBER_ID, TIME_STAMP: new Date(), TIME_ZONE: 'UTC' };
                                    INSTRUMENT_STATUS.save(instStat).$promise.then(function () {
                                        //when done looping, go to last step in this post
                                        if (index == selectedProposedSensors.length - 1)
                                            finishPOST(createdSiteID);
                                    });//end status post
                                });//end sensor post
                            });//end angular.foreach on proposed sensors
                        } else finishPOST(createdSiteID);
                    } else {
                        finishPOST(createdSiteID);
                    }
                }, function (errorResponse) {
                    toastr.error("Error creating site: " + errorResponse.statusText);
                });
            };//end postSiteand Parts
        
            if (thisSiteStuff !== undefined) {
                //#region existing site 
                //$scope.aSite[0], $scope.originalSiteHousings[1], $scope.siteHouseTypesTable[2], thisSiteNetworkNames[3], siteNetworkTypes[4], $scope.landowner[5]
                $scope.aSite = angular.copy(thisSiteStuff[0]);
                //for some reason there are tons of sites with HCOLLECT_METHOD_ID set to 0 when it's required..make it null so validation picks up on required field
                if ($scope.aSite.HCOLLECT_METHOD_ID <= 0) $scope.aSite.HCOLLECT_METHOD_ID = null;
                //if this site is not appropriate for sensor, dim next 2 fields
                if ($scope.aSite.SENSOR_NOT_APPROPRIATE > 0) {
                    $scope.disableSensorParts = true;
                    //clear radio and checkboxes if disabling
                    for (var x = 0; x < $scope.ProposedSens.length; x++) {
                        $scope.ProposedSens[x].selected = false;
                    }
                    $scope.aSite.IS_PERMANENT_HOUSING_INSTALLED = "No";
                }

                //update countiesList with this state's counties
                var thisState = $scope.StateList.filter(function (s) { return s.STATE_ABBREV == $scope.aSite.STATE; })[0];
                $scope.stateCountyList = $scope.AllCountyList.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });

                //apply any site housings for EDIT
                if (thisSiteStuff[1].length > 0) {
                    $scope.originalSiteHousings = thisSiteStuff[1]; //for multiselect .selected = true/false
                    $scope.showSiteHouseTable = true;
                    $scope.siteHouseTypesTable = thisSiteStuff[2]; //for table to show all info on house type
                    $scope.landowner = thisSiteStuff[5];
                    $scope.addLandowner = $scope.landowner.FNAME !== undefined || $scope.landowner.LNAME !== undefined || $scope.landowner.ADDRESS !== undefined || $scope.landowner.PRIMARYPHONE !== undefined ? true : false;

                    //go through allHousingTypeList and add selected Property.
                    for (var ht = 0; ht < $scope.allHousingTypeList.length; ht++) {
                        //for each one, if thisSiteHousings has this id, add 'selected:true' else add 'selected:false'
                        for (var y = 0; y < $scope.originalSiteHousings.length; y++) {
                            if ($scope.originalSiteHousings[y].HOUSING_TYPE_ID == $scope.allHousingTypeList[ht].HOUSING_TYPE_ID) {
                                $scope.allHousingTypeList[ht].selected = true;
                                y = $scope.originalSiteHousings.length; //ensures it doesn't set it as false after setting it as true
                            }
                            else {
                                $scope.allHousingTypeList[ht].selected = false;
                            }
                        }
                        if ($scope.originalSiteHousings.length === 0)
                            $scope.allHousingTypeList[ht].selected = false;
                    }

                }//end if thisSiteHousings != undefined

                //apply any site network names or types
                if (thisSiteStuff[3].length > 0) {
                    //for each $scope.NetNameList .. add .selected property = true/false if thissitenetworknames ==
                    for (var a = 0; a < $scope.NetNameList.length; a++) {
                        for (var e = 0; e < thisSiteStuff[3].length; e++) {
                            if (thisSiteStuff[3][e].NETWORK_NAME_ID == $scope.NetNameList[a].NETWORK_NAME_ID) {
                                $scope.NetNameList[a].selected = true;
                                e = thisSiteStuff[3].length;
                            } else {
                                $scope.NetNameList[a].selected = false;
                            }
                            if (thisSiteStuff[3].length === 0)
                                $scope.NetNameList[a].selected = false;
                        }
                    }
                    if ($scope.NetNameList[0].selected === true) {
                        //make these match so rest get disabled
                        $scope.checked = "Not Defined";
                    }
                }//end if thisSiteNetworkNames != undefined

                if (thisSiteStuff[4].length > 0) {
                    //for each $scope.NetTypeList .. add .selected property = true/false if thissitenetworktypes ==
                    for (var ni = 0; ni < $scope.NetTypeList.length; ni++) {
                        for (var ny = 0; ny < thisSiteStuff[4].length; ny++) {
                            if (thisSiteStuff[4][ny].NETWORK_TYPE_ID == $scope.NetTypeList[ni].NETWORK_TYPE_ID) {
                                $scope.NetTypeList[ni].selected = true;
                                ny = thisSiteStuff[4].length;
                            } else {
                                $scope.NetTypeList[ni].selected = false;
                            }
                            if (thisSiteStuff[4].length === 0)
                                $scope.NetTypeList[ni].selected = false;
                        }
                    }
                }//end if thisSiteNetworkNames != undefined            
                //#endregion existing site 
            }
            else {
                //#region this is a NEW SITE CREATE (site == undefined)
                //get logged in member to make them creator
                $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                $http.defaults.headers.common.Accept = 'application/json';
                MEMBER.query({ id: $cookies.get('mID') }, function success(response) {
                    $scope.aSite.Creator = response.FNAME + " " + response.LNAME;
                    $scope.aSite.MEMBER_ID = response.MEMBER_ID;
                    $scope.aSite.IS_PERMANENT_HOUSING_INSTALLED = "No";
                    $scope.aSite.ACCESS_GRANTED = "Not Needed";
                    //TODO: get member's id in there too
                }, function error(errorResponse) {
                    toastr.error("Error getting Member info: " + errorResponse.statusText);
                });
                //#endregion this is a NEW SITE CREATE (site == undefined)
            }//end new site

            //  lat/long =is number
            $scope.isNum = function (evt) {
                var theEvent = evt || window.event;
                var key = theEvent.keyCode || theEvent.which;
                if (key != 46 && key != 45 && key > 31 && (key < 48 || key > 57)) {
                    theEvent.returnValue = false;
                    if (theEvent.preventDefault) theEvent.preventDefault();
                }
            };

            //multiselect one checked..
            $scope.HouseTypeClick = function (ht) {
                $scope.houseDirty = true; //they clicked it..used when post/put
                //add/remove house type and inputs to table row -- foreach on post or put will handle the rest
           
                //new site being created
                if (ht.selected === true) {
                    var houseT = { TYPE_NAME: ht.TYPE_NAME, HOUSING_TYPE_ID: ht.HOUSING_TYPE_ID, LENGTH: ht.LENGTH, MATERIAL: ht.MATERIAL, NOTES: ht.NOTES, AMOUNT: 1 };
                    $scope.siteHouseTypesTable.push(houseT);
                    $scope.showSiteHouseTable = true;
                }
                if (ht.selected === false) {
                    if ($scope.aSite.SITE_ID !== undefined) {
                        var sH_ID = $scope.siteHouseTypesTable.filter(function (h) { return h.TYPE_NAME == ht.TYPE_NAME; })[0].SITE_HOUSING_ID;
                        $scope.siteHousesToRemove.push(sH_ID); //edit page, add SITE_HOUSING_ID to remove list for PUT
                    }
                    var i = $scope.siteHouseTypesTable.indexOf($scope.siteHouseTypesTable.filter(function (h) { return h.TYPE_NAME == ht.TYPE_NAME; })[0]);
                    $scope.siteHouseTypesTable.splice(i, 1);
                    if ($scope.siteHouseTypesTable.length === 0) {
                        $scope.showSiteHouseTable = false;
                    }
                }
            
            };

            // want to add a landowner contact
            $scope.showLandOwnerPart = function () {
                $scope.addLandowner = true;
            };

            //when state changes, update county list
            $scope.updateCountyList = function (s) {
                var thisState = $scope.StateList.filter(function (st) { return st.STATE_ABBREV == s; })[0];
                $scope.stateCountyList = allCounties.filter(function (c) { return c.STATE_ID == thisState.STATE_ID; });
            };

            //cancel modal
            $scope.cancel = function () {
                $rootScope.stateIsLoading.showLoading = false; // loading..
                $uibModalInstance.dismiss('cancel');
            };

            //delete this Site
            $scope.deleteSite = function () {
                var thisSite = $scope.aSite;
                var dSiteModal = $uibModal.open({
                    template: '<div class="modal-header"><h3 class="modal-title">Delete Site</h3></div>' +
                        '<div class="modal-body"><p>Are you sure you want to delete site {{siteNo}}? Doing so will remove all OPs, HWMs, Sensors and Files associated with it.</p></div>' +
                        '<div class="modal-footer"><button type="button" class="btn btn-danger" ng-click="deleteIt()">Delete</button><button type="button" class="btn btn-primary" ng-click="ok()">Cancel</button></div>',
                    controller: ['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {
                        $scope.siteNo = thisSite.SITE_NO;
                        $scope.ok = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                        $scope.deleteIt = function () {
                            //delete the site and all things 
                            $uibModalInstance.close(thisSite);
                        };
                    }],
                    size: 'sm'
                });
                dSiteModal.result.then(function (s) {
                    $http.defaults.headers.common.Authorization = 'Basic ' + $cookies.get('STNCreds');
                    SITE.delete({ id: s.SITE_ID }).$promise.then(function () {
                        toastr.success("Site Removed");
                        var sendBack = "Deleted";
                        $uibModalInstance.close(sendBack);
                    }, function error(errorResponse) {
                        toastr.error("Error: " + errorResponse.statusText);
                    });
                }, function () {
                    //logic for cancel
                });//end modal
            };

            $rootScope.stateIsLoading.showLoading = false;// loading..
        }]);
})();