var Utils = require("./Utils");
var Request = require("./Request").Request;
var InviteRequest = require("./InviteRequest").InviteRequest;
var ByeRequest = require("./ByeRequest").ByeRequest;
var Response = require("./Response").Response;

exports.parseRequest = function (data, callback) {
	var lines = data.split("\r\n");
	
	// Set request
	var reqLine = lines[0].split(" ");
	
	var request = {
		method: reqLine[0],
		url: reqLine[1],
		protocol: reqLine[2]
	};
	
	// Create packet based on request method
	switch (request.method) {
		case "INVITE":
			callback(new InviteRequest(request, data, lines));
			break;
		default:
			callback(new Request(request, data, lines));
	}
};

exports.createResponse = function (req, ep, status) {	
	return new Response(req, ep, status);
};

exports.createByeRequest = function () {
	var req = 
};