require("./Extensions");

var dgram = require("dgram");
var PacketFactory = require("./PacketFactory");
var Utils = require("./Utils");
var Peer = require("./Peer").Peer;
var Users = require("./Users.json");

exports.start = function (port) {
	this.peers = [];
	
	var self = this;
	this.socket = dgram.createSocket("udp4", function (data, ep) {
		if (!self.findPeer(ep)) {
			// Unauthorized
		}
		
		PacketFactory.parseRequest(data, function (packet) {
			switch (packet.request.method) {
				case "REGISTER":
					self.registerReceived(packet, ep);
					break;
			}
		});
	});
	
	this.socket.bind(port);
};

exports.registerReceived = function (req, ep) {
	console.log(req);
	var resp = undefined;
	
	if (!req.headers["Authorization"]) { // Client is not authenticated
		var peer = new Peer(ep);
		this.peers.push(peer);
		
		resp = PacketFactory.createResponse(req, ep, "401 Unauthorized");
		resp.headers["WWW-Authenticate"] = 'Digest realm="voip", nonce="1234abcd"';
	} else { // Client is trying to authenticate
		var password = Users[req.authorization.username];
		var digest = this.createDigest(req, password);
		
		if (digest == req.authorization.response) { // Authenticated
			resp = PacketFactory.createResponse(req, ep, "200 OK");
		} else { // Authentication failed
			resp = PacketFactory.createResponse(req, ep, "4xx XXX");
		}
	}
	
	// Send response
	this.send(resp, ep);
};

exports.createDigest = function (req, password) {
	// Create HA1 and HA2
	var ha1 = req.authorization.username + ":" + req.authorization.realm + ":" +
		password;
	ha1 = Utils.hash(ha1);

	var ha2 = req.request.method + ":" + req.authorization.uri;
	ha2 = Utils.hash(ha2);
	
	// Return digest
	return Utils.hash(ha1 + ":" + req.authorization.nonce + ":" + ha2);
};

exports.findPeer = function (ep) {
	for (var i = 0; i < this.peers.length; i++) {
		var endPoint = this.peers[i].endPoint;
		
		if (endPoint.address == ep.address && endPoint.port == ep.port)
			return this.peers[i];
	}
	
	return false;
};

exports.send = function (resp, ep) {
	var buffer = resp.getBuffer();
	
	this.socket.send(buffer, 0, buffer.length, ep.port, ep.address);
};