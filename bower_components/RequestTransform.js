var WiM;
(function (WiM) {
    var Services;
    (function (Services) {
        var Helpers;
        (function (Helpers) {
            function paramsTransform(data) {
                var str = [];
                for (var p in data)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
                return str.join("&");
            }
            Helpers.paramsTransform = paramsTransform;
        })(Helpers = Services.Helpers || (Services.Helpers = {}));
    })(Services = WiM.Services || (WiM.Services = {}));
})(WiM || (WiM = {}));
//# sourceMappingURL=RequestTransform.js.map