var PacketFactory = require("./PacketFactory");
var SessionDescription = require("./SessionDescription").SessionDescription;
var Utils = require("./Utils");

var Context = function (server, request, endPoint) {
	this.server = server;
	this.request = request;
	this.endPoint = endPoint;
	
	this.accepted = false;
	this.ended = false;
};

Context.prototype.accept = function () {
	if (this.ended)
		return false;

	// Create a session description	
	this.sessionDescription = new SessionDescription(this.request);
	
	var resp = PacketFactory.createResponse(this.request, this.endPoint, "200 OK");
	resp.headers["To"] = this.request.headers["To"] + ";tag=" + Utils.randomHash();
	resp.headers["Content-Type"] = "application/sdp";
	if (this.request.headers["Contact"]) // TODO: fix this
		resp.headers["Contact"] = this.request.headers["Contact"];

	// Add session description as content	
	resp.content = this.sessionDescription.toString();
	
	this.server.send(resp);
	this.accepted = true;
};

Context.prototype.call = function (user) {
	if (this.ended || !this.accepted)
		return false;
};

Context.prototype.end = function () {		
	this.ended = true;
};

exports.Context = Context;