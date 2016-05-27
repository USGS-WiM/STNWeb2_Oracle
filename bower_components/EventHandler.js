var WiM;
(function (WiM) {
    var Event;
    (function (Event) {
        var EventHandler = (function () {
            function EventHandler(handler) {
                this._handler = handler;
            }
            EventHandler.prototype.handle = function (sender, e) {
                this._handler(sender, e);
            };
            return EventHandler;
        })();
        Event.EventHandler = EventHandler;
    })(Event = WiM.Event || (WiM.Event = {}));
})(WiM || (WiM = {}));
//# sourceMappingURL=EventHandler.js.map