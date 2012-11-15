require("./Extensions");
require("./config/Dialplan.js");

var dgram = require("dgram");
var PacketFactory = require("./PacketFactory");
var Utils = require("./Utils");
var Peer = require("./Peer").Peer;
var Users = require("./config/Users.json");
var Context = require("./Context").Context;

exports.start = function (port) {
	this.peers = [];
	
	var self = this;
	this.socket = dgram.createSocket("udp4", function (data, ep) {		
		PacketFactory.parseRequest(data, function (packet) {
			if (!self.findPeer(packet) && packet.request.method != "REGISTER") {
				// 401 Unauthorized
			}
			
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
				case "INVITE":
					self.inviteReceived(packet, ep);
					break;
			}
		});
	});
	
	this.socket.bind(port);
};

exports.inviteReceived = function (req, ep) {
	var username = req.to.username,
		extFound = false;
	
	// Find extension and execute dialplan
	Dialplan.forEach(function (ext) {
		// Test regex or string compare
		if (ext.pattern.test && ext.pattern.test(username) || ext.pattern == username ) {
			// Extension found!
			extFound = true;
			
			// Send 100 Trying
			var resp = PacketFactory.createResponse(req, ep, "100 Trying");
			resp.headers["To"] = req.headers["To"];
			resp.headers["Contact"] = req.headers["Contact"];
			
			this.send(resp);
			
			// Execute dialplan
			ext.plan.call(new Context(this, req, ep));
		}
	}, this);
	
	// No extension found, send 404 Not Found
	if (!extFound) {
		var resp = PacketFactory.createResponse(req, ep, "404 Not Found");
		resp.headers["To"] = req.headers["To"];
		resp.headers["Contact"] = req.headers["Contact"];
		
		this.send(resp);
	}
};

exports.subscribeReceived = function (req, ep) {	
	var resp = PacketFactory.createResponse(req, ep, "200 OK");
	resp.headers["To"] = req.headers["To"] + ";tag=" + Utils.randomHash();
	
	this.send(resp);
};

exports.publishReceived = function (req, ep) {	
	var resp = PacketFactory.createResponse(req, ep, "489 Bad Event");
	resp.headers["To"] = req.headers["To"] + ";tag=" + Utils.randomHash();
	
	this.send(resp);
};

exports.registerReceived = function (req, ep) {
	var resp = undefined;
	
	// Authorizing
	if (req.headers["Authorization"]) {
		var password = Users[req.authorization.username];
		
		// Password correct?
		if (this.validateDigest(req, password)) {
			this.peers.push(new Peer(req));
			
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
	resp.headers["To"] = req.headers["To"] + ";tag=" + Utils.randomHash();
	this.send(resp);
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

exports.findPeer = function (req) {
	return true; // BYPASS

	// for (var i = 0; i < this.peers.length; i++) {
// 		var endPoint = this.peers[i].endPoint;
// 		
// 		if (endPoint.address == ep.address && endPoint.port == ep.port)
// 			return this.peers[i];
// 	}
// 	
// 	return false;
};

exports.send = function (resp) {
	var self = this;
	resp.getBuffer(function (buffer) {
		self.socket.send(buffer, 0, buffer.length, resp.endPoint.port,
			resp.endPoint.address);
	});
};