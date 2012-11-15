var Peer = function (req) {
	this.contact = req.headers["Contact"];
};

exports.Peer = Peer;