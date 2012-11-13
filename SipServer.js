require("./Extensions");

var dgram = require("dgram");
var PacketFactory = require("./PacketFactory");
var Utils = require("./Utils");
var Peer = require("./Peer").Peer;
var Users = require("./config/Users.json");

exports.start = function (port) {
	this.peers = [];
	
	var self = this;
	this.socket = dgram.createSocket("udp4", function (data, ep) {		
		PacketFactory.parseRequest(data, function (packet) {
			switch (packet.request.method) {
				case "REGISTER":
					self.registerReceived(packet, ep);
					break;
				case "PUBLISH":
					self.publishReceived(packet, ep);
					break;
				case "SUBSCRIBE":
					self.subscribeReceived(packet, ep);
					break;
			}
		});
	});
	
	this.socket.bind(port);
};

exports.subscribeReceived = function (req, ep) {	
	var resp = PacketFactory.createResponse(req, ep, "200 OK");
	
	this.send(resp, ep);
};

exports.publishReceived = function (req, ep) {	
	var resp = PacketFactory.createResponse(req, ep, "489 Bad Event");
	
	this.send(resp, ep);
};

exports.registerReceived = function (req, ep) {
	var resp = undefined;
	
	// Authorizing
	if (req.headers["Authorization"]) {
		var password = Users[req.authorization.username];
		
		// Password correct?
		if (this.validateDigest(req, password)) {
			this.peers.push(new Peer(req, ep));
			
			resp = PacketFactory.createResponse(req, ep, "200 OK");
			resp.headers["Contact"] = req.headers["Contact"];
		}
	}

	// Invalid credentials or not authorizing
	if (!resp) {
		resp = PacketFactory.createResponse(req, ep, "401 Unauthorized");
		
		resp.headers["WWW-Authenticate"] = 'Digest realm="sip", nonce="' +
			Utils.randomHash() + '"';
	}
	
	// Send response
	this.send(resp, ep);
};

exports.validateDigest = function (req, password) {
	// Create HA1 and HA2
	var ha1 = req.authorization.username + ":" + req.authorization.realm + ":" +
		password;
	ha1 = Utils.hash(ha1);

	var ha2 = req.request.method + ":" + req.authorization.uri;
	ha2 = Utils.hash(ha2);
	
	// Create digest	
	var digest = Utils.hash(ha1 + ":" + req.authorization.nonce + ":" + ha2);

	return (req.authorization.response == digest);
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