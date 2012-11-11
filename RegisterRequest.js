var Request = require("./Request").Request;

var RegisterRequest = function (request, data, lines) {
	Request.call(this, request, data, lines);
	
	var re, matches;
	
	// Authorization
	if (this.headers["Authorization"]) {
		this.authorization = {};
		re = /(\w+)="?([^"]+)/g;
		
		while ((matches = re.exec(this.headers["Authorization"])) !== null)
			this.authorization[matches[1]] = matches[2];
	}
};

exports.RegisterRequest = RegisterRequest;