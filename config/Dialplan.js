Dialplan = [
	{
		extension: "200",
		plan: function () {
			console.log("in dialplan");
			
			// Accept the call
			this.accept();
		}
	}
];