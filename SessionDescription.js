var SessionDescription = function (request) {
	this.request = request;
};

SessionDescription.prototype.toString = function () {
	var buffer = "v=0\r\n"; // Protocol version
	
	buffer += "o=" + this.request.to.extension + " 1 1 IN IP4 localhost\r\n";
	buffer += "s=SycadeSip Session\r\n"; // Session name
	buffer += "c=IN IP4 localhost\r\n";
	buffer += "t=0 0\r\n"; // Time description
	buffer += "m=audio 8001 RTP/AVP 0 8 101\r\n";
	buffer += "a=rtpmap:0 PCMU/8000\r\n";
	buffer += "a=rtpmap:8 PCMA/8000\r\n";
	buffer += "a=rtpmap:101 telephone-event/8000\r\n";
// 	buffer += "a=fmtp:101 0-15\r\n";
	buffer += "a=sendrecv";
	
	return buffer;
};

exports.SessionDescription = SessionDescription;