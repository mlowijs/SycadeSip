var Utils = require("./Utils");
var RegisterRequest = require("./RegisterRequest").RegisterRequest;
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
	
	// Create packet based on request method
	switch (request.method) {
		case "REGISTER":
			callback(new RegisterRequest(request, data, lines));
	}
};

exports.createResponse = function (req, ep, status) {	
	// Create response packet with response line
	var resp = new Response(req.request.protocol + " " + status);
	
	resp.headers["Via"] = req.headers["Via"] +
		";received=" + ep.address + ";rport=" + ep.port;
		
	resp.headers["From"] = req.headers["From"];
	resp.headers["To"] = req.headers["To"] + ";tag=" + Utils.randomHash();
	resp.headers["Call-ID"] = req.headers["Call-ID"];
	resp.headers["CSeq"] = req.headers["CSeq"];
	resp.headers["Server"] = "SycadeSip 0.0.1";
	
	return resp;
};