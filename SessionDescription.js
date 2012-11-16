var SessionDescription = function (request) {
	this.request = request;
};

SessionDescription.prototype.toString = function () {
	var buffer = "v=0\r\n"; // Protocol version
	
//	var timestamp = Math.round(Date.now() / 1000);
	
	buffer += "o=" + this.request.from.username + " 0 0 IN IP4 " +
		this.request.from.host + "\r\n"; // Originator
	buffer += "s=SycadeSip Session\r\n"; // Session name
	buffer += "t=0 0"; // Time description
	
	return buffer;
};

exports.SessionDescription = SessionDescription;