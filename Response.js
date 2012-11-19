var Response = function (request, endPoint, status) {
	this.endPoint = endPoint;
	this.headers = {};
	this.content = "";

	// Set status line
	this.response = request.request.protocol + " " + status;
	
	// Set headers
	this.headers["Via"] = request.headers["Via"] +
		";received=" + endPoint.address + ";rport=" + endPoint.port;
		
	this.headers["From"] = request.headers["From"];
	this.headers["Call-ID"] = request.headers["Call-ID"];
	this.headers["CSeq"] = request.headers["CSeq"];
	this.headers["Server"] = "SycadeSip 0.0.1";
};

Response.prototype.toString = function () {
	var buffer = this.response + "\r\n";
	
	for (var header in this.headers) {
		buffer += header + ": " + this.headers[header] + "\r\n";
	}
	
	buffer += "Content-Length: " + this.content.length + 2 + "\r\n\r\n";
	if (this.content)
		buffer += this.content + "\r\n";
	
	return buffer;
};

Response.prototype.getBuffer = function (callback) {
	callback(new Buffer(this.toString()));
}

exports.Response = Response;