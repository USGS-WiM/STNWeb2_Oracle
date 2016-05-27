(function () {
    'use strict';
    var STNControllers = angular.module('STNControllers');

    STNControllers.controller('MapController', ['$scope', '$http', '$rootScope', '$cookies', '$location', 'SITE', 'Map_Site', 'leafletMarkerEvents', 'leafletBoundsHelpers', 'leafletData', '$state', 'spinnerService',
        function ($scope, $http, $rootScope, $cookies, $location, SITE, Map_Site,leafletMarkerEvents, leafletBoundsHelpers, leafletData, $state, spinnerService) {
            if ($cookies.get('STNCreds') === undefined || $cookies.get('STNCreds') === "") {
                $scope.auth = false;
                $location.path('/login');
            } else {
                $rootScope.thisPage = "Map";
                $rootScope.activeMenu = "map";
                $scope.message = "Many of the supplemental GIS data layers found in the map are from a range of sources and are not maintained by WiM. We offer these map layers as a " +
                    "decision support supplement to the STN sites layer, but we cannot guarantee their performance and availability. Many of these externally maintained layers are " +
                    "large datasets and may load slowly depending on network latency. In some cases they may fail to load entirely when network latency is high.";
                //$scope.map = "Welcome to the new STN Map Page!!";


                $rootScope.$on('filterSitesClick', function (event, filteredSitesArray) {
                    if (filteredSitesArray.length > 0) {
                        $scope.paths = {};
                        $scope.selectedMarkerNum = 0;
                        onSiteComplete(filteredSitesArray);
                    } else {
                        //toastr.options({"positionClass": "toast-bottom-right"});
                        toastr.options.positionClass = "toast-bottom-right";
                        toastr.warning("Your filter returned no results.", "Map Filters");
                    }
                });

                var icons = {
                    stn: {
                        type: 'div',
                        iconSize: [10, 10],
                        className: 'stnSiteIcon'
                    },
                    newSite: {
                        type: 'div',
                        iconSize: [10, 10],
                        className: 'newSiteIcon',
                        iconAnchor:  [5, 5]
                    },
                    selected: {
                        type: 'div',
                        iconSize: [12, 12],
                        className: 'selectedIcon'
                    },
                    nwis: L.divIcon({
                        iconSize: [10, 10],
                        className: 'arrow-up'
                        // iconAnchor: [13.5, 17.5],
                        // popupAnchor: [0, -11]
                    }),
                    action: L.icon({
                        iconUrl: 'images/action.png',
                        popupAnchor: [10, 10]
                    }),
                    low_threshold: L.icon({
                        iconUrl: 'images/low_threshold.png',
                        popupAnchor: [10, 10]
                    }),
                    major: L.icon({
                        iconUrl: 'images/major.png',
                        popupAnchor: [10, 10]
                    }),
                    minor: L.icon({
                        iconUrl: 'images/minor.png',
                        popupAnchor: [10, 10]
                    }),
                    moderate: L.icon({
                        iconUrl: 'images/moderate.png',
                        popupAnchor: [10, 10]
                    }),
                    no_flooding: L.icon({
                        iconUrl: 'images/no_flooding.png',
                        popupAnchor: [10, 10]
                    }),
                    not_defined: L.icon({
                        iconUrl: 'images/not_defined.png',
                        popupAnchor: [10, 10]
                    }),
                    obs_not_current: L.icon({
                        iconUrl: 'images/obs_not_current.png',
                        popupAnchor: [10, 10]
                    }),
                    out_of_service: L.icon({
                        iconUrl: 'images/out_of_service.png',
                        popupAnchor: [10, 10]
                    })
                };
                //creates the markers on the map after getting JSON from STN web services call
                var onSiteComplete = function(response) {
                    console.table(response);
                    //sites array fo $http.get method
                    //var sitesArray = response.data.Sites;
                    //sitesArray for SITE factory method
                    var sitesArray = response;
                    console.table(sitesArray);
                    //$http.get method
                    //$scope.sites = response.data;
                    //SITE factory method
                    $scope.sites = sitesArray;
                    $scope.markers = [];
                    $scope.markersLatLngArray = [];

                    /////controls method///////////////////////////////////////////////////////
                    leafletData.getDirectiveControls().then(function (controls) {

                        controls.markers.create({}, $scope.markers);

                        var markers = [];
                        for (var i = 0; i < sitesArray.length; i++) {
                            var a = sitesArray[i];
                            markers.push({
                                layer:'stnSites',
                                lat: a.latitude,
                                lng: a.longitude,
                                SITE_ID: a.SITE_ID,
                                title: "STN Site",
                                icon: icons.stn
                            });
                            $scope.markersLatLngArray.push([a.latitude, a.longitude]);
                        }

                        controls.markers.create(markers ,$scope.markers);
                        $scope.markers = markers;
                        console.table($scope.markers);

                        var LLBounds =  new L.LatLngBounds($scope.markersLatLngArray);
                        $scope.bounds = leafletBoundsHelpers.createBoundsFromArray([
                            [LLBounds._northEast.lat, LLBounds._northEast.lng],
                            [LLBounds._southWest.lat, LLBounds._southWest.lng]
                        ]);


                    });
                    /////end controls method///////////////////////////////////////////////////////

                    /////////////rando keys method//////////////////////////////////////////
                    // for (var i = 0; i < sitesArray.length; i++) {
                    //     var a = sitesArray[i];
                    //     var markerID = $scope.makeID();
                    //     // $scope.markers.push({
                    //     //     layer:'stnSites',
                    //     //     lat: a.latitude,
                    //     //     lng: a.longitude,
                    //     //     SITE_ID: a.SITE_ID,
                    //     //     title: "STN Site",
                    //     //     icon: icons.stn
                    //     // });
                    //     //
                    //     $scope.markers[markerID] = {
                    //         layer:'stnSites',
                    //         lat: a.latitude,
                    //         lng: a.longitude,
                    //         SITE_ID: a.SITE_ID,
                    //         title: "STN Site",
                    //         icon: icons.stn
                    //     };
                    //     $scope.markersLatLngArray.push([a.latitude, a.longitude]);
                    // }
                    /////////////end rando keys method//////////////////////////////////////////

                };
                $scope.pathsObj = {
                    circleMarker: {
                        type: "circleMarker",
                        radius:20,
                        weight:3,
                        color: '#000099',
                        latlngs: {}
                    }
                };
                //stores the last selected marker index, so its icon and label can be reset as the first thing to happen after click
                //var selectedMarkerNum = 0;
                $scope.selectedMarkerNum = 0;
                ////this shows how to grab the Site ID in args.model.SITE_ID
                $scope.$on('leafletDirectiveMarker.click', function (event, args) {
                    
                    spinnerService.show("siteInfoSpinner");

                    $scope.markers[$scope.selectedMarkerNum].icon = icons.stn;
                    delete $scope.markers[$scope.selectedMarkerNum].label;

                    var  siteID = args.model.SITE_ID;
                    //$rootScope.stateIsLoading.showLoading = true;// loading..
                    Map_Site.setMapSiteParts(siteID);
                    //gets array number of marker element
                    $scope.selectedMarkerNum = parseInt(args.modelName);
                    //sets the icon to the selected icon class
                    $scope.markers[$scope.selectedMarkerNum].icon = icons.selected;
                    $scope.markers[$scope.selectedMarkerNum].label = {
                        message: 'Site ' + siteID,
                        options: {
                            noHide: true,
                            offset: [25, -15],
                            className: 'siteLabel'
                        }
                    };
                    if ($scope.mapCenter.zoom <= 9) {
                        $scope.mapCenter = {lat: args.model.lat, lng: args.model.lng, zoom: 10};
                    } else if ($scope.mapCenter.zoom >= 10) {
                        $scope.mapCenter = {lat: args.model.lat, lng: args.model.lng, zoom : $scope.mapCenter.zoom};
                    }
                    var addShape = function() {
                        $scope.paths = {};
                        $scope.pathsObj.circleMarker.latlngs = {lat: args.model.lat, lng: args.model.lng};
                        $scope.paths['circleMarker'] = $scope.pathsObj['circleMarker'];
                    };
                    addShape();
                });
                ///this needs to be instantiated before it can be filled programmatically below. may need to move scope.extend block to top
                // $scope.controls = {
                //     custom: []
                // };
                //commented block below is for making custom leaflet control for create site mode indicator
                //var createSiteModeControl = L.control();
                //createSiteModeControl.setPosition('bottomleft');
                //createSiteModeControl.onAdd = function () {
                //    var className = 'createSiteModeIndicator',
                //        container = L.DomUtil.create('div', className + ' leaflet-bar');
                //    return container;
                //}
                //
                //$scope.controls.custom.push(createSiteModeControl);

                ///need to watch for session event id, do new call to server when that changes
                $scope.$watch(function () { return $cookies.get('SessionEventID'); }, function (newValue) {
                    if (newValue !== undefined) {
                        $scope.sessionEvent = $cookies.get('SessionEventName') !== null && $cookies.get('SessionEventName') !== undefined ? $cookies.get('SessionEventName') : "All Events";
                        var evID = newValue;
                        //below gets sites using $http.get
                        spinnerService.show("mapSpinner");
                        $scope.selectedMarkerNum = 0;
                        $scope.paths = {};
                        //bloew gets sites using simple angular $http service
                        // $scope.sitesPromise = $http.get('https://stntest.wim.usgs.gov/STNServices2/Events/' + evID + '/Sites.json')
                        //                     .then(onSiteComplete, onError);
                        //below gets sites using the SITE 'factory'
                        $scope.sitesPromise = SITE.getAll({
                           Event: evID
                        },
                        function success(response) {
                            spinnerService.hide("mapSpinner");
                            onSiteComplete(response);
                        }, function error(errorResponse) {
                                $scope.error = "Could not fetch sites";
                        });
                    } else {

                    }
                });
                var onError = function(reason){
                    $scope.error = "Could not fetch sites";
                };
                $scope.$on("leafletDirectiveMap.click", function(event, args){
                    if ($scope.createSiteModeActive == true) {
                        //first, remove previously click-created site
                        removeUserCreatedSite();
                        var leafEvent = args.leafletEvent;
                        $scope.userCreatedSite = {
                            latitude: leafEvent.latlng.lat,
                            longitude: leafEvent.latlng.lng
                        };
                        //returns the created site object, but not that useful
                        //var createdSite = $scope.markers.filter(function (obj) {
                        //        return obj.SITE_ID === 'newSite';
                        //})[0];
                        $scope.markers.push({
                            layer: 'newSite',
                            lat: $scope.userCreatedSite.latitude,
                            lng: $scope.userCreatedSite.longitude,
                            SITE_ID: 'newSite',
                            icon: icons.newSite,
                            message: "New draggable STN site",
                            draggable: true,
                            focus: false,
                            label: {
                                message: 'New Site',
                                options: {
                                    noHide: true,
                                    className: 'newSiteLabel'
                                }
                            }
                        });
                    }
                    //use new clicked site lat/lng and create new site from that
                });
                var removeUserCreatedSite = function () {
                    //returns created site index so it can be removed to make way for its replacement
                    var createdSiteIndex = $scope.markers.map(function(obj) {
                        return obj.SITE_ID;
                    }).indexOf('newSite');
                    //splice created site from the markers array if it exists
                    if (createdSiteIndex > -1) {
                        $scope.markers.splice(createdSiteIndex, 1);
                        $scope.userCreatedSite = {};
                    }
                };

                ///update newSite lat/lng after dragend
                $scope.$on("leafletDirectiveMarker.dragend", function(event, args){
                    var dragendLocation = args.model;
                    $scope.userCreatedSite = {
                        latitude: dragendLocation.lat,
                        longitude: dragendLocation.lng
                    };
                });
                ///listens (watches) for change of the createSiteModeActive attribute - cued by click of the Create Site button
                $scope.$watch('createSiteModeActive', function(){
                    $scope.createSiteButtonText = $scope.createSiteModeActive ? 'Cancel Create Site Mode' : 'Create New Site on Map';
                    $scope.mapStyle = $scope.createSiteModeActive ? {"cursor":"crosshair"} : {"cursor":"grab"};
                    if (!$scope.createSiteModeActive) {removeUserCreatedSite();}
                    //two lines below referenced createSiteModeIndicator leaflet control. can be removed eventually.
                    //var createSiteModeIndicator = document.getElementsByClassName("createSiteModeIndicator")[0];
                    //createSiteModeIndicator.style.visibility = $scope.createSiteModeActive ? 'visible' :'hidden';
                });

                $scope.createSiteFromMap = function () {
                   if($scope.userCreatedSite.latitude !== undefined &&  $scope.userCreatedSite.longitude !== undefined ) {
                       $state.go('site.dashboard', { id: 0, latitude: $scope.userCreatedSite.latitude, longitude: $scope.userCreatedSite.longitude });
                   } else {
                       alert("Please click a location on the map to create a site this way.");
                   }
                };

                //get all STN sites
                //$http.get('https://stn.wim.usgs.gov/STNServices/Sites/points.json')
                //    .then(onSiteComplete, onError);
                //get STN sites for session event chosen by user
                //$http.get('https://stn.wim.usgs.gov/STNServices/Sites.json?Event=' + evID)
                //    .then(onSiteComplete, onError);
                ///retrieves event session ID
                //var evID = $cookies.get('SessionEventID') !== null && $cookies.get('SessionEventID') !== undefined ? $cookies.get('SessionEventID') : 0;
                //get STN sites for session event
                //$http.get('https://stn.wim.usgs.gov/STNServices/Events/' + evID + '/Sites.json')
                //    .then(onSiteComplete, onError);
                //copies scope object/////////////////////////////

                leafletData.getMap().then(function(map) {
                    var geoSearchControl = new L.Control.GeoSearch({
                        provider: new L.GeoSearch.Provider.Esri(),
                        position: 'topleft',
                        zoomLevel: 15
                    });
                    geoSearchControl.addTo(map);
                });


                angular.extend($scope, {
                    events: {
                        markers: {
                            enable: leafletMarkerEvents.getAvailableEvents()
                        }
                    },
                    mapCenter: {
                        lat: 41.278,
                        lng: -92.336,
                        zoom: 4,
                        minZoom: 4
                    },
                    controls: {},
                    markersWatchOptions: {
                        doWatch: true,
                        isDeep: true,
                        individual: {
                            doWatch: true,
                            isDeep: false
                        }
                    },
                    paths: {},
                    markers: [],
                    markersLatLngArray: [],
                    createSiteModeActive: false,
                    userCreatedSite: {},
                    // makeID: function() {
                    //     var text = "";
                    //     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                    //
                    //     for( var i=0; i < 5; i++ )
                    //         text += possible.charAt(Math.floor(Math.random() * possible.length));
                    //
                    //     return text;
                    // },
                    // legend: {
                    //     url: "http://gis.srh.noaa.gov/arcgis/rest/services/ahps_gauges/MapServer/legend/?f=json",
                    //     legendClass: "info legend-esri",
                    //     position: "bottomleft"
                    // },
                    // legendURL1: "http://services.arcgisonline.com/arcgis/rest/services/Demographics/USA_1990-2000_Population_Change/MapServer/legend?f=json",
                    // legendURL2: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/legend?f=json",
                    // switchLegend: function() {
                    //     $scope.layers.overlays.usa_social.visible = !$scope.layers.overlays.usa_social.visible;
                    //     $scope.legend.url =
                    //         $scope.legend.url == $scope.legendURL1? $scope.legendURL2:$scope.legendURL1;
                    // },
                    //////////!!!need to add legend="legend" back to map directive if using this!!!!!!!!
                    layers: {
                        baselayers: {
                            gray: {
                                name: "Gray",
                                type: "agsBase",
                                layer: "Gray",
                                visible: false
                            },
                            streets: {
                                name: "Streets",
                                type: "agsBase",
                                layer: "Streets",
                                visible: false
                            },
                            topo: {
                                name: "World Topographic",
                                type: "agsBase",
                                layer: "Topographic",
                                visible: false
                            },
                            national: {
                                name: "National Geographic",
                                type: "agsBase",
                                layer: "NationalGeographic",
                                visible: false
                            },
                            oceans: {
                                name: "Oceans",
                                type: "agsBase",
                                layer: "Oceans",
                                visible: false
                            },
                            darkgray: {
                                name: "DarkGray",
                                type: "agsBase",
                                layer: "DarkGray",
                                visible: false
                            },
                            imagery: {
                                name: "Imagery",
                                type: "agsBase",
                                layer: "Imagery",
                                visible: false
                            },
                            shadedrelief: {
                                name: "Shaded Relief",
                                type: "agsBase",
                                layer: "ShadedRelief",
                                visible: false
                            },
                            terrain: {
                                name: "Terrain",
                                type: "agsBase",
                                layer: "Terrain",
                                visible: false
                            }
                        },
                        overlays : {
                            stnSites: {
                                type: 'group',
                                name:'STN Sites',
                                visible: true
                            },
                            newSite : {
                                type: 'group',
                                name: 'newSite',
                                visible:true,
                                layerParams: {
                                    showOnSelector: false
                                }
                            },
                            nwis : {
                                name: "USGS real-time streamgages",
                                type: "agsFeature",
                                url : "https://stnmapservices.wim.usgs.gov:6443/arcgis/rest/services/STN/STN_nwis_rt/MapServer/0",
                                visible: false,
                                layerOptions : {
                                    pointToLayer: function (geojson, latlng) {
                                        return L.marker(latlng, {
                                            icon: icons.nwis
                                        });
                                    },
                                    onEachFeature: function(feature, layer) {
                                        //layer.bindPopup("USGS ID: " + feature.properties.Name);
                                        layer.bindPopup(feature.properties.PopupInfo + '<br><img style="width: 350px" src="http://waterdata.usgs.gov/nwisweb/graph?agency_cd=USGS&site_no=' + feature.properties.Name + '&parm_cd=00065&period=7">');
                                    }
                                }
                            },
                            ahps : {
                                name: "AHPS Gages",
                                type: "agsFeature",
                                url : "http://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/ahps_riv_gauges/MapServer/0",
                                visible: false,
                                layerOptions : {
                                    //layers: [0],
                                    opacity: 1,
                                    pointToLayer: function (geojson, latlng) {
                                        return L.marker(latlng, {
                                            icon: icons[geojson.properties.status]
                                        });
                                    },
                                    onEachFeature: function(feature, layer) {
                                        //layer.bindPopup("USGS ID: " + feature.properties.Name);
                                        var graphURL = "http://water.weather.gov/resources/hydrographs/" + feature.properties.gaugelid.toLowerCase() + "_hg.png";
                                        //layer.bindPopup("<b>Gage ID: </b>" + feature.properties.gaugelid + "</br><b>Location: </b>" + feature.properties.location + "</br><b>Waterbody: </b>" + feature.properties.waterbody + "</br><a target='_blank' href='"+ feature.properties.url + "'><img title='Click for details page' width=300 src='" + graphURL +"'/></a>");
                                        layer.bindPopup("<b>Gage ID: </b>" + feature.properties.gaugelid + "</br><a target='_blank' href='"+ feature.properties.url + "'><img title='Click for details page' width=300 src='" + graphURL +"'/></a>");

                                    }
                                }
                            },
                            radar : {
                                name: "Weather Radar",
                                type: "agsDynamic",
                                url : "http://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/radar_base_reflectivity/MapServer",
                                visible: false,
                                layerOptions : {
                                    layers: [0],
                                    opacity: 1
                                }
                            },
                            watchWarn : {
                                name: "NWS Watches & Warnings",
                                type: "agsDynamic",
                                url : "http://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/watch_warn_adv/MapServer",
                                visible: false,
                                layerOptions : {
                                    layers: [1],
                                    opacity: 1
                                }
                            },
                            // floodThresholds : {
                            //     name: "NWS WFO Coastal Flood Thresholds",
                            //     type: "agsDynamic",
                            //     url : "https://www.csc.noaa.gov/arcgis/rest/services/dc_slr/Flood_Frequency/MapServer",
                            //     visible: false,
                            //     layerOptions : {
                            //         layers: [1],
                            //         opacity: 1
                            //     }
                            // },
                            lmwa : {
                                name: "Limit Moderate Wave Action",
                                type: "agsDynamic",
                                url : "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer",
                                visible: false,
                                layerOptions : {
                                    layers: [19],
                                    opacity: 1
                                }
                            },
                            floodBounds : {
                                name: "Flood Hazard Boundaries",
                                type: "agsDynamic",
                                url : "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer",
                                visible: false,
                                layerOptions : {
                                    layers: [27],
                                    opacity: 1
                                }
                            },
                            floodZones : {
                                name: "Flood Hazard Zones",
                                type: "agsDynamic",
                                url : "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer",
                                visible: false,
                                layerOptions : {
                                    layers: [28],
                                    opacity: 1
                                }
                            }
                        }
                        //legend: {
                        //    url: "http://gis.srh.noaa.gov/arcgis/rest/services/ahps_gauges/MapServer/legend?f=json",
                        //    legendClass: "info legend-esri",
                        //    position: "bottomleft"
                        //}
                    }
                });//end angular $scope.extend statement
                ///////////////////////////////////////////////////////////////////////////////////////
            } //end -if credentials pass- statement
        }]);//end controller function
})();