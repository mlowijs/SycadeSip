var Request = require("./Request").Request;

var InviteRequest = function (request, data, lines) {
	Request.call(this, request, data, lines);
	
	this.to = this.parseAddress(this.headers["To"]);
};

InviteRequest.prototype.parseAddress = function (input) {
	var address = /<sip:(.+)@(.+?)(?::(\d+))?(?:;(.+))?>/g.exec(input);
	
	return {
		username: address[1],
		host: address[2],
		port: address[3],
		params: address[4]
	};
};

exports.InviteRequest = InviteRequest;