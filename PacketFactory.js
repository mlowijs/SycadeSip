var Utils = require("./Utils");
var Request = require("./Request").Request;
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
	
	// Parse packet and return
	return Request.parse(request, data, lines);
};

exports.createResponse = function (req, ep, status) {	
	return new Response(req, ep, status);
};