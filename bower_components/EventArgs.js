var WiM;
(function (WiM) {
    var Event;
    (function (Event) {
        var EventArgs = (function () {
            function EventArgs() {
            }
            Object.defineProperty(EventArgs, "Empty", {
                get: function () {
                    return new EventArgs();
                },
                enumerable: true,
                configurable: true
            });
            return EventArgs;
        })();
        Event.EventArgs = EventArgs;
    })(Event = WiM.Event || (WiM.Event = {}));
})(WiM || (WiM = {}));
//# sourceMappingURL=EventArgs.js.map