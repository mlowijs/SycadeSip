var Utils = require("./Utils");
var Packet = require("./Packet").Packet;
var Response = require("./Response").Response;

exports.parseIncoming = function (data, callback) {
	var lines = data.split("\r\n");
	
	// Request/status line
	var line = lines[0].split(" "),
		packet = Packet.parse(data, lines);
			
	// Is this a response?
	if (line[0] == "SIP/2.0") {
		packet.response = {
			protocol: line[0],
			statusCode: line[1]
		};
	} else {	
		packet.request = {
			method: line[0],
			url: line[1],
			protocol: line[2]
		};
	}
	
	callback(packet);
};

exports.createResponse = function (req, ep, status) {	
	return new Response(req, ep, status);
};