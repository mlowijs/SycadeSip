var Response = function (response) {
	this.response = response;
	
	this.headers = {};
	this.content = "";
};

Response.prototype.toString = function () {
	var buffer = this.response + "\r\n";
	
	for (var header in this.headers) {
		buffer += header + ": " + this.headers[header] + "\r\n";
	}
	
	buffer += "Content-Length: " + this.content.length + "\r\n\r\n";
// 	if (this.content)
// 		buffer += this.content + "\r\n";
	
	return buffer;
};

Response.prototype.getBuffer = function () {
	return new Buffer(this.toString());
}

exports.Response = Response;