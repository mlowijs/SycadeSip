var Packet = function () {
	this.headers = {};
};

Packet.parse = function (data, lines) {
	var packet = new Packet();
	
	// Parse all headers
	for (var i = 1; i < lines.length; i++) {
		var kvp = lines[i].split(":", 2);
		
		packet.headers[kvp[0]] = kvp[1].trim();
	}
	
	// Set content if it exists
	if (packet.headers["Content-Length"] > 0)
		packet.content = data.substr(-packet.headers["Content-Length"] + 2);
	
	// Authorization
	if (packet.headers["Authorization"]) {
		packet.authorization = {};
		var re = /(\w+)="?([^"]+)/g,
			matches;
		
		while ((matches = re.exec(packet.headers["Authorization"])) !== null)
			packet.authorization[matches[1]] = matches[2];
	}
		
	// Interesting properties
	packet.from = Packet.parseAddress(packet.headers["From"]);
	packet.to = Packet.parseAddress(packet.headers["To"]);
	
	return packet;
};

Packet.parseAddress = function (input) {
	var address = /(?:"(.+)"\s?)?<sip:(.+)@(.+?)(?::(\d+))?(?:;(.+))?>/g.exec(input);
	
	return {
		displayname: address[1],
		extension: address[2],
		username: address[2],
		host: address[3],
		port: address[4],
		params: address[5].split(";")
	};
};

exports.Packet = Packet;