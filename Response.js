var Response = function (response, endPoint) {
	this.response = response;
	this.endPoint = endPoint;
	
	this.headers = {};
	this.content = "";
};

Response.prototype.toString = function () {
	var buffer = this.response + "\r\n";
	
	for (var header in this.headers) {
		buffer += header + ": " + this.headers[header] + "\r\n";
	}
	
	buffer += "Content-Length: " + this.content.length + "\r\n\r\n";
	if (this.content)
		buffer += this.content + "\r\n";
	
	return buffer;
};

Response.prototype.getBuffer = function (callback) {
	callback(new Buffer(this.toString()));
}

exports.Response = Response;