var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var WiM;
(function (WiM) {
    var Directives;
    (function (Directives) {
        'use string';
        Directives.onLayerAdded = "onLayerAdded";
        Directives.onLayerChanged = "onLayerChanged";
        Directives.onLayerRemoved = "onLayerRemoved";
        var LegendLayerAddedEventArgs = (function (_super) {
            __extends(LegendLayerAddedEventArgs, _super);
            function LegendLayerAddedEventArgs(layername, ltype, style) {
                _super.call(this);
                this.LayerName = layername;
                this.layerType = ltype;
                this.style = style;
            }
            return LegendLayerAddedEventArgs;
        })(WiM.Event.EventArgs);
        Directives.LegendLayerAddedEventArgs = LegendLayerAddedEventArgs;
        var LegendLayerChangedEventArgs = (function (_super) {
            __extends(LegendLayerChangedEventArgs, _super);
            function LegendLayerChangedEventArgs(layername, propertyname, value) {
                _super.call(this);
                this.LayerName = layername;
                this.PropertyName = propertyname;
                this.Value = value;
            }
            return LegendLayerChangedEventArgs;
        })(WiM.Event.EventArgs);
        Directives.LegendLayerChangedEventArgs = LegendLayerChangedEventArgs;
        var LegendLayerRemovedEventArgs = (function (_super) {
            __extends(LegendLayerRemovedEventArgs, _super);
            function LegendLayerRemovedEventArgs(layername, ltype) {
                _super.call(this);
                this.LayerName = layername;
                this.layerType = ltype;
            }
            return LegendLayerRemovedEventArgs;
        })(WiM.Event.EventArgs);
        Directives.LegendLayerRemovedEventArgs = LegendLayerRemovedEventArgs;
        var wimLegendController = (function (_super) {
            __extends(wimLegendController, _super);
            function wimLegendController($scope, $http, leafletData, eventManager) {
                var _this = this;
                _super.call(this, $http, '');
                $scope.vm = this;
                this.eventManager = eventManager;
                this.eventManager.AddEvent(Directives.onLayerAdded);
                this.eventManager.AddEvent(Directives.onLayerChanged);
                this.eventManager.AddEvent(Directives.onLayerRemoved);
                this.eventManager.SubscribeToEvent(Directives.onLayerAdded, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onLayerAdded(sender, e);
                }));
                this.eventManager.SubscribeToEvent(Directives.onLayerRemoved, new WiM.Event.EventHandler(function (sender, e) {
                    _this.onLayerRemoved(sender, e);
                }));
                this.leafletData = leafletData;
                this.init();
            }
            wimLegendController.prototype.initOverlays = function (mlyr) {
                if (mlyr.type == "agsDynamic") {
                    var url = mlyr.url + "/legend?f=pjson";
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    this.Execute(request).then(function (response) {
                        if (response.data.layers.length > 0) {
                            mlyr.isOpen = true;
                            mlyr.layerArray = [];
                            if (mlyr.layerOptions.layers) {
                                var visibleLayers = mlyr.layerOptions.layers;
                                for (var i = 0; i < visibleLayers.length; i++) {
                                    for (var j = 0; j < response.data.layers.length; j++) {
                                        if (visibleLayers[i] == response.data.layers[j].layerId) {
                                            mlyr.layerArray.push(response.data.layers[j]);
                                        }
                                    }
                                }
                            }
                            else {
                                mlyr.layerArray = response.data.layers;
                            }
                        }
                    }, function (error) {
                    });
                }
                if (mlyr.type == "agsFeature") {
                    var url = mlyr.url.slice(0, -2) + "/legend?f=pjson";
                    var layerId = mlyr.url.substr(mlyr.url.length - 1);
                    var request = new WiM.Services.Helpers.RequestInfo(url, true);
                    this.Execute(request).then(function (response) {
                        if (response.data.layers.length > 0) {
                            mlyr.isOpen = true;
                            mlyr.layerArray = [];
                            for (var k = 0; k < response.data.layers.length; k++) {
                                if (layerId == response.data.layers[k].layerId) {
                                    mlyr.layerArray.push(response.data.layers[k]);
                                }
                            }
                        }
                    }, function (error) {
                    });
                }
            };
            wimLegendController.prototype.changeBaseLayer = function (key, evt) {
                var _this = this;
                this.baselayers.selectedlayerName = key.toString();
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        if (map.hasLayer(maplayers.baselayers[key])) {
                            return;
                        }
                        for (var mlayr in maplayers.baselayers) {
                            if (map.hasLayer(maplayers.baselayers[mlayr])) {
                                map.removeLayer(maplayers.baselayers[mlayr]);
                            }
                        }
                        map.addLayer(maplayers.baselayers[key]);
                    });
                });
                evt.preventDefault();
            };
            wimLegendController.prototype.toggleLayer = function (layerName, visibility) {
                var layer = this.applicationLayer.layergroup[layerName];
                layer.visible = (layer.visible) ? false : true;
                this.eventManager.RaiseEvent(Directives.onLayerChanged, this, new LegendLayerChangedEventArgs(layerName, "visible", layer.visible));
            };
            wimLegendController.prototype.init = function () {
                var _this = this;
                this.overlays = {};
                this.baselayers = {};
                this.baselayers.isOpen = true;
                this.applicationLayer = {
                    selectedlayerName: "Application Layers",
                    isAvailable: false,
                    layergroup: {},
                    isOpen: false
                };
                this.leafletData.getMap().then(function (map) {
                    _this.leafletData.getLayers().then(function (maplayers) {
                        for (var key in maplayers.baselayers) {
                            if (map.hasLayer(maplayers.baselayers[key])) {
                                _this.baselayers.selectedlayerName = key.toString();
                                break;
                            }
                        }
                    });
                });
            };
            wimLegendController.prototype.onLayerAdded = function (sender, e) {
                if (e.layerType != 'geojson')
                    return;
                if (this.applicationLayer.layergroup.hasOwnProperty(e.LayerName))
                    return;
                this.applicationLayer.isAvailable = true;
                this.applicationLayer.layergroup[e.LayerName] = {
                    visible: true,
                    style: e.style
                };
            };
            wimLegendController.prototype.onLayerRemoved = function (sender, e) {
                if (e.layerType != 'geojson')
                    return;
                if (this.applicationLayer.layergroup.hasOwnProperty(e.LayerName))
                    delete this.applicationLayer[e.LayerName];
            };
            wimLegendController.$inject = ['$scope', '$http', 'leafletData', 'WiM.Event.EventManager'];
            return wimLegendController;
        })(WiM.Services.HTTPServiceBase);
        var wimLegend = (function () {
            function wimLegend() {
                this.scope = {
                    icons: '=?',
                    autoHideOpacity: '=?',
                    showGroups: '=?',
                    title: '@',
                    baseTitle: '@',
                    overlaysTitle: '@',
                };
                this.restrict = 'E';
                this.require = '^leaflet';
                this.transclude = false;
                this.controller = wimLegendController;
                this.template = '<div ng-class="vm.layerControlExpanded ? \'angular-leaflet-control-layers-expanded\' : \'angular-leaflet-control-layers-collapsed\'" ng-click="vm.layerControlExpanded = true; $event.stopPropagation(); $event.preventDefault()" ng-init="vm.layerControlExpanded == false">' +
                    '    <div ng-show="vm.layerControlExpanded">' +
                    '        <button class="close-legend" ng-click="vm.layerControlExpanded = false; $event.stopPropagation();">Close Legend</button>' +
                    '        <div class="list-group">' +
                    '            <!-- baselayers -->' +
                    '            <div ng-class="!vm.baselayers.isOpen  ? \' list-group-item-active wimLegend-list-group-item-active\': \'list-group-item wimLegend-list-group-item\'" ng-click="vm.baselayers.isOpen=(vm.baselayers.isOpen) ? false : true;">' +
                    '                <label>Base Maps</label>' +
                    '                <i ng-class="!vm.baselayers.isOpen ? \'fa fa-chevron-up pull-right\': \'fa fa-chevron-down pull-right\'"></i>' +
                    '            </div> ' +
                    '            <div ng-hide="vm.baselayers.isOpen" class="list-group-body wimLegend-list-group-body">' +
                    '                <div class="sitebar-item" ng-repeat="(key, layer) in vm.baselayers.layergroup">' +
                    '                    <input type="radio" id="baselayerRadio{{$id}}" ng-checked="$parent.vm.baselayers.selectedlayerName === key.toString()" ng-value="key.toString()" /><label class="hasRadio" ng-class="{ \'radioSelected\': $parent.vm.baselayers.selectedlayerName === key.toString() }" for="baselayerRadio{{$id}}" ng-click="vm.changeBaseLayer(key, $event)">{{layer.name}}</label>' +
                    '                </div>' +
                    '            </div>  ' +
                    '            <!-- Application Layers -->' +
                    '            <div ng-if="vm.applicationLayer.isAvailable">' +
                    '                <div ng-class="vm.applicationLayer.isOpen  ? \'list-group-item wimLegend-list-group-item-active\': \'list-group-item wimLegend-list-group-item\'">' +
                    '                    <label> {{vm.applicationLayer.selectedlayerName}}</label>' +
                    '                    <i ng-class="vm.applicationLayer.isOpen ? \'fa fa-chevron-up pull-right\': \'fa fa-chevron-down pull-right\'" ng-click="vm.applicationLayer.isOpen=(vm.applicationLayer.isOpen) ? false : true;"></i>' +
                    '                </div>' +
                    '                <div ng-show="vm.applicationLayer.isOpen">' +
                    '                    <div ng-repeat="(key, lyr) in vm.applicationLayer.layergroup">' +
                    '                        <input type="checkbox" id="applicationLayer{{$id}}" ng-checked="lyr.visible" ng-value="lyr.visible" />                        ' +
                    '                        <label for="applicationLayer{{$id}}" ng-click="$parent.vm.toggleLayer(key.toString(), lyr.visible)"><img ng-src={{lyr.style.imagesrc}} />{{lyr.style.displayName}}</label>' +
                    '                    </div>' +
                    '                </div>' +
                    '            </div>' +
                    '            <!-- overlays --> ' +
                    '            <div ng-repeat="layer in vm.overlays.layergroup" ng-init="vm.initOverlays(layer)">' +
                    '                <div ng-if="!layer.layerParams.showOnSelector && layer.layerParams.showOnSelector !== false" ng-class="!layer.isOpen  ? \'list-group-item-active wimLegend-list-group-item-active\': \'list-group-item wimLegend-list-group-item\'">' +
                    '                    <input type="checkbox" id="checkbox{{$id}}" ng-checked="layer.visible" />' +
                    '                    <label class="hasCheckbox" ng-class="{ \'checkboxEnabled\': layer.visible }" for="checkbox{{$id}}" ng-if="!layer.layerParams.showOnSelector && layer.layerParams.showOnSelector !== false" ng-click="layer.visible = (layer.visible) ? false : true;">' +
                    '                        {{layer.name}}' +
                    '                    </label>' +
                    '                    <i ng-class="!layer.isOpen ? \'fa fa-chevron-up pull-right\': \'fa fa-chevron-down pull-right\'" ng-click="layer.isOpen=(layer.isOpen) ? false : true;"></i>' +
                    '                </div>' +
                    '                <div ng-hide="layer.isOpen">' +
                    '                    <div class="legendGroup" ng-if="layer.type == \'agsDynamic\' || layer.type == \'agsFeature\'">' +
                    '                        <div ng-repeat="lyr in layer.layerArray ">' +
                    '                            <label>{{lyr.layerName}}</label>' +
                    '                            <div ng-repeat="leg in lyr.legend ">' +
                    '                                <img class="legendSwatch" alt="Embedded Image"' +
                    '                                     src="data:{{leg.contentType}};base64,{{leg.imageData}}" />' +
                    '                                <i>{{leg.label}}</i>' +
                    '                            </div>' +
                    '                        </div>' +
                    '                    </div>' +
                    '                </div>' +
                    '            </div>' +
                    '            ' +
                    '        </div>' +
                    '    </div>' +
                    '</div>';
                this.replace = true;
            }
            wimLegend.instance = function () {
                return new wimLegend;
            };
            wimLegend.prototype.link = function (scope, element, attributes, controller) {
                var leafletScope = controller.getLeafletScope();
                var layers = leafletScope.layers;
                scope.vm.overlays.layergroup = layers.overlays;
                scope.vm.baselayers.layergroup = layers.baselayers;
                element.bind('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                });
                element.bind('mouseover', function (e) {
                    controller.getMap().then(function (map) {
                        map.dragging.disable();
                        map.doubleClickZoom.disable;
                        map.scrollWheelZoom.disable();
                    });
                });
                element.bind('mouseout', function (e) {
                    controller.getMap().then(function (map) {
                        map.dragging.enable();
                        map.doubleClickZoom.enable();
                        map.scrollWheelZoom.enable();
                    });
                });
            };
            return wimLegend;
        })();
        angular.module('wim_angular')
            .directive('wimLegend', wimLegend.instance);
    })(Directives = WiM.Directives || (WiM.Directives = {}));
})(WiM || (WiM = {}));
//# sourceMappingURL=wimLegend.js.map
