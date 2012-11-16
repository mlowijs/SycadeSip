var Utils = require("./Utils");
var Request = require("./Request").Request;
var InviteRequest = require("./InviteRequest").InviteRequest;
var Response = require("./Response").Response;

exports.parseRequest = function (data, callback) {
	var data = data.toString().trim();
	var lines = data.split("\r\n");
	
	// Set request
	var reqLine = lines[0].split(" ");
	
	var request = {
		method: reqLine[0],
		url: reqLine[1],
		protocol: reqLine[2]
	};
	
	console.log(data);
	console.log(data.length);
	
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
	// Create response packet with response line
	var resp = new Response(req.request.protocol + " " + status, ep);
	
	resp.headers["Via"] = req.headers["Via"] +
		";received=" + ep.address + ";rport=" + ep.port;
		
	resp.headers["From"] = req.headers["From"];
	resp.headers["Call-ID"] = req.headers["Call-ID"];
	resp.headers["CSeq"] = req.headers["CSeq"];
	resp.headers["Server"] = "SycadeSip 0.0.1";
	
	return resp;
};