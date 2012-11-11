var crypto = require("crypto");

exports.hash = function (data, algorithm) {
	algorithm = algorithm || "md5";
		
	var hasher = crypto.createHash(algorithm);
	hasher.update(data);
	
	return hasher.digest("hex");
};

exports.randomHash = function () {
	return crypto.randomBytes(16).toString("hex");
};