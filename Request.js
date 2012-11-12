var Request = function (request, data, lines) {
	this.request = request;
	
	// Set headers
	this.headers = {};
	
	for (var i = 1; i < lines.length; i++) {
		var kvp = lines[i].split(":", 2);
		
		this.headers[kvp[0]] = kvp[1].trim();
	}
	
	// Set content if it exists
	if (this.headers["Content-Length"] > 0)
		this.content = data.substr(-this.headers["Content-Length"] + 2);
};

exports.Request = Request;