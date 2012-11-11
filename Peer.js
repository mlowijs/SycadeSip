var Peer = function (req, ep) {
	this.contact = req.headers["Contact"];
	this.endPoint = ep;
};

exports.Peer = Peer;