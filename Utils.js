var crypto = require("crypto");

exports.hash = function (data, algorithm) {	
	var hasher = crypto.createHash(algorithm || "md5");
	hasher.update(data);
	
	return hasher.digest("hex");
};

exports.randomHash = function (bytes) {	
	return crypto.randomBytes(bytes || 16).toString("hex");
};