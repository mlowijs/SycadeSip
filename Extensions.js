/*
 * String
 */
String.prototype.oldSplit = String.prototype.split;

String.prototype.split = function (separator, limit) {	
	var parts = this.oldSplit(separator);
	
	if (!limit)
		return parts;
	
	// Take parts that should be split
	var newParts = parts.slice(0, limit - 1);
	
	// Concat parts that should be joined
	return newParts.concat(parts.slice(limit - 1).join(separator));
};

/*
 * Function
 */
Function.prototype.isA = function (parent) {
	this.prototype = parent;
	this.prototype.constructor = this;
};