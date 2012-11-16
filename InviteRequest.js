var Request = require("./Request").Request;
var Utils = require("./Utils");

var InviteRequest = function (request, data, lines) {
	Request.call(this, request, data, lines);
	
	this.to = Utils.parseAddress(this.headers["To"]);
};

exports.InviteRequest = InviteRequest;