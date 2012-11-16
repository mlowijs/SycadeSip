var SessionDescription = function (request) {
	this.request = request;
};

SessionDescription.prototype.toString = function () {
	var buffer = "v=0\r\n"; // Protocol version
	
//	var timestamp = Math.round(Date.now() / 1000);
	
	buffer += "o=" + this.request.to.extension + " 0 0 IN IP4 localhost\r\n"; // +
	//	this.request.from.host + "\r\n"; // Originator
	buffer += "s=SycadeSip Session\r\n"; // Session name
	buffer += "t=1 1"; // Time description
	
	return buffer;
};

exports.SessionDescription = SessionDescription;