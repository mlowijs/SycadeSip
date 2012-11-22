var Utils = require("./Utils");

var Request = function () {
	this.headers = {};
};

Request.parse = function (request, data, lines) {
	var req = new Request();
	
	for (var i = 1; i < lines.length; i++) {
		var kvp = lines[i].split(":", 2);
		
		req.headers[kvp[0]] = kvp[1].trim();
	}
	
	// Set content if it exists
	if (req.headers["Content-Length"] > 0)
		req.content = data.substr(-req.headers["Content-Length"] + 2);
	
	// Interesting properties
	req.from = Utils.parseAddress(this.headers["From"]);
	req.to = Utils.parseAddress(this.headers["To"]);
	
	return req;
};

exports.Request = Request;