var WiM;
(function (WiM) {
    var Services;
    (function (Services) {
        'use strict';
        var HTTPServiceBase = (function () {
            function HTTPServiceBase(http, baseURL) {
                this.baseURL = baseURL;
                this.$http = http;
            }
            HTTPServiceBase.prototype.Execute = function (request) {
                request.url = request.includesBaseURL ? request.url : this.baseURL + request.url;
                return this.$http(request);
            };
            return HTTPServiceBase;
        })();
        Services.HTTPServiceBase = HTTPServiceBase;
    })(Services = WiM.Services || (WiM.Services = {}));
})(WiM || (WiM = {}));
//# sourceMappingURL=HTTPServiceBase.js.map