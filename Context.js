var Context = function (server, request, endPoint) {
	this.server = server;
	this.request = request;
	this.endPoint = endPoint;
};

Context.prototype.accept = function () {
};

Context.prototype.call = function (user) {
};

Context.prototype.end = function () {
};

exports.Context = Context;