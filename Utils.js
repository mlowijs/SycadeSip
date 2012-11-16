var crypto = require("crypto");

exports.hash = function (data, algorithm) {	
	var hasher = crypto.createHash(algorithm || "md5");
	hasher.update(data);
	
	return hasher.digest("hex");
};

exports.randomHash = function (bytes) {	
	return crypto.randomBytes(bytes || 16).toString("hex");
};

exports.parseAddress = function (input) {
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