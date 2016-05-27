var WiM;
(function (WiM) {
    var Event;
    (function (Event_1) {
        'use strict';
        var Event = (function () {
            function Event(delegate) {
                this._onChanged = delegate;
            }
            Object.defineProperty(Event.prototype, "onChanged", {
                get: function () {
                    return this._onChanged;
                },
                enumerable: true,
                configurable: true
            });
            return Event;
        })();
        var EventManager = (function () {
            function EventManager() {
                this._eventList = {};
            }
            EventManager.prototype.AddEvent = function (EventName) {
                if (!this._eventList.hasOwnProperty(EventName))
                    this._eventList[EventName] = new Event(new Event_1.Delegate());
            };
            EventManager.prototype.SubscribeToEvent = function (EventName, handler) {
                if (!this._eventList.hasOwnProperty(EventName)) {
                    this.AddEvent(EventName);
                }
                this._eventList[EventName].onChanged.subscribe(handler);
            };
            EventManager.prototype.RaiseEvent = function (EventName, sender, args) {
                if (sender === void 0) { sender = null; }
                if (args === void 0) { args = Event_1.EventArgs.Empty; }
                if (!this._eventList.hasOwnProperty(EventName))
                    return;
                this._eventList[EventName].onChanged.raise(sender, args);
            };
            EventManager.prototype.UnSubscribeToEvent = function (EventName, handler) {
                if (!this._eventList.hasOwnProperty(EventName))
                    return;
                this._eventList[EventName].onChanged.unsubscribe(handler);
            };
            return EventManager;
        })();
        factory.$inject = [];
        function factory() {
            return new EventManager();
        }
        angular.module('WiM.Event', [])
            .factory('WiM.Event.EventManager', factory);
    })(Event = WiM.Event || (WiM.Event = {}));
})(WiM || (WiM = {}));
//# sourceMappingURL=EventManager.js.map