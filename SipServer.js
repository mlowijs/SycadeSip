require("./Extensions");

var dgram = require("dgram");
var PacketFactory = require("./PacketFactory");
var Utils = require("./Utils");
var Peer = require("./Peer").Peer;
var Context = require("./Context").Context;

// Configuration files
require("./config/Dialplan.js");
Settings = require("./config/Settings.json");
Users = require("./config/Users.json");

exports.start = function (port) {
	this.peers = [];
	
	var self = this;
	this.socket = dgram.createSocket("udp4", function (data, ep) {
		// Create string from buffer
		data = data.toString().trim();
		
		// Drop useless data
		if (data.length == 0)
			return;
		
		// Parse data into request packet
		PacketFactory.parseRequest(data, function (req) {
			if (!self.findPeer(req)) {
				if (!self.authorize(req, ep)) {
					var resp = PacketFactory.createResponse(req, ep, "401 Unauthorized");
					resp.headers["To"] = req.headers["To"] + ";tag=" + Utils.randomHash();
					resp.headers["WWW-Authenticate"] = 'Digest realm="sip", nonce="' +
						Utils.randomHash() + '"';
					
					self.send(resp);
					
					return;
				}
			}
			
			switch (req.request.method) {
				case "REGISTER":
					self.registerReceived(req, ep);
					break;
				case "PUBLISH":
					self.publishReceived(req, ep);
					break;
				case "SUBSCRIBE":
					self.subscribeReceived(req, ep);
					break;
				case "INVITE":
					self.inviteReceived(req, ep);
					break;
			}
		});
	});
	
	this.socket.bind(port);
};

exports.inviteReceived = function (req, ep) {
	var iExt = req.to.extension,
		extFound = false;
	
	// Find extension and execute dialplan
	Dialplan.forEach(function (ext) {
		// Test regex or string compare
		if (ext.extension.test && ext.extension.test(iExt) || ext.extension == iExt ) {
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
	var resp = PacketFactory.createResponse(req, ep, "200 OK");
	
	resp.headers["To"] = req.headers["To"] + ";tag=" + Utils.randomHash();
	resp.headers["Expires"] = 1800;
	if (req.headers["Contact"]) // TODO: fix this
		resp.headers["Contact"] = req.headers["Contact"] + ";expires=1800";
	
	// Send response
	this.send(resp);
};

exports.authorize = function (req, ep) {
	if (req.headers["Authorization"]) {
		var password = Users[req.authorization.username];
		
		if (this.validateDigest(req, password)) {
			this.peers.push(new Peer(req));
			
			return true;
		}
	}
	
	return false;
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
	for (var i = 0; i < this.peers.length; i++) {
 		var from = this.peers[i].from;
 		
 		if (from.username == req.from.username && from.host == req.from.host
 			&& from.port == req.from.port)
 			return this.peers[i];
 	}
 	
 	return false;
};

exports.send = function (resp) {
	var self = this;
	resp.getBuffer(function (buffer) {
		self.socket.send(buffer, 0, buffer.length, resp.endPoint.port,
			resp.endPoint.address);
	});
};